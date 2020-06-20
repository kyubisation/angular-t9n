import { readFileSync } from 'fs';
import { join, resolve } from 'path';

import { XlfDeserializer, XmlParser } from '../deserialization';
import { TranslationSource, TranslationTarget } from '../models';

import { XlfSerializer } from './xlf-serializer';

describe('XlfSerializer', () => {
  const deserializer = new XlfDeserializer(new XmlParser());
  const serializer = new XlfSerializer({ includeContextInTarget: true });
  const xlfTestPath = resolve(__dirname, '../../../test/xlf');
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
