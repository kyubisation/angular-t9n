import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join, relative, resolve } from 'path';

import {
  AppModule,
  Options,
  PersistenceStrategy,
  SerializationOptions,
  SerializationStrategy,
  TargetInfo,
  TargetPathBuilder,
  TranslationDeserializer,
  TranslationSerializer,
  TranslationSource,
  TranslationTargetRegistry,
  WorkspaceHost,
  Xlf2Deserializer,
  Xlf2Serializer,
  XlfDeserializer,
  XlfSerializer,
  XmlParser,
} from '../server';

import { AsyncWorkspaceHost } from './async-workspace-host';
import { PatternPersistenceStrategy } from './pattern-persistence-strategy';

export function init(name: string = 't9n.conf.json') {
  name = name.endsWith('.json') ? name : `${name}.json`;
  const options: Options & { $schema: string } = {
    $schema: 'https://github.com/kyubisation/angular-t9n/blob/master/tslint.json',
    translationFile: 'messages.xlf',
    targetTranslationPath: '',
    includeContextInTarget: false,
    port: 4300,
  };
  writeFileSync(join(process.cwd(), name), JSON.stringify(options, null, 2), 'utf8');
}

export async function runT9nStandalone(configFile: string) {
  const configFilePath = resolve(configFile);
  let config: Options;
  try {
    const content = readFileSync(configFilePath, 'utf8');
    config = JSON.parse(content);
  } catch (e) {
    throw new Error(`Unable to parse file ${configFilePath}`);
  }

  await t9nStandalone(config);
}

export async function t9nStandalone(options: Options, currentWorkingDirectory?: string) {
  const host = new AsyncWorkspaceHost();
  const workspaceRoot = resolve(currentWorkingDirectory || process.cwd());
  const sourceFile = join(workspaceRoot, options.translationFile);
  const targetTranslationPath = options.targetTranslationPath || dirname(options.translationFile);
  const targetDirectory = join(workspaceRoot, targetTranslationPath);
  if (!(await host.isFile(sourceFile))) {
    throw new Error(`${options.translationFile} does not exist or is not a file!`);
  } else if (!(await host.isDirectory(targetDirectory))) {
    throw new Error(`targetTranslationPath ${targetTranslationPath} is not a valid directory!`);
  }

  const xliffVersion = await detectXliffVersion();
  console.log(`Detected version ${xliffVersion} of XLIFF`);
  const targetPathBuilder = new TargetPathBuilder(targetDirectory, sourceFile);

  console.log(`Loading translations. Depending on the amount, this might take a moment.`);
  const app = await NestFactory.create(
    AppModule.forRoot([
      { provide: TargetPathBuilder, useValue: targetPathBuilder },
      { provide: WorkspaceHost, useValue: host },
      {
        provide: TargetInfo,
        useFactory: (source: TranslationSource) =>
          new TargetInfo('-', options.translationFile, source.language),
        inject: [TranslationSource],
      },
      { provide: SerializationOptions, useValue: options },
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
      { provide: PersistenceStrategy, useClass: PatternPersistenceStrategy },
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
    console.log(`Translation server started: http://localhost:${options.port}\n`)
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
    return new TranslationSource(result.language, result.unitMap);
  }

  async function TRANSLATION_TARGET_REGISTRY_FACTORY(
    source: TranslationSource,
    serializationStrategy: SerializationStrategy,
    persistenceStrategy: PersistenceStrategy
  ): Promise<TranslationTargetRegistry> {
    const targetRegistry = new TranslationTargetRegistry(source, persistenceStrategy);
    await Promise.all(
      readdirSync(targetDirectory, { withFileTypes: true })
        .filter((d) => d.isFile())
        .map(async (d) => {
          const targetPath = join(targetDirectory, d.name);
          if (sourceFile === targetPath) {
            return;
          }

          try {
            const result = await serializationStrategy.deserializeTarget(targetPath);
            if (targetPath !== targetPathBuilder.createPath(result.language)) {
              return;
            }

            console.log(`Detected ${relative(workspaceRoot, targetPath)}`);
            targetRegistry.register(result.language, result.unitMap);
          } catch {}
        })
    );
    return targetRegistry;
  }
}
