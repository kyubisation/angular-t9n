import { logging } from '@angular-devkit/core';
import { Injectable } from '@nestjs/common';

import {
  PersistenceStrategy,
  SerializationStrategy,
  timestamp,
  TranslationTarget,
} from '../../../server';

import { AngularI18n } from './angular-i18n';

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
      `${timestamp()}: Created translation file for ${
        target.language
      } at ${this._i18n.projectRelativePath(target)}`
    );
  }

  async update(target: TranslationTarget): Promise<void> {
    await this._write(target);
    this._logger.info(
      `${timestamp()}: Updated translation file for ${
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
}
