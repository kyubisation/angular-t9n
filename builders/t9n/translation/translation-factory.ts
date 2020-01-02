import { readFile } from 'fs';
import { basename, extname, join } from 'path';
import { promisify } from 'util';
import { DOMParser } from 'xmldom';

import { TranslationDeserializer, Xlf2Deserializer, XlfDeserializer } from './deserialization';
import { TranslationSerializer, Xlf2Serializer, XlfSerializer } from './serialization';
import { TranslationContext } from './translation-context';
import { TranslationContextConfiguration } from './translation-context-configuration';
import { TranslationFactoryConfiguration } from './translation-factory-configuration';
import { TranslationSource } from './translation-source';
import { TranslationTarget } from './translation-target';
import { TranslationTargetUnit } from './translation-target-unit';

const readFileAsync = promisify(readFile);

export class TranslationFactory {
  static async createTranslationContext(configuration: TranslationFactoryConfiguration) {
    const xlfContent = await readFileAsync(configuration.sourceFile, configuration.encoding);
    const doc = new DOMParser().parseFromString(xlfContent);
    const version = doc.documentElement.getAttribute('version');
    if (doc.documentElement.tagName !== 'xliff') {
      throw new Error(`Expected root element to be <xliff>!`);
    } else if (version === '2.0') {
      return await this._create(configuration, new Xlf2Deserializer(), new Xlf2Serializer());
    } else if (version === '1.2') {
      return await this._create(configuration, new XlfDeserializer(), new XlfSerializer());
    } else {
      throw new Error(`Unsupported xliff version ${version} (Supported: 1.2, 2.0)`);
    }
  }

  private static async _create(
    configuration: TranslationFactoryConfiguration,
    deserializer: TranslationDeserializer,
    serializer: TranslationSerializer
  ) {
    const { language, original, unitMap } = await deserializer.deserializeSource(
      configuration.sourceFile,
      configuration.encoding
    );
    const source = new TranslationSource(configuration.sourceFile, language, unitMap);
    const filenameFactory = this._createFilenameFactory(configuration);
    const targets = await Promise.all(
      configuration.targets.map(target =>
        deserializer.deserializeTarget(target, configuration.encoding)
      )
    ).then(deserializedTargets =>
      deserializedTargets
        .map(t => new TranslationTarget(source, filenameFactory(t.language), t.language, t.unitMap))
        .reduce((map, t) => map.set(t.language, t), new Map<string, TranslationTarget>())
    );

    const contextConfiguration: TranslationContextConfiguration = {
      ...configuration,
      source,
      targets,
      filenameFactory,
      original,
      serializer
    };

    const context = new TranslationContext(contextConfiguration);
    const sourceTarget =
      context.target(source.language) || (await context.createTarget(source.language));
    sourceTarget.units
      .filter(u => u.source !== u.target || u.state !== 'final')
      .map(u => ({ ...u, target: u.source, state: 'final' } as TranslationTargetUnit))
      .forEach(u => context.updateTranslation(source.language, u));
    return context;
  }

  private static _createFilenameFactory(configuration: {
    sourceFile: string;
    targetPath: string;
  }): (language: string) => string {
    const extension = extname(configuration.sourceFile);
    const filename = basename(configuration.sourceFile);
    const namePart = filename.substring(0, filename.length - extension.length);
    return l => join(configuration.targetPath, `${namePart}.${l}${extension}`);
  }
}
