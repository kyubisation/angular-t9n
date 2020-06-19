import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { join, json, logging, normalize, relative, workspaces } from '@angular-devkit/core';
import { NodeJsAsyncHost } from '@angular-devkit/core/node';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { dirname } from 'path';

import { AppModule } from './app.module';
import {
  TranslationDeserializer,
  Xlf2Deserializer,
  XlfDeserializer,
  XmlParser,
} from './deserialization';
import { TranslationSource, TranslationTarget } from './models';
import {
  AngularI18n,
  AngularJsonPersistanceStrategy,
  PersistanceStrategy,
  TargetPathBuilder,
  TranslationTargetRegistry,
} from './persistance';
import { Schema as Options } from './schema';
import {
  SerializationOptions,
  TranslationSerializer,
  Xlf2Serializer,
  XlfSerializer,
} from './serialization';
import { SerializationStrategy } from './serialization-strategy';
import { TargetInfo } from './target-info';
import { WorkspaceHost } from './workspace-host';

export * from './app.module';
export * from './controllers';
export * from './deserialization';
export * from './link-helper';
export * from './models';
export * from './persistance';
export * from './serialization';
export * from './serialization-strategy';
export * from './target-info';
export * from './workspace-host';
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
  const targetPathBuilder = new TargetPathBuilder(targetDirectory, sourceFile);
  const angularI18n = new AngularI18n(
    host,
    workspaceRoot,
    context.target.project,
    targetPathBuilder
  );
  const sourceLocale = await angularI18n.sourceLocale();

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
        inject: [TranslationSource, SerializationStrategy],
      },
      { provide: PersistanceStrategy, useClass: AngularJsonPersistanceStrategy },
    ]),
    {
      cors: true,
      logger: ['error', 'warn'],
    }
  );
  app.setGlobalPrefix('api');
  app.useWebSocketAdapter(new WsAdapter(app));
  app.useGlobalPipes(new ValidationPipe({ skipMissingProperties: true, whitelist: true }));
  await app.listen(options.port, () =>
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
    serializationStrategy: SerializationStrategy
  ): Promise<TranslationTargetRegistry> {
    const locales = await angularI18n.locales();
    const targets = await Promise.all(
      Object.keys(locales).map(async (language) => {
        const locale = locales[language];
        const targetPath = join(workspaceRoot, locale.translation);
        const result = await serializationStrategy.deserializeTarget(targetPath);
        const target = new TranslationTarget(source, result.language, result.unitMap);
        if (locale.baseHref) {
          target.baseHref = locale.baseHref;
        }

        const normalizedPath = targetPathBuilder.createPath(target);
        if (targetPath !== normalizedPath) {
          context.logger.info(
            `Normalizing path for ${target.language}\n => Moving ${relative(
              workspaceRoot,
              targetPath
            )} to ${relative(workspaceRoot, normalizedPath)}`
          );
          await nodeHost.rename(targetPath, normalizedPath).toPromise();
        }

        return target;
      })
    );
    await angularI18n.update(source, targets);
    return targets.reduce(
      (current, next) => current.set(next.language, next),
      new TranslationTargetRegistry()
    );
  }
}
