import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { json } from '@angular-devkit/core';
import { existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { basename, dirname, extname, join, resolve } from 'path';

import { Schema as Options } from './schema';
import { TranslationServer } from './server';
import { TranslationFactory } from './translation';

export * from './server';
export * from './translation';
export { Schema as t9nOptions } from './schema';

export default createBuilder<Options & json.JsonObject, BuilderOutput>(t9n);

export async function t9n(options: Options, context: BuilderContext): Promise<BuilderOutput> {
  const translationFile = join(context.workspaceRoot, options.translationFile);
  const targetTranslationPath = options.targetTranslationPath
    ? join(context.workspaceRoot, options.targetTranslationPath)
    : join(context.workspaceRoot, dirname(options.translationFile));
  if (!isFile(translationFile)) {
    return { success: false, error: `${options.translationFile} does not exist or is not a file!` };
  } else if (!existsSync(targetTranslationPath)) {
    mkdirSync(targetTranslationPath, { recursive: true });
  } else if (!isDirectory(targetTranslationPath)) {
    return { success: false, error: `${options.targetTranslationPath} is not a valid directory!` };
  }

  const targetFilePattern = createTargetFilePattern(options.translationFile);
  const targetFiles = readdirSync(targetTranslationPath).filter(
    f => targetFilePattern.test(f) && isFile(join(targetTranslationPath, f))
  );
  if (targetFiles.length) {
    context.logger.info(
      `Found translation target files in ${targetTranslationPath}:\n${targetFiles
        .map(f => ` - ${f}`)
        .join('\n')}\n`
    );
  } else {
    context.logger.info(`No target translation files found with pattern ${targetFilePattern}`);
  }

  const translationContext = await TranslationFactory.createTranslationContext({
    logger: context.logger,
    project: context.target ? context.target.project : 'unknown',
    sourceFile: translationFile,
    targetPath: targetTranslationPath,
    targets: targetFiles.map(f => join(targetTranslationPath, f)),
    includeContextInTarget: options.includeContextInTarget
  });
  const appPath = resolve(__dirname, '../../app');
  const server = new TranslationServer(context.logger, translationContext, appPath);
  server.listen(options.port, () =>
    context.logger.info(`Translation server started: http://localhost:${options.port}\n`)
  );

  return new Promise(() => {});
}

function isFile(path: string) {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

function isDirectory(path: string) {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

function createTargetFilePattern(sourceName: string) {
  const filename = basename(sourceName);
  const extension = extname(filename);
  return new RegExp(
    `^${filename.substring(
      0,
      filename.length - extension.length
    )}\\.[a-zA-Z0-9-_]+\\.${extension.substring(1)}$`
  );
}
