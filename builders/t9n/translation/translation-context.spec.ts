import { logging } from '@angular-devkit/core';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';

import { Xlf2Deserializer } from './deserialization';
import { TranslationSerializer } from './serialization';
import { TranslationContext } from './translation-context';
import { TranslationContextConfiguration } from './translation-context-configuration';
import { TranslationSource } from './translation-source';
import { TranslationTarget } from './translation-target';
import { TranslationTargetUnit } from './translation-target-unit';

jest.useFakeTimers();

describe('TranslationContext', () => {
  class Serializer implements TranslationSerializer {
    counter = 0;
    serializeTarget(
      _target: TranslationTarget,
      _options: { encoding: string; original: string; includeContextInTarget: boolean }
    ): Promise<void> {
      this.counter++;
      return new Promise(r => r());
    }
  }

  const deserializer = new Xlf2Deserializer();
  const encoding = 'UTF-8';
  const xlfTestPath = resolve(__dirname, '../../../test/xlf2');
  const sourceFile = join(xlfTestPath, 'messages.xlf');
  let serializer: Serializer;
  let original: string;
  let source: TranslationSource;
  let targetPath: string;
  let configuration: TranslationContextConfiguration;

  beforeEach(async () => {
    serializer = new Serializer();
    targetPath = mkdtempSync(join(tmpdir(), 'TranslationContext'));
    const sourceResult = await deserializer.deserializeSource(sourceFile, encoding);
    original = sourceResult.original;
    source = new TranslationSource(sourceFile, sourceResult.language, sourceResult.unitMap);
    configuration = {
      encoding: 'UTF-8',
      filenameFactory: l => join(targetPath, `messages.${l}.xlf`),
      includeContextInTarget: true,
      logger: new logging.NullLogger(),
      original: 'ng.template',
      project: 'test',
      serializer,
      source,
      sourceFile,
      targets: new Map()
    };
  });

  it('should allow creating targets', async () => {
    const context = new TranslationContext(configuration);
    expect(context.target('de')).toBeUndefined();
    const target = await context.createTarget('de');
    expect(target).toBe(context.target('de'));
    expect(target.units.map(u => u.id)).toEqual(source.units.map(u => u.id));
  });

  it('should provide available languages', async () => {
    const context = new TranslationContext(configuration);
    expect(context.languages).toEqual([]);
    await context.createTarget('de');
    expect(context.languages).toEqual(['de']);
  });

  it('should throw on creating existing target', async () => {
    const context = new TranslationContext(configuration);
    await context.createTarget('de');
    await expect(context.createTarget('de')).rejects.toThrow(/^de already exists as target!/);
  });

  it('should throw on updating for non-existant target', async () => {
    const context = new TranslationContext(configuration);
    const unit = source.units[0];
    expect(() =>
      context.updateTranslation('de', { ...unit, target: 'Beispiel', state: 'translated' })
    ).toThrow(/^No target for language de!/);
  });

  it('should throw on updating non-existant unit', async () => {
    const context = new TranslationContext(configuration);
    await context.createTarget('de');
    expect(() =>
      context.updateTranslation('de', {
        id: 'non-existant-unit',
        source: '',
        target: '',
        state: 'translated'
      })
    ).toThrow(/^Unit with id non-existant-unit does not exist for language de!/);
  });

  it('should update a translation', async () => {
    const context = new TranslationContext(configuration);
    expect(context.target('de')).toBeUndefined();
    const target = await context.createTarget('de');
    const unit = source.units[0];
    expect(serializer.counter).toEqual(1);
    const newUnit = context.updateTranslation('de', {
      ...unit,
      target: 'Beispiel',
      state: 'translated'
    });
    jest.advanceTimersByTime(600);
    expect(serializer.counter).toEqual(2);
    expect(target.unitMap.get(unit.id)).toEqual(newUnit);
  });
});
