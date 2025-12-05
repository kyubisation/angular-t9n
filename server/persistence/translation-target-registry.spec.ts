import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
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
    assert.equal(registry.get('de'), undefined);
  });

  it('should return entry if found', () => {
    assert.deepEqual(registry.get('en'), enTarget);
  });

  it('should return true on has if entry exists', () => {
    assert.equal(registry.has('en'), true);
  });

  it('should return all keys', () => {
    assert.deepEqual(registry.keys(), ['en']);
  });

  it('should return all values', () => {
    assert.deepEqual(registry.values(), [enTarget]);
  });

  it('should return new target without creating on register', () => {
    const target = registry.register('de', new Map<string, TranslationTargetUnit>());
    assert.ok(target !== undefined);
    assert.equal(persistence.created.length, 0);
  });

  it('should return new target with creating in persistence on create', async () => {
    const target = await registry.create('de');
    assert.ok(target !== undefined);
    assert.deepEqual(
      persistence.created.map((t) => t.language),
      [target.language],
    );
  });

  it('should call update on persistence strategy when a change occurs', () => {
    const testScheduler = new TestScheduler((actual, expected) =>
      assert.deepEqual(actual, expected),
    );
    testScheduler.run(() => {
      const unit = enTarget.units[0];
      enTarget.translateUnit(unit, { target: 'test', state: 'translated' });
      testScheduler.flush();
      assert.deepEqual(
        persistence.updated.map((t) => t.language),
        [enTarget.language],
      );
    });
  });

  it('should assign baseHref if provided', () => {
    const baseHref = '/de/';
    const target = registry.register('de', new Map<string, TranslationTargetUnit>(), baseHref);
    assert.equal(target.baseHref, baseHref);
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
    assert.equal(unit.source, sourceWithWhitespace);
    const target = registry.register(
      'de',
      new Map<string, TranslationTargetUnit>().set(unit.id, unit),
    );
    unit = target.unitMap.get(unit.id)!;
    assert.equal(unit.source, sourceUnit.source);
    assert.equal(unit.state, 'translated');
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
    assert.equal(unit.source, sourceWithTextChange);
    const target = registry.register(
      'de',
      new Map<string, TranslationTargetUnit>().set(unit.id, unit),
    );
    unit = target.unitMap.get(unit.id)!;
    assert.equal(unit.source, sourceUnit.source);
    assert.equal(unit.state, 'initial');
  });
});
