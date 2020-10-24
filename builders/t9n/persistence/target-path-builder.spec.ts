import { join, normalize } from '@angular-devkit/core';

import { TranslationTarget } from '../models';

import { TargetPathBuilder } from './target-path-builder';

describe('TargetPathBuilder', () => {
  const targetDirectory = normalize(__dirname);
  const sourceFile = join(targetDirectory, 'messages.xlf');

  it('should return the expected path with target', () => {
    const builder = new TargetPathBuilder(targetDirectory, sourceFile);
    expect(builder.createPath({ language: 'en' } as TranslationTarget)).toEqual(
      join(targetDirectory, 'messages.en.xlf')
    );
  });

  it('should return the expected path with string', () => {
    const builder = new TargetPathBuilder(targetDirectory, sourceFile);
    expect(builder.createPath('en')).toEqual(join(targetDirectory, 'messages.en.xlf'));
  });
});
