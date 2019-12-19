import { logging } from '@angular-devkit/core';
import { Subject } from 'rxjs';
import { debounceTime, map, switchMap } from 'rxjs/operators';

import { TranslationSerializer } from './serialization/translation-serializer';
import { TranslationContextConfiguration } from './translation-context-configuration';
import { TranslationSource } from './translation-source';
import { TranslationTarget } from './translation-target';
import { TranslationTargetUnit } from './translation-target-unit';

export class TranslationContext {
  readonly source: TranslationSource;

  private readonly _serializer: TranslationSerializer;
  private readonly _targets: Map<string, TranslationTarget>;
  private readonly _options: {
    encoding: string;
    original: string;
    includeContextInTarget: boolean;
  };
  private readonly _filenameFactory: (target: TranslationTarget) => string;
  private readonly _serializeScheduler = new Map<string, Subject<void>>();

  get languages() {
    return Array.from(this._targets.keys()).sort();
  }

  constructor(
    private readonly _logger: logging.LoggerApi,
    configuration: TranslationContextConfiguration
  ) {
    this._serializer = configuration.serializer;
    this.source = configuration.source;
    this._targets = configuration.targets;
    this._filenameFactory = configuration.filenameFactory;
    this._options = { ...configuration };
  }

  target(language: string) {
    return this._targets.get(language);
  }

  async createTarget(language: string) {
    if (this._targets.has(language)) {
      throw new Error(`${language} already exists as target!`);
    }

    const target = new TranslationTarget(this.source, language);
    const file = await this._serialize(target);
    this._logger.info(`${this._timestamp()}: Created ${file}`);
    this._targets.set(language, target);
    return target;
  }

  async updateTranslation(language: string, unit: TranslationTargetUnit) {
    const target = this._targets.get(language) || (await this.createTarget(language));
    const existingUnit = target.unitMap.get(unit.id);
    if (!existingUnit) {
      throw new Error(`Unit with id ${unit.id} does not exist for language ${language}!`);
    }

    existingUnit.target = unit.target;
    existingUnit.state = unit.state;
    this._scheduleSerialization(language);
    return existingUnit;
  }

  private _scheduleSerialization(language: string) {
    const subject = this._serializeScheduler.get(language) || this._createScheduler(language);
    subject.next();
  }

  private _createScheduler(language: string) {
    const subject = new Subject<void>();
    subject
      .pipe(
        debounceTime(500),
        map(() => this._targets.get(language)!),
        switchMap(t => this._serialize(t))
      )
      .subscribe(f => this._logger.info(`${this._timestamp()}: Updated ${f}`));
    this._serializeScheduler.set(language, subject);
    return subject;
  }

  private async _serialize(target: TranslationTarget) {
    const file = this._filenameFactory(target);
    await this._serializer.serializeTarget(file, target, this._options);
    return file;
  }

  private _timestamp() {
    const now = new Date();
    const pad = (value: number) => value.toString().padStart(2, '0');
    const date = [now.getFullYear(), now.getMonth() + 1, now.getDate()].map(pad).join('-');
    const time = [now.getHours(), now.getMinutes(), now.getSeconds()].map(pad).join(':');
    return `${date} ${time}`;
  }
}
