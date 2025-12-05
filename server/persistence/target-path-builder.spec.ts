import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'path';

import { TranslationTarget } from '../models';

import { TargetPathBuilder } from './target-path-builder';

describe('TargetPathBuilder', () => {
  const targetDirectory = __dirname;
  const sourceFile = join(targetDirectory, 'messages.xlf');

  it('should return the expected path with target', () => {
    const builder = new TargetPathBuilder(targetDirectory, sourceFile);
    assert.equal(
      builder.createPath({ language: 'en' } as TranslationTarget),
      join(targetDirectory, 'messages.en.xlf'),
    );
  });

  it('should return the expected path with string', () => {
    const builder = new TargetPathBuilder(targetDirectory, sourceFile);
    assert.equal(builder.createPath('en'), join(targetDirectory, 'messages.en.xlf'));
  });
});
