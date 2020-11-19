import { Injectable } from '@nestjs/common';

import {
  PersistenceStrategy,
  SerializationStrategy,
  TargetPathBuilder,
  timestamp,
  TranslationTarget,
} from '../server';

@Injectable()
export class PatternPersistenceStrategy extends PersistenceStrategy {
  constructor(
    private readonly _targetPathBuilder: TargetPathBuilder,
    private readonly _serializationStrategy: SerializationStrategy
  ) {
    super();
  }

  async create(target: TranslationTarget): Promise<void> {
    await this._write(target);
    console.log(
      `${timestamp()}: Created translation file for ${
        target.language
      } at ${this._targetPathBuilder.createPath(target)}`
    );
  }

  async update(target: TranslationTarget): Promise<void> {
    await this._write(target);
    console.log(
      `${timestamp()}: Updated translation file for ${
        target.language
      } at ${this._targetPathBuilder.createPath(target)}`
    );
  }

  private async _write(target: TranslationTarget): Promise<void> {
    const filePath = this._targetPathBuilder.createPath(target);
    await this._serializationStrategy.serializeTarget(target, filePath);
  }
}
