import { logging } from '@angular-devkit/core';
import { Injectable } from '@nestjs/common';

import { TranslationTarget } from '../models';
import { SerializationStrategy } from '../serialization-strategy';

import { AngularI18n } from './angular-i18n';
import { PersistenceStrategy } from './persistence-strategy';

@Injectable()
export class AngularJsonPersistenceStrategy extends PersistenceStrategy {
  constructor(
    private readonly _i18n: AngularI18n,
    private readonly _logger: logging.Logger,
    private readonly _serializationStrategy: SerializationStrategy
  ) {
    super();
  }

  async create(target: TranslationTarget): Promise<void> {
    await this._write(target);
    this._logger.info(
      `${this._timestamp()}: Created translation file for ${
        target.language
      } at ${this._i18n.projectRelativePath(target)}`
    );
  }

  async update(target: TranslationTarget): Promise<void> {
    await this._write(target);
    this._logger.info(
      `${this._timestamp()}: Updated translation file for ${
        target.language
      } at ${this._i18n.projectRelativePath(target)}`
    );
  }

  private async _write(target: TranslationTarget): Promise<void> {
    const filePath = this._i18n.projectRelativePath(target);
    await this._serializationStrategy.serializeTarget(target, filePath);
    await this._updateProjectI18n();
  }

  private async _updateProjectI18n(): Promise<void> {
    await this._i18n.update();
  }

  private _timestamp() {
    const now = new Date();
    const pad = (value: number) => value.toString().padStart(2, '0');
    const date = [now.getFullYear(), now.getMonth() + 1, now.getDate()].map(pad).join('-');
    const time = [now.getHours(), now.getMinutes(), now.getSeconds()].map(pad).join(':');
    return `${date} ${time}`;
  }
}
