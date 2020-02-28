import levenshtein from 'js-levenshtein';

import { TranslationOrphan } from './translation-orphan';
import { TranslationSource } from './translation-source';
import { TranslationTargetUnit } from './translation-target-unit';

export class TranslationTarget {
  readonly units: TranslationTargetUnit[];
  readonly unitMap: Map<string, TranslationTargetUnit>;
  readonly orphans: TranslationOrphan[];
  baseHref?: string;

  constructor(
    readonly source: TranslationSource,
    readonly language: string,
    unitMap = new Map<string, TranslationTargetUnit>()
  ) {
    this.units = this._generateTargetUnits(unitMap);
    this.unitMap = this.units.reduce(
      (current, next) => current.set(next.id, next),
      new Map<string, TranslationTargetUnit>()
    );
    this.orphans = this._findOrphans(unitMap);
  }

  private _findOrphans(unitMap: Map<string, TranslationTargetUnit>) {
    return Array.from(unitMap.values())
      .filter(u => !this.source.unitMap.has(u.id))
      .map(o => this._generateOrphan(o));
  }

  private _generateOrphan(orphan: TranslationTargetUnit): TranslationOrphan {
    const similar = this.units
      .map(unit => ({
        distance: this._calculateDistance(unit, orphan),
        unit
      }))
      .sort((a, b) => a.distance - b.distance);
    return {
      unit: orphan,
      similar
    };
  }

  private _calculateDistance(a: TranslationTargetUnit, b: TranslationTargetUnit) {
    const sourceA = a.source.replace(/\s+/g, ' ').trim();
    const sourceB = b.source.replace(/\s+/g, ' ').trim();
    return levenshtein(sourceA, sourceB);
  }

  private _generateTargetUnits(
    unitMap: Map<string, TranslationTargetUnit>
  ): TranslationTargetUnit[] {
    return this.source.units.map(
      u =>
        unitMap.get(u.id) || {
          id: u.id,
          source: u.source,
          state: 'initial',
          target: ''
        }
    );
  }
}
