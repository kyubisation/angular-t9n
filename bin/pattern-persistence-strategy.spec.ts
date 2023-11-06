import { mkdirSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { SerializationStrategy, TargetPathBuilder, TranslationTarget } from '../server';
import { MOCK_TARGET_DE } from '../test';

import { PatternPersistenceStrategy } from './pattern-persistence-strategy';

describe('PatternPersistenceStrategy', () => {
  let persistence: PatternPersistenceStrategy;
  let directory: string;
  let mockSerialization: MockSerialization;

  class MockSerialization implements Partial<SerializationStrategy> {
    serializeTarget(_target: TranslationTarget, _path: string): Promise<void> {
      return Promise.resolve();
    }
  }

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'PatternPersistenceStrategy'));
    const sourceFile = join(directory, 'messages.xlf');
    const builder = new TargetPathBuilder(directory, sourceFile);
    mockSerialization = new MockSerialization();
    persistence = new PatternPersistenceStrategy(
      builder,
      mockSerialization as SerializationStrategy,
    );
  });

  afterEach(() => {
    mkdirSync(directory, { recursive: true });
  });

  it('should call serialization with create', async () => {
    const spy = jest.spyOn(mockSerialization, 'serializeTarget');
    await persistence.create(MOCK_TARGET_DE);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should call serialization with update', async () => {
    const spy = jest.spyOn(mockSerialization, 'serializeTarget');
    await persistence.update(MOCK_TARGET_DE);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
