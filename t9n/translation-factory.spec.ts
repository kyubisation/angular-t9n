import { logging } from '@angular-devkit/core';
import { copyFileSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';

import { TranslationFactory } from './translation-factory';

describe('TranslationFactory', () => {
  const xlfTestPath = resolve(__dirname, '../../../test/xlf');
  const xlf2TestPath = resolve(__dirname, '../../../test/xlf2');
  const invalidXliffFile = join(xlf2TestPath, 'messages.invalid-xliff.xlf');
  const invalidVersionFile = join(xlf2TestPath, 'messages.invalid-version.xlf');
  let targetPath: string;

  beforeEach(() => {
    targetPath = mkdtempSync(join(tmpdir(), 'TranslationFactory'));
  });

  it('should throw with invalid xliff file', async () => {
    await expect(
      TranslationFactory.createTranslationContext({
        includeContextInTarget: true,
        logger: new logging.NullLogger(),
        project: 'test',
        sourceFile: invalidXliffFile,
        targetPath,
        targets: []
      })
    ).rejects.toThrow(/^Expected root element to be <xliff>!/);
  });

  it('should throw with invalid xliff version', async () => {
    await expect(
      TranslationFactory.createTranslationContext({
        includeContextInTarget: true,
        logger: new logging.NullLogger(),
        project: 'test',
        sourceFile: invalidVersionFile,
        targetPath,
        targets: []
      })
    ).rejects.toThrow(/^Unsupported xliff version 3.0/);
  });

  it('should create a context for xlf 1.2 without target files', async () => {
    const context = await TranslationFactory.createTranslationContext({
      includeContextInTarget: true,
      logger: new logging.NullLogger(),
      project: 'test',
      sourceFile: join(xlfTestPath, 'messages.xlf'),
      targetPath,
      targets: []
    });
    expect(context.source.language).toEqual('en');
    expect(context.languages).toEqual(['en']);
  });

  it('should create a context for xlf 2.0 without target files', async () => {
    const context = await TranslationFactory.createTranslationContext({
      includeContextInTarget: true,
      logger: new logging.NullLogger(),
      project: 'test',
      sourceFile: join(xlf2TestPath, 'messages.xlf'),
      targetPath,
      targets: []
    });
    expect(context.source.language).toEqual('en');
    expect(context.languages).toEqual(['en']);
  });

  it('should create a context for xlf 2.0 with a target file', async () => {
    const targetFile = join(targetPath, 'messages.de.xlf');
    copyFileSync(join(xlf2TestPath, 'messages.de.xlf'), targetFile);
    const context = await TranslationFactory.createTranslationContext({
      includeContextInTarget: true,
      logger: new logging.NullLogger(),
      project: 'test',
      sourceFile: join(xlf2TestPath, 'messages.xlf'),
      targetPath,
      targets: [targetFile]
    });
    expect(context.source.language).toEqual('en');
    expect(context.languages).toEqual(['de', 'en']);
  });
});
