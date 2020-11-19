import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { join, json, logging, normalize, relative, workspaces } from '@angular-devkit/core';
import { NodeJsAsyncHost } from '@angular-devkit/core/node';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { dirname } from 'path';

import {
  AppModule,
  PersistenceStrategy,
  SerializationOptions,
  SerializationStrategy,
  TargetInfo,
  TargetPathBuilder,
  TranslationDeserializer,
  TranslationSerializer,
  TranslationSource,
  TranslationTarget,
  TranslationTargetRegistry,
  WorkspaceHost,
  Xlf2Deserializer,
  Xlf2Serializer,
  XlfDeserializer,
  XlfSerializer,
  XmlParser,
} from '../../server';

import { AngularI18n, AngularJsonPersistenceStrategy } from './persistence';
import { Schema as Options } from './schema';

export * from '../../server';
export * from './persistence';
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
  const targetTranslationPath = options.targetTranslationPath || dirname(options.translationFile);
  const targetDirectory = join(workspaceRoot, targetTranslationPath);
  if (!(await host.isFile(sourceFile))) {
    return { success: false, error: `${options.translationFile} does not exist or is not a file!` };
  } else if (!(await host.isDirectory(targetDirectory))) {
    return {
      success: false,
      error: `targetTranslationPath ${targetTranslationPath} is not a valid directory!`,
    };
  }

  const xliffVersion = await detectXliffVersion();
  context.logger.info(`Detected version ${xliffVersion} of XLIFF`);
  const targetPathBuilder = new TargetPathBuilder(targetDirectory, sourceFile);
  let translationContext: {
    source: TranslationSource;
    targetRegistry: TranslationTargetRegistry;
  } = null!;
  const angularI18n = new AngularI18n(
    host,
    workspaceRoot,
    context.target.project,
    targetPathBuilder,
    () => translationContext
  );
  const sourceLocale = await angularI18n.sourceLocale();

  context.logger.info(`Loading translations. Depending on the amount, this might take a moment.`);
  const app = await NestFactory.create(
    AppModule.forRoot([
      { provide: logging.Logger, useValue: context.logger.createChild('NestJS') },
      { provide: WorkspaceHost, useValue: host },
      {
        provide: TargetInfo,
        useValue: new TargetInfo(
          context.target.project,
          options.translationFile,
          sourceLocale.code
        ),
      },
      { provide: SerializationOptions, useValue: options },
      { provide: TargetPathBuilder, useValue: targetPathBuilder },
      { provide: AngularI18n, useValue: angularI18n },
      {
        provide: TranslationDeserializer,
        useExisting: xliffVersion === '1.2' ? XlfDeserializer : Xlf2Deserializer,
      },
      {
        provide: TranslationSerializer,
        useExisting: xliffVersion === '1.2' ? XlfSerializer : Xlf2Serializer,
      },
      {
        provide: TranslationSource,
        useFactory: TRANSLATION_SOURCE_FACTORY,
        inject: [SerializationStrategy],
      },
      {
        provide: TranslationTargetRegistry,
        useFactory: TRANSLATION_TARGET_REGISTRY_FACTORY,
        inject: [TranslationSource, SerializationStrategy, PersistenceStrategy],
      },
      { provide: PersistenceStrategy, useClass: AngularJsonPersistenceStrategy },
    ]),
    {
      cors: true,
      logger: ['error', 'warn'],
    }
  );
  app.setGlobalPrefix('api');
  app.useWebSocketAdapter(new WsAdapter(app));
  app.useGlobalPipes(new ValidationPipe({ skipMissingProperties: true, whitelist: true }));
  await app.listen(options.port ?? 4300, () =>
    context.logger.info(`Translation server started: http://localhost:${options.port}\n`)
  );
  return new Promise(() => {});

  async function detectXliffVersion(): Promise<'2.0' | '1.2'> {
    const content = await host.readFile(sourceFile);
    const doc = new XmlParser().parse(content);
    const version = doc.documentElement.getAttribute('version');
    if (doc.documentElement.tagName !== 'xliff') {
      throw new Error('Only xliff is supported!');
    } else if (version !== '2.0' && version !== '1.2') {
      throw new Error('Unsupported xliff version!');
    } else {
      return version;
    }
  }

  async function TRANSLATION_SOURCE_FACTORY(
    serializationStrategy: SerializationStrategy
  ): Promise<TranslationSource> {
    const result = await serializationStrategy.deserializeSource(sourceFile);
    if (result.language && sourceLocale.code && result.language !== sourceLocale.code) {
      context.logger.warn(
        `Source locale in angular.json is ${sourceLocale} but in the ` +
          ` source file ${sourceFile} it is ${result.language}.`
      );
    }

    const source = new TranslationSource(sourceLocale.code || result.language, result.unitMap);
    if (sourceLocale.baseHref) {
      source.baseHref = sourceLocale.baseHref;
    }

    return source;
  }

  async function TRANSLATION_TARGET_REGISTRY_FACTORY(
    source: TranslationSource,
    serializationStrategy: SerializationStrategy,
    persistenceStrategy: PersistenceStrategy
  ): Promise<TranslationTargetRegistry> {
    const targetRegistry = new TranslationTargetRegistry(source, persistenceStrategy);
    const locales = await angularI18n.locales();
    await Promise.all(
      Object.keys(locales).map(async (language) => {
        const locale = locales[language];
        const normalizedPath = normalize(targetPathBuilder.createPath(language));
        const relativePath = relative(workspaceRoot, normalizedPath);
        if (locale.translation.every((t) => join(workspaceRoot, t) !== normalizedPath)) {
          context.logger.warn(
            `Expected translation file ${relativePath} not found listed in i18n! It will be created and added to the i18n entry.`
          );
          const target = await targetRegistry.create(language, locale.baseHref);
          await importExistingTranslationUnits(target, locale.translation, serializationStrategy);
        } else if (!host.isFile(normalizedPath)) {
          context.logger.warn(
            `Expected translation file ${relativePath} does not exist! It will be created.`
          );
          await targetRegistry.create(language, locale.baseHref);
        } else {
          const result = await serializationStrategy.deserializeTarget(normalizedPath);
          targetRegistry.register(result.language, result.unitMap, locale.baseHref);
        }
      })
    );

    translationContext = { source, targetRegistry };
    await angularI18n.update();
    return targetRegistry;
  }

  async function importExistingTranslationUnits(
    target: TranslationTarget,
    translationFiles: string[],
    serializationStrategy: SerializationStrategy
  ) {
    for (const translation of translationFiles) {
      const targetPath = join(workspaceRoot, translation);
      const result = await serializationStrategy.deserializeTarget(targetPath);
      result.unitMap.forEach((unit, key) => {
        const targetUnit = target.unitMap.get(key);
        if (targetUnit) {
          target.translateUnit(targetUnit, unit);
        }
      });
    }
  }
}
