import levenshtein from 'js-levenshtein';
import { Observable, Subject } from 'rxjs';

import { TranslationSource } from './translation-source';
import { TranslationTargetOrphan } from './translation-target-orphan';
import { TranslationTargetUnit } from './translation-target-unit';

export class TranslationTarget {
  readonly changed: Observable<void>;
  readonly units: TranslationTargetUnit[];
  readonly unitMap: Map<string, TranslationTargetUnit>;
  readonly orphans: TranslationTargetOrphan[];
  readonly orphanMap: Map<string, TranslationTargetOrphan>;
  baseHref?: string;
  subPath?: string;

  private _changedSubject = new Subject<void>();

  constructor(
    readonly source: TranslationSource,
    readonly language: string,
    unitMap: Map<string, TranslationTargetUnit>,
  ) {
    this.changed = this._changedSubject.asObservable();
    this.units = this._generateTargetUnits(unitMap);
    this.unitMap = this.units.reduce(
      (current, next) => current.set(next.id, next),
      new Map<string, TranslationTargetUnit>(),
    );
    this.orphans = this._findOrphans(unitMap);
    this.orphanMap = this.orphans.reduce(
      (current, next) => current.set(next.unit.id, next),
      new Map<string, TranslationTargetOrphan>(),
    );
  }

  translateUnit(
    unit: TranslationTargetUnit,
    update: Pick<TranslationTargetUnit, 'target' | 'state'>,
  ) {
    unit.target = update.target;
    unit.state = update.state;
    this._changedSubject.next();
    return unit;
  }

  migrateOrphan(orphan: TranslationTargetOrphan, targetUnit: TranslationTargetUnit) {
    if (this.orphanMap.has(orphan.unit.id)) {
      this.translateUnit(targetUnit, orphan.unit);
      this.deleteOrphan(orphan);
    }
  }

  deleteOrphan(orphan: TranslationTargetOrphan) {
    if (this.orphanMap.delete(orphan.unit.id)) {
      const index = this.orphans.indexOf(orphan);
      this.orphans.splice(index, 1);
      this._changedSubject.next();
    }
  }

  private _generateTargetUnits(
    unitMap: Map<string, TranslationTargetUnit>,
  ): TranslationTargetUnit[] {
    return this.source.units.map(
      (u) =>
        unitMap.get(u.id) || {
          id: u.id,
          source: u.source,
          state: 'initial',
          target: '',
        },
    );
  }

  private _findOrphans(unitMap: Map<string, TranslationTargetUnit>) {
    return Array.from(unitMap.values())
      .filter((u) => !this.source.unitMap.has(u.id))
      .map((o) => this._generateOrphan(o));
  }

  private _generateOrphan(orphan: TranslationTargetUnit): TranslationTargetOrphan {
    const similar = this.units
      .map((unit) => ({
        distance: this._calculateDistance(unit, orphan),
        unit,
      }))
      .sort((a, b) => a.distance - b.distance);
    return {
      unit: orphan,
      similar,
    };
  }

  private _calculateDistance(a: TranslationTargetUnit, b: TranslationTargetUnit) {
    const sourceA = this._normalizeWhitespace(a.source);
    const sourceB = this._normalizeWhitespace(b.source);
    return levenshtein(sourceA, sourceB);
  }

  private _normalizeWhitespace(value: string) {
    return value.replace(/\s+/g, ' ').trim();
  }
}
