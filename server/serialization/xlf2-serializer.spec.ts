import { readFileSync } from 'fs';
import { join, resolve } from 'path';

import { Xlf2Deserializer, XmlParser } from '../deserialization';
import { TranslationSource, TranslationTarget } from '../models';

import { Xlf2Serializer } from './xlf2-serializer';

describe('Xlf2Serializer', () => {
  const deserializer = new Xlf2Deserializer(new XmlParser());
  const serializer = new Xlf2Serializer({ includeContextInTarget: true });
  const xlfTestPath = resolve(__dirname, '../../test/xlf2');
  const sourceFile = join(xlfTestPath, 'messages.xlf');
  const targetFile = join(xlfTestPath, 'messages.de.xlf');
  let source: TranslationSource;
  let target: TranslationTarget;

  beforeEach(() => {
    const sourceFileContent = readFileSync(sourceFile, 'utf8');
    const sourceResult = deserializer.deserializeSource(sourceFileContent);
    source = new TranslationSource(sourceResult.language, sourceResult.unitMap);
    const targetFileContent = readFileSync(targetFile, 'utf8');
    const targetResult = deserializer.deserializeTarget(targetFileContent);
    target = new TranslationTarget(source, targetResult.language, targetResult.unitMap);
  });

  it('should serialize a target', () => {
    const result = serializer.serializeTarget(target);
    expect(readFileSync(targetFile, 'utf-8')).toEqual(result);
  });
});
