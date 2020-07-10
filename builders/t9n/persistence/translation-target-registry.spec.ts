import { MOCK_SOURCE, TestScheduler } from '../../../test';
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

  let scheduler: TestScheduler;
  let enTarget: TranslationTarget;
  let registry: TranslationTargetRegistry;
  let persistence: MockPersistenceStrategy;

  beforeEach(() => {
    scheduler = new TestScheduler();
    persistence = new MockPersistenceStrategy();
    registry = new TranslationTargetRegistry(MOCK_SOURCE, persistence);
    enTarget = registry.register('en', new Map<string, TranslationTargetUnit>());
  });

  afterEach(() => {
    scheduler.destroy();
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
    const unit = enTarget.units[0];
    enTarget.translateUnit(unit, { target: 'test', state: 'translated' });
    scheduler.flush();
    expect(persistence.updated.map((t) => t.language)).toEqual([enTarget.language]);
  });

  it('should assign baseHref if provided', () => {
    const baseHref = '/de/';
    const target = registry.register('de', new Map<string, TranslationTargetUnit>(), baseHref);
    expect(target.baseHref).toEqual(baseHref);
  });
});
