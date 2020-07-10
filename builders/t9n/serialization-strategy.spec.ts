import { normalize, virtualFs, workspaces } from '@angular-devkit/core';

import { TranslationDeserializationResult, TranslationDeserializer } from './deserialization';
import { TranslationSourceUnit, TranslationTarget, TranslationTargetUnit } from './models';
import { TranslationSerializer } from './serialization';
import { SerializationStrategy } from './serialization-strategy';

describe('SerializationStrategy', () => {
  const path = normalize(__dirname);
  const expectedTargetContent = 'expected';
  const serializer: TranslationSerializer = {
    serializeTarget(_target: TranslationTarget): string {
      return expectedTargetContent;
    },
  };
  const expectedSourceResult: TranslationDeserializationResult<TranslationSourceUnit> = {
    language: 'test',
    unitMap: new Map(),
  };
  const expectedTargetResult: TranslationDeserializationResult<TranslationTargetUnit> = {
    language: 'test',
    unitMap: new Map(),
  };
  const deserializer: TranslationDeserializer = {
    deserializeSource(_content: string) {
      return expectedSourceResult;
    },
    deserializeTarget(_content: string) {
      return expectedTargetResult;
    },
  };

  let serializationStrategy: SerializationStrategy;
  let memoryHost: virtualFs.SimpleMemoryHost;
  let host: workspaces.WorkspaceHost;

  beforeEach(() => {
    memoryHost = new virtualFs.SimpleMemoryHost();
    host = workspaces.createWorkspaceHost(memoryHost);
    serializationStrategy = new SerializationStrategy(host, serializer, deserializer);
  });

  it('should deserialize source', async () => {
    await host.writeFile(path, '');
    const result = await serializationStrategy.deserializeSource(path);
    expect(result).toEqual(expectedSourceResult);
  });

  it('should deserialize target', async () => {
    await host.writeFile(path, '');
    const result = await serializationStrategy.deserializeTarget(path);
    expect(result).toEqual(expectedTargetResult);
  });

  it('should serialize target', async () => {
    await serializationStrategy.serializeTarget({} as any, path);
    const content = await host.readFile(path);
    expect(content).toEqual(expectedTargetContent);
  });
});
