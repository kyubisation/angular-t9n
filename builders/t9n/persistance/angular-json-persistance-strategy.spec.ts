import { join, logging, normalize, workspaces } from '@angular-devkit/core';
import { workspace } from '@angular-devkit/core/src/experimental';
import { SimpleMemoryHost } from '@angular-devkit/core/src/virtual-fs/host';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import { Xlf2Deserializer, XmlParser } from '../deserialization';
import { TranslationSource } from '../models';
import { Xlf2Serializer } from '../serialization';
import { SerializationStrategy } from '../serialization-strategy';

import { AngularI18n } from './angular-i18n';
import { AngularJsonI18n } from './angular-json-i18n';
import { AngularJsonPersistanceStrategy } from './angular-json-persistance-strategy';
import { TargetPathBuilder } from './target-path-builder';
import { TranslationTargetRegistry } from './translation-target-registry';

jest.useFakeTimers();
const workspaceRoot = normalize(__dirname);

describe('AngularJsonPersistanceStrategy', () => {
  it('should have a source', async () => {
    const [persistanceStrategy] = await createPersistance();
    expect(persistanceStrategy.languages()).toEqual([]);
  });

  it('should create target', async () => {
    const [persistanceStrategy, source] = await createPersistance();
    const target = await persistanceStrategy.create('de');
    expect(target.language).toEqual('de');
    expect(target.baseHref).toBeUndefined();
    expect(target.units.map((u) => u.id)).toEqual(source.units.map((u) => u.id));
  });

  it('should create target with baseHref', async () => {
    const [persistanceStrategy, source] = await createPersistance();
    const target = await persistanceStrategy.create('de', '/de/');
    expect(target.language).toEqual('de');
    expect(target.baseHref).toEqual('/de/');
    expect(target.units.map((u) => u.id)).toEqual(source.units.map((u) => u.id));
  });

  it('should get target', async () => {
    const [persistanceStrategy, source] = await createPersistance();
    await persistanceStrategy.create('de');
    const target = persistanceStrategy.get('de')!;
    expect(target.language).toEqual('de');
    expect(target.units.map((u) => u.id)).toEqual(source.units.map((u) => u.id));
  });

  it('should throw on attempting to create existing target', async () => {
    expect.assertions(1);
    const [persistanceStrategy] = await createPersistance();
    await persistanceStrategy.create('de');
    expect(persistanceStrategy.create('de')).rejects.toThrow('Language de already exists!');
  });

  it('should update a target', async () => {
    const [persistanceStrategy] = await createPersistance();
    const target = await persistanceStrategy.create('de');
    const spy = jest.spyOn(persistanceStrategy, '_update' as any);
    persistanceStrategy.update(target);
    jest.advanceTimersByTime(600);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

async function createPersistance(
  hostConfig: (host: workspaces.WorkspaceHost) => Promise<void> = async (h) =>
    await createAngularJson(h)
): Promise<[AngularJsonPersistanceStrategy, TranslationSource]> {
  const sourceFile = join(workspaceRoot, 'messages.xlf');
  const targetDirectory = join(workspaceRoot, 'locales');
  const memoryHost = new SimpleMemoryHost();
  const host = workspaces.createWorkspaceHost(memoryHost);
  await hostConfig(host);
  host.writeFile(
    sourceFile,
    readFileSync(resolve(__dirname, '../../../test/xlf2/messages.xlf'), 'utf8')
  );
  const serializer = new Xlf2Serializer({ includeContextInTarget: false });
  const deserializer = new Xlf2Deserializer(new XmlParser());
  const serializationStrategy = new SerializationStrategy(host, serializer, deserializer);
  const result = await serializationStrategy.deserializeSource(sourceFile);
  const source = new TranslationSource(result.language, result.unitMap);
  const targetPathBuilder = new TargetPathBuilder(targetDirectory, sourceFile);
  const angularI18n = new AngularI18n(host, workspaceRoot, 'example', targetPathBuilder);
  return [
    new AngularJsonPersistanceStrategy(
      source,
      new TranslationTargetRegistry(),
      angularI18n,
      new logging.NullLogger(),
      targetPathBuilder,
      serializationStrategy
    ),
    source,
  ];
}

async function createAngularJson(host: workspaces.WorkspaceHost, i18n?: AngularJsonI18n) {
  await host.writeFile(
    join(workspaceRoot, 'angular.json'),
    JSON.stringify({
      version: 1,
      projects: {
        example: {
          projectType: 'application',
          root: '',
          prefix: 'app',
          ...(i18n ? { i18n } : undefined),
        },
      },
    } as workspace.WorkspaceSchema)
  );
}
