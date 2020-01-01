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

const readFileAsync = promisify(readFile);

export class TranslationFactory {
  static async createTranslationContext(configuration: TranslationFactoryConfiguration) {
    const xlfContent = await readFileAsync(configuration.source, configuration.encoding);
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
    const { sourceLanguage, original, unitMap } = await deserializer.deserializeSource(
      configuration.source,
      configuration.encoding
    );
    const source = new TranslationSource(sourceLanguage, unitMap);
    const deserializedTargets = await Promise.all(
      configuration.targets.map(target =>
        deserializer
          .deserializeTarget(target, configuration.encoding)
          .then(t => new TranslationTarget(source, t.targetLanguage, t.unitMap))
      )
    );
    const targets = deserializedTargets.reduce(
      (map, t) => map.set(t.language, t),
      new Map<string, TranslationTarget>()
    );

    const contextConfiguration: TranslationContextConfiguration = {
      encoding: configuration.encoding,
      includeContextInTarget: configuration.includeContextInTarget,
      filenameFactory: this._createFilenameFactory(configuration.source, configuration.targetPath),
      original,
      serializer,
      source,
      targets
    };

    await this._migrateSourceToTargetLanguage(contextConfiguration);
    return new TranslationContext(configuration.logger, contextConfiguration);
  }

  private static _createFilenameFactory(
    source: string,
    targetPath: string
  ): (target: TranslationTarget) => string {
    const extension = extname(source);
    const filename = basename(source);
    const namePart = filename.substring(0, filename.length - extension.length);
    return t => join(targetPath, `${namePart}.${t.language}${extension}`);
  }

  private static async _migrateSourceToTargetLanguage({
    encoding,
    includeContextInTarget,
    filenameFactory,
    original,
    source,
    targets,
    serializer
  }: TranslationContextConfiguration) {
    let target = targets.get(source.language);
    if (!target) {
      target = new TranslationTarget(source, source.language);
      targets.set(source.language, target);
    }

    target.units.forEach(u => {
      u.target = u.source;
      u.state = 'final';
    });

    await serializer.serializeTarget(filenameFactory(target), target, {
      original,
      encoding,
      includeContextInTarget
    });
  }
}
