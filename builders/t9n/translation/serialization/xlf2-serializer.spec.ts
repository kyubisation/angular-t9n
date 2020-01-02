import { mkdtempSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';

import { Xlf2Deserializer } from '../deserialization';
import { TranslationSource } from '../translation-source';
import { TranslationTarget } from '../translation-target';

import { Xlf2Serializer } from './xlf2-serializer';

describe('Xlf2Serializer', () => {
  const deserializer = new Xlf2Deserializer();
  const serializer = new Xlf2Serializer();
  const xlfTestPath = resolve(__dirname, '../../../../test/xlf2');
  const sourceFile = join(xlfTestPath, 'messages.xlf');
  const targetFile = join(xlfTestPath, 'messages.de.xlf');
  let original: string;
  let source: TranslationSource;
  let target: TranslationTarget;
  let targetTmpFile: string;

  beforeEach(async () => {
    const dir = mkdtempSync(join(tmpdir(), 'Xlf2Serializer'));
    targetTmpFile = join(dir, 'messages.de.xlf');
    const sourceResult = await deserializer.deserializeSource(sourceFile);
    original = sourceResult.original;
    source = new TranslationSource(sourceFile, sourceResult.language, sourceResult.unitMap);
    const targetResult = await deserializer.deserializeTarget(targetFile);
    target = new TranslationTarget(
      source,
      targetTmpFile,
      targetResult.language,
      targetResult.unitMap
    );
  });

  it('should serialize a target', async () => {
    await serializer.serializeTarget(target, {
      original,
      includeContextInTarget: true
    });
    expect(readFileSync(targetFile, 'utf-8')).toEqual(readFileSync(targetTmpFile, 'utf-8'));
  });
});
