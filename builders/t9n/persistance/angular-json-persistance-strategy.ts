import { logging } from '@angular-devkit/core';
import { Injectable } from '@nestjs/common';

import { TranslationSource, TranslationTarget } from '../models';
import { SerializationStrategy } from '../serialization-strategy';

import { AngularI18n } from './angular-i18n';
import { DebounceScheduler } from './debounce-scheduler';
import { PersistanceStrategy } from './persistance-strategy';
import { TargetPathBuilder } from './target-path-builder';
import { TranslationTargetRegistry } from './translation-target-registry';

@Injectable()
export class AngularJsonPersistanceStrategy extends PersistanceStrategy {
  private readonly _serializeScheduler: DebounceScheduler<string>;

  constructor(
    private readonly _source: TranslationSource,
    private readonly _targets: TranslationTargetRegistry,
    private readonly _i18n: AngularI18n,
    private readonly _logger: logging.Logger,
    private readonly _targetPathBuilder: TargetPathBuilder,
    private readonly _serializationContext: SerializationStrategy
  ) {
    super();
    this._serializeScheduler = new DebounceScheduler<string>(async (language) => {
      const target = this.get(language)!;
      await this._update(target);
      this._logger.info(
        `${this._timestamp()}: Updated translation file for ${
          target.language
        } at ${this._targetPathBuilder.createPath(target)}`
      );
    });
  }

  languages(): string[] {
    return this._targets.keys();
  }

  get(language: string): TranslationTarget | undefined {
    return this._targets.get(language);
  }

  async create(language: string, baseHref?: string): Promise<TranslationTarget> {
    if (this._targets.has(language)) {
      throw new Error(`Language ${language} already exists!`);
    }

    const target = new TranslationTarget(this._source, language);
    if (baseHref) {
      target.baseHref = baseHref;
    }

    this._targets.set(target.language, target);
    await this._update(target);
    this._logger.info(
      `${this._timestamp()}: Created translation file for ${language} at ${this._targetPathBuilder.createPath(
        target
      )}`
    );
    return target;
  }

  async update(target: TranslationTarget): Promise<void> {
    this._serializeScheduler.schedule(target.language);
  }

  private async _update(target: TranslationTarget): Promise<void> {
    const filePath = this._targetPathBuilder.createPath(target);
    await this._serializationContext.serializeTarget(target, filePath);
    await this._updateProjectI18n();
  }

  private async _updateProjectI18n(): Promise<void> {
    await this._i18n.update(this._source, Array.from(this._targets.values()));
  }

  private _timestamp() {
    const now = new Date();
    const pad = (value: number) => value.toString().padStart(2, '0');
    const date = [now.getFullYear(), now.getMonth() + 1, now.getDate()].map(pad).join('-');
    const time = [now.getHours(), now.getMinutes(), now.getSeconds()].map(pad).join(':');
    return `${date} ${time}`;
  }
}
