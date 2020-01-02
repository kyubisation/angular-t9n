import { logging } from '@angular-devkit/core';

import { DebounceScheduler } from './debounce-scheduler';
import { TranslationSerializer } from './serialization/translation-serializer';
import { TranslationContextConfiguration } from './translation-context-configuration';
import { TranslationSource } from './translation-source';
import { TranslationTarget } from './translation-target';
import { TranslationTargetUnit } from './translation-target-unit';

export class TranslationContext {
  readonly project: string;
  readonly source: TranslationSource;
  readonly sourceFile: string;

  private readonly _logger: logging.LoggerApi;
  private readonly _serializer: TranslationSerializer;
  private readonly _targets: Map<string, TranslationTarget>;
  private readonly _options: {
    encoding: string;
    original: string;
    includeContextInTarget: boolean;
  };
  private readonly _filenameFactory: (language: string) => string;
  private readonly _serializeScheduler: DebounceScheduler<string>;

  get languages() {
    return Array.from(this._targets.keys()).sort();
  }

  constructor(configuration: TranslationContextConfiguration) {
    this.project = configuration.project;
    this.source = configuration.source;
    this.sourceFile = configuration.sourceFile;
    this._logger = configuration.logger;
    this._serializer = configuration.serializer;
    this._targets = configuration.targets;
    this._filenameFactory = configuration.filenameFactory;
    this._options = { ...configuration };
    this._serializeScheduler = new DebounceScheduler<string>(async language => {
      const target = this._targets.get(language)!;
      await this._serializer.serializeTarget(target, this._options);
      this._logger.info(`${this._timestamp()}: Updated ${target.file}`);
    });
  }

  target(language: string) {
    return this._targets.get(language);
  }

  async createTarget(language: string) {
    if (this._targets.has(language)) {
      throw new Error(`${language} already exists as target!`);
    }

    const target = new TranslationTarget(this.source, this._filenameFactory(language), language);
    await this._serializer.serializeTarget(target, this._options);
    this._logger.info(`${this._timestamp()}: Created ${target.file}`);
    this._targets.set(language, target);
    return target;
  }

  updateTranslation(language: string, unit: TranslationTargetUnit) {
    const target = this._targets.get(language);
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

  private _timestamp() {
    const now = new Date();
    const pad = (value: number) => value.toString().padStart(2, '0');
    const date = [now.getFullYear(), now.getMonth() + 1, now.getDate()].map(pad).join('-');
    const time = [now.getHours(), now.getMinutes(), now.getSeconds()].map(pad).join(':');
    return `${date} ${time}`;
  }
}
