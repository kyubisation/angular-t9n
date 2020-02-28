import { DebounceScheduler } from './debounce-scheduler';
import { TranslationOrphan, TranslationTargetUnit } from './models';
import { PersistanceStrategy } from './persistance';

export class TranslationContext {
  private readonly _serializeScheduler: DebounceScheduler<string>;

  get languages() {
    return Array.from(this._persistanceStrategy.targets.keys());
  }

  get source() {
    return this._persistanceStrategy.source;
  }

  constructor(
    readonly project: string,
    readonly sourceFile: string,
    private readonly _persistanceStrategy: PersistanceStrategy
  ) {
    this._serializeScheduler = new DebounceScheduler<string>(
      async language =>
        await this._persistanceStrategy.update(this._persistanceStrategy.targets.get(language)!)
    );
  }

  target(language: string) {
    return this._persistanceStrategy.targets.get(language);
  }

  async createTarget(language: string) {
    if (this.target(language)) {
      throw new Error(`${language} already exists as target!`);
    }

    return await this._persistanceStrategy.create(language);
  }

  updateTranslation(language: string, unit: TranslationTargetUnit) {
    const target = this.target(language);
    if (!target) {
      throw new Error(`No target for language ${language}!`);
    }

    const existingUnit = target.unitMap.get(unit.id);
    if (!existingUnit) {
      throw new Error(`Unit with id ${unit.id} does not exist for language ${language}!`);
    }

    existingUnit.target = unit.target;
    existingUnit.state = unit.state;
    this._serializeScheduler.schedule(language);
    return existingUnit;
  }

  removeOrphan(language: string, orphan: TranslationOrphan) {
    const target = this.target(language);
    if (!target) {
      throw new Error(`No target for language ${language}!`);
    }

    const index = target.orphans.indexOf(orphan);
    if (index < 0) {
      throw new Error(`Orphan with id ${orphan.unit.id} does not exist for language ${language}!`);
    }

    target.orphans.splice(index, 1);
    this._serializeScheduler.schedule(language);
  }
}
