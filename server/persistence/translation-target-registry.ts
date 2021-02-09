import { Injectable } from '@nestjs/common';
import { debounceTime } from 'rxjs/operators';

import { TranslationSource, TranslationTarget, TranslationTargetUnit } from '../models';

import { PersistenceStrategy } from './persistence-strategy';

@Injectable()
export class TranslationTargetRegistry {
  private readonly _targets: Map<string, TranslationTarget> = new Map();

  constructor(
    private readonly _source: TranslationSource,
    private readonly _persistenceStrategy: PersistenceStrategy
  ) {}

  register(language: string, units: Map<string, TranslationTargetUnit>, baseHref?: string) {
    const target = new TranslationTarget(this._source, language, units);
    if (baseHref) {
      target.baseHref = baseHref;
    }
    target.changed
      .pipe(debounceTime(300))
      .subscribe(() => this._persistenceStrategy.update(target));
    this._synchronizeSources(target);
    this._targets.set(language, target);
    return target;
  }

  async create(language: string, baseHref?: string) {
    const target = this.register(language, new Map<string, TranslationTargetUnit>(), baseHref);
    await this._persistenceStrategy.create(target);
    return target;
  }

  get(key: string): TranslationTarget | undefined {
    return this._targets.get(key);
  }

  has(key: string): boolean {
    return this._targets.has(key);
  }

  keys(): string[] {
    return Array.from(this._targets.keys());
  }

  values(): TranslationTarget[] {
    return Array.from(this._targets.values());
  }

  private _synchronizeSources(target: TranslationTarget) {
    let changeRequired = false;
    for (const unit of target.units) {
      const sourceUnit = target.source.unitMap.get(unit.id)!;
      if (unit.source !== sourceUnit.source) {
        if (
          this._normalizeWhitespace(unit.source) !== this._normalizeWhitespace(sourceUnit.source)
        ) {
          unit.state = 'initial';
        }
        unit.source = sourceUnit.source;
        changeRequired = true;
      }
    }

    if (changeRequired) {
      this._persistenceStrategy.update(target);
    }
  }

  private _normalizeWhitespace(value: string) {
    return value.replace(/\s+/g, ' ').trim();
  }
}
