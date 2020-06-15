import { Path } from '@angular-devkit/core';
import { Injectable } from '@nestjs/common';

import { TranslationDeserializationResult, TranslationDeserializer } from './deserialization';
import { TranslationSourceUnit, TranslationTarget, TranslationTargetUnit } from './models';
import { TranslationSerializer } from './serialization';
import { WorkspaceHost } from './workspace-host';

@Injectable()
export class SerializationStrategy {
  constructor(
    private readonly _host: WorkspaceHost,
    private readonly _serializer: TranslationSerializer,
    private readonly _deserializer: TranslationDeserializer
  ) {}

  async deserializeSource(
    path: Path
  ): Promise<TranslationDeserializationResult<TranslationSourceUnit>> {
    const content = await this._host.readFile(path);
    return this._deserializer.deserializeSource(content);
  }

  async deserializeTarget(
    path: Path
  ): Promise<TranslationDeserializationResult<TranslationTargetUnit>> {
    const content = await this._host.readFile(path);
    return this._deserializer.deserializeTarget(content);
  }

  async serializeTarget(target: TranslationTarget, path: Path): Promise<void> {
    const content = this._serializer.serializeTarget(target);
    await this._host.writeFile(path, content);
  }
}
