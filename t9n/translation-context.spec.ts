import { readFileSync } from 'fs';
import { join, resolve } from 'path';

import { Xlf2Deserializer } from './deserialization';
import { TranslationSource, TranslationTarget } from './models';
import { PersistanceStrategy } from './persistance';
import { TranslationContext } from './translation-context';

jest.useFakeTimers();

describe('TranslationContext', () => {
  class MockPersistanceStrategy implements PersistanceStrategy {
    constructor(
      public source: TranslationSource,
      public targets = new Map<string, TranslationTarget>()
    ) {}
    create(language: string): Promise<TranslationTarget> {
      const target = new TranslationTarget(this.source, language);
      this.targets.set(language, target);
      return Promise.resolve(target);
    }
    update(_target: TranslationTarget): Promise<void> {
      return Promise.resolve();
    }
  }

  const deserializer = new Xlf2Deserializer();
  const xlfTestPath = resolve(__dirname, '../test/xlf2');
  const sourceFile = join(xlfTestPath, 'messages.xlf');
  let persistanceStrategy: MockPersistanceStrategy;

  beforeEach(async () => {
    const sourceFileContent = readFileSync(sourceFile, 'utf8');
    const sourceResult = deserializer.deserializeSource(sourceFileContent);
    persistanceStrategy = new MockPersistanceStrategy(
      new TranslationSource(sourceResult.language, sourceResult.unitMap)
    );
  });

  it('should allow creating targets', async () => {
    const context = new TranslationContext('', '', persistanceStrategy);
    expect(context.target('de')).toBeUndefined();
    const target = await context.createTarget('de');
    expect(target).toBe(context.target('de'));
    expect(target.units.map(u => u.id)).toEqual(persistanceStrategy.source.units.map(u => u.id));
  });

  it('should provide available languages', async () => {
    const context = new TranslationContext('', '', persistanceStrategy);
    expect(context.languages).toEqual([]);
    await context.createTarget('de');
    expect(context.languages).toEqual(['de']);
  });

  it('should throw on creating existing target', async () => {
    const context = new TranslationContext('', '', persistanceStrategy);
    await context.createTarget('de');
    await expect(context.createTarget('de')).rejects.toThrow(/^de already exists as target!/);
  });

  it('should throw on updating for non-existant target', async () => {
    const context = new TranslationContext('', '', persistanceStrategy);
    const unit = persistanceStrategy.source.units[0];
    expect(() =>
      context.updateTranslation('de', { ...unit, target: 'Beispiel', state: 'translated' })
    ).toThrow(/^No target for language de!/);
  });

  it('should throw on updating non-existant unit', async () => {
    const context = new TranslationContext('', '', persistanceStrategy);
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
    const context = new TranslationContext('', '', persistanceStrategy);
    expect(context.target('de')).toBeUndefined();
    const target = await context.createTarget('de');
    const unit = persistanceStrategy.source.units[0];
    const spy = jest.spyOn(persistanceStrategy, 'update');
    const newUnit = context.updateTranslation('de', {
      ...unit,
      target: 'Beispiel',
      state: 'translated'
    });
    expect(spy).not.toHaveBeenCalled();
    jest.advanceTimersByTime(600);
    expect(spy).toHaveBeenCalled();
    expect(target.unitMap.get(unit.id)).toEqual(newUnit);
    spy.mockRestore();
  });
});
