import { logging, normalize, Path } from '@angular-devkit/core';

import { SerializationStrategy, TranslationTarget } from '../../../server';
import { MOCK_TARGET_DE } from '../../../test';

import { AngularI18n } from './angular-i18n';
import { AngularJsonPersistenceStrategy } from './angular-json-persistence-strategy';

describe('AngularJsonPersistenceStrategy', () => {
  class MockAngularI18n implements Partial<AngularI18n> {
    projectRelativePath(target: TranslationTarget) {
      return normalize(`${target.language}.xlf`);
    }
    update(): Promise<void> {
      return Promise.resolve();
    }
  }
  class MockSerializationStrategy implements Partial<SerializationStrategy> {
    serializedTargets: TranslationTarget[] = [];
    async serializeTarget(target: TranslationTarget, _path: Path): Promise<void> {
      this.serializedTargets.push(target);
      return Promise.resolve();
    }
  }

  let persistenceStrategy: AngularJsonPersistenceStrategy;
  let serializationStrategy: MockSerializationStrategy;

  beforeEach(() => {
    serializationStrategy = new MockSerializationStrategy();
    persistenceStrategy = new AngularJsonPersistenceStrategy(
      new MockAngularI18n() as AngularI18n,
      new logging.NullLogger(),
      (serializationStrategy as unknown) as SerializationStrategy
    );
  });

  it('should create target', async () => {
    await persistenceStrategy.create(MOCK_TARGET_DE);
    expect(serializationStrategy.serializedTargets.length).toEqual(1);
    expect(serializationStrategy.serializedTargets[0]).toEqual(MOCK_TARGET_DE);
  });

  it('should update a target', async () => {
    await persistenceStrategy.update(MOCK_TARGET_DE);
    expect(serializationStrategy.serializedTargets.length).toEqual(1);
    expect(serializationStrategy.serializedTargets[0]).toEqual(MOCK_TARGET_DE);
  });
});
