import { Path, workspaces } from '@angular-devkit/core';

import {
  TranslationDeserializationResult,
  TranslationDeserializer,
  Xlf2Deserializer,
  XlfDeserializer,
  XmlParser
} from './deserialization';
import { TranslationSourceUnit, TranslationTarget, TranslationTargetUnit } from './models';
import { TranslationSerializer, Xlf2Serializer, XlfSerializer } from './serialization';

export class SerializationStrategy {
  constructor(
    private readonly _host: workspaces.WorkspaceHost,
    private readonly _serializer: TranslationSerializer,
    private readonly _deserializer: TranslationDeserializer
  ) {}

  static async create(
    host: workspaces.WorkspaceHost,
    sourceFile: Path,
    options: { includeContextInTarget: boolean } = { includeContextInTarget: true }
  ) {
    const content = await host.readFile(sourceFile);
    const doc = new XmlParser().parse(content);
    const version = doc.documentElement.getAttribute('version');
    if (doc.documentElement.tagName !== 'xliff') {
      throw new Error('Only xliff is supported!');
    } else if (version === '2.0') {
      return new SerializationStrategy(host, new Xlf2Serializer(options), new Xlf2Deserializer());
    } else if (version === '1.2') {
      return new SerializationStrategy(host, new XlfSerializer(options), new XlfDeserializer());
    } else {
      throw new Error('Unsupported xliff version!');
    }
  }

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
