import { mkdtempSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';

import { XlfDeserializer } from '../deserialization';
import { TranslationSource } from '../translation-source';
import { TranslationTarget } from '../translation-target';

import { XlfSerializer } from './xlf-serializer';

describe('XlfSerializer', () => {
  const deserializer = new XlfDeserializer();
  const serializer = new XlfSerializer();
  const encoding = 'UTF-8';
  const xlfTestPath = resolve(__dirname, '../../../../test/xlf');
  const sourceFile = join(xlfTestPath, 'messages.xlf');
  const targetFile = join(xlfTestPath, 'messages.de.xlf');
  let original: string;
  let source: TranslationSource;
  let target: TranslationTarget;
  let targetTmpFile: string;

  beforeEach(async () => {
    const dir = mkdtempSync(join(tmpdir(), 'XlfSerializer'));
    targetTmpFile = join(dir, 'messages.de.xlf');
    const sourceResult = await deserializer.deserializeSource(sourceFile, encoding);
    original = sourceResult.original;
    source = new TranslationSource(sourceFile, sourceResult.language, sourceResult.unitMap);
    const targetResult = await deserializer.deserializeTarget(targetFile, encoding);
    target = new TranslationTarget(
      source,
      targetTmpFile,
      targetResult.language,
      targetResult.unitMap
    );
  });

  it('should serialize a target', async () => {
    await serializer.serializeTarget(target, {
      encoding,
      original,
      includeContextInTarget: true
    });
    expect(readFileSync(targetFile, encoding)).toEqual(readFileSync(targetTmpFile, encoding));
  });
});
