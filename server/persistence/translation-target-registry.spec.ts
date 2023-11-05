import { TestScheduler } from 'rxjs/testing';
import { MOCK_SOURCE } from '../../test';
import { TranslationTarget, TranslationTargetUnit } from '../models';

import { PersistenceStrategy } from './persistence-strategy';
import { TranslationTargetRegistry } from './translation-target-registry';

describe('TranslationTargetRegistry', () => {
  class MockPersistenceStrategy implements PersistenceStrategy {
    readonly created: TranslationTarget[] = [];
    readonly updated: TranslationTarget[] = [];
    create(target: TranslationTarget): Promise<void> {
      this.created.push(target);
      return Promise.resolve();
    }
    update(target: TranslationTarget): Promise<void> {
      this.updated.push(target);
      return Promise.resolve();
    }
  }

  let enTarget: TranslationTarget;
  let registry: TranslationTargetRegistry;
  let persistence: MockPersistenceStrategy;

  beforeEach(() => {
    persistence = new MockPersistenceStrategy();
    registry = new TranslationTargetRegistry(MOCK_SOURCE, persistence);
    enTarget = registry.register('en', new Map<string, TranslationTargetUnit>());
  });

  it('should return undefined on a get with no entry', () => {
    expect(registry.get('de')).toBeUndefined();
  });

  it('should return entry if found', () => {
    expect(registry.get('en')).toEqual(enTarget);
  });

  it('should return true on has if entry exists', () => {
    expect(registry.has('en')).toBeTruthy();
  });

  it('should return all keys', () => {
    expect(registry.keys()).toEqual(['en']);
  });

  it('should return all values', () => {
    expect(registry.values()).toEqual([enTarget]);
  });

  it('should return new target without creating on register', () => {
    const target = registry.register('de', new Map<string, TranslationTargetUnit>());
    expect(target).toBeDefined();
    expect(persistence.created.length).toEqual(0);
  });

  it('should return new target with creating in persistence on create', async () => {
    const target = await registry.create('de');
    expect(target).toBeDefined();
    expect(persistence.created.map((t) => t.language)).toEqual([target.language]);
  });

  it('should call update on persistence strategy when a change occurs', () => {
    const testScheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
    testScheduler.run(() => {
      const unit = enTarget.units[0];
      enTarget.translateUnit(unit, { target: 'test', state: 'translated' });
      testScheduler.flush();
      expect(persistence.updated.map((t) => t.language)).toEqual([enTarget.language]);
    });
  });

  it('should assign baseHref if provided', () => {
    const baseHref = '/de/';
    const target = registry.register('de', new Map<string, TranslationTargetUnit>(), baseHref);
    expect(target.baseHref).toEqual(baseHref);
  });

  it('should update stale source with only whitespace change', () => {
    const sourceUnit = MOCK_SOURCE.units[0];
    const sourceWithWhitespace = sourceUnit.source + ' ';
    let unit: TranslationTargetUnit = {
      ...sourceUnit,
      source: sourceWithWhitespace,
      target: sourceWithWhitespace,
      state: 'translated',
    };
    expect(unit.source).toEqual(sourceWithWhitespace);
    const target = registry.register(
      'de',
      new Map<string, TranslationTargetUnit>().set(unit.id, unit),
    );
    unit = target.unitMap.get(unit.id)!;
    expect(unit.source).toEqual(sourceUnit.source);
    expect(unit.state).toEqual('translated');
  });

  it('should update stale source and state with textual change', () => {
    const sourceUnit = MOCK_SOURCE.units[0];
    const sourceWithTextChange = sourceUnit.source + ' test';
    let unit: TranslationTargetUnit = {
      ...sourceUnit,
      source: sourceWithTextChange,
      target: sourceWithTextChange,
      state: 'translated',
    };
    expect(unit.source).toEqual(sourceWithTextChange);
    const target = registry.register(
      'de',
      new Map<string, TranslationTargetUnit>().set(unit.id, unit),
    );
    unit = target.unitMap.get(unit.id)!;
    expect(unit.source).toEqual(sourceUnit.source);
    expect(unit.state).toEqual('initial');
  });
});
