import { join, logging, normalize, workspaces } from '@angular-devkit/core';
import { workspace } from '@angular-devkit/core/src/experimental';
import { SimpleMemoryHost } from '@angular-devkit/core/src/virtual-fs/host';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import { SerializationStrategy } from '../serialization-strategy';

import { AngularJsonI18n } from './angular-json-i18n';
import { AngularJsonPersistanceStrategy } from './angular-json-persistance-strategy';

const workspaceRoot = normalize(__dirname);

describe('SerializationResolver', () => {
  it('should have a source', async () => {
    const persistanceStrategy = await createPersistance(
      async (host) => await createAngularJson(host)
    );
    expect(persistanceStrategy.source.language).toEqual('en');
    expect(persistanceStrategy.source.units.length).toEqual(2);
  });
});

async function createPersistance(hostConfig: (host: workspaces.WorkspaceHost) => Promise<void>) {
  const sourceFile = join(workspaceRoot, 'messages.xlf');
  const targetDirectory = join(workspaceRoot, 'locales');
  const memoryHost = new SimpleMemoryHost();
  const host = workspaces.createWorkspaceHost(memoryHost);
  await hostConfig(host);
  host.writeFile(
    sourceFile,
    readFileSync(resolve(__dirname, '../../test/xlf2/messages.xlf'), 'utf8')
  );
  const serializationContext = await SerializationStrategy.create(host, sourceFile);
  return await AngularJsonPersistanceStrategy.create({
    logger: new logging.NullLogger(),
    serializationContext,
    host,
    project: 'example',
    workspaceRoot,
    sourceFile,
    targetDirectory,
  });
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
