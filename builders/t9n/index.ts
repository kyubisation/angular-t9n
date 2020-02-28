import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { join, json, normalize, workspaces } from '@angular-devkit/core';
import { NodeJsAsyncHost } from '@angular-devkit/core/node';
import { resolve } from 'path';

import {
  AngularJsonPersistanceStrategy,
  SerializationStrategy,
  TranslationContext,
  TranslationServer
} from '../../t9n';

import { Schema as Options } from './schema';

export { Schema as t9nOptions } from './schema';

export default createBuilder<Options & json.JsonObject, BuilderOutput>(t9n);

export async function t9n(options: Options, context: BuilderContext): Promise<BuilderOutput> {
  if (!context.target) {
    throw new Error('To run this builder context.target is required!');
  }

  const nodeHost = new NodeJsAsyncHost();
  const host = workspaces.createWorkspaceHost(nodeHost);
  const workspaceRoot = normalize(context.workspaceRoot);
  const sourceFile = join(workspaceRoot, options.translationFile);
  const targetDirectory = join(workspaceRoot, options.targetTranslationPath);
  if (!(await host.isFile(sourceFile))) {
    return { success: false, error: `${options.translationFile} does not exist or is not a file!` };
  } else if (!(await host.isDirectory(targetDirectory))) {
    return { success: false, error: `${options.targetTranslationPath} is not a valid directory!` };
  }

  const persistanceStrategy = await AngularJsonPersistanceStrategy.create({
    host,
    logger: context.logger,
    project: context.target.project,
    serializationContext: await SerializationStrategy.create(host, sourceFile, options),
    sourceFile,
    targetDirectory,
    workspaceRoot
  });

  const translationContext = new TranslationContext(
    context.target.project,
    sourceFile,
    persistanceStrategy
  );
  const appPath = resolve(__dirname, '../../app');
  const server = new TranslationServer(context.logger, translationContext, appPath);
  server.listen(options.port, () =>
    context.logger.info(`Translation server started: http://localhost:${options.port}\n`)
  );

  return new Promise(() => {});
}
