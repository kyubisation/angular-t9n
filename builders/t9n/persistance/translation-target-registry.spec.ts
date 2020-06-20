import { TranslationTarget } from '../models';

import { TranslationTargetRegistry } from './translation-target-registry';

describe('TranslationTargetRegistry', () => {
  const expected = {} as TranslationTarget;

  it('should return undefined on a get with no entry', () => {
    expect(new TranslationTargetRegistry().get('en')).toBeUndefined();
  });

  it('should return entry if found', () => {
    expect(new TranslationTargetRegistry().set('en', expected).get('en')).toEqual(expected);
  });

  it('should return true on has if entry exists', () => {
    expect(new TranslationTargetRegistry().set('en', expected).has('en')).toBeTruthy();
  });

  it('should return all keys', () => {
    expect(new TranslationTargetRegistry().set('en', expected).keys()).toEqual(['en']);
  });

  it('should return all values', () => {
    expect(new TranslationTargetRegistry().set('en', expected).values()).toEqual([expected]);
  });
});
