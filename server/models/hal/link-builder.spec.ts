import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { LinkBuilder } from './link-builder';

describe('LinkBuilder', () => {
  it('should build undefined with no input', () => {
    assert.equal(new LinkBuilder().build(), undefined);
  });

  it('should build the self link', () => {
    assert.deepEqual(new LinkBuilder().self('test').build(), { self: { href: 'test' } });
  });

  it('should build a href with a condition', () => {
    assert.deepEqual(new LinkBuilder().hrefWhen(true, 'test', () => 'test').build(), {
      test: { href: 'test' },
    });
  });

  it('should not build a href with a negative condition', () => {
    assert.equal(new LinkBuilder().hrefWhen(false, 'test', () => 'test').build(), undefined);
  });

  it('should build a templated href', () => {
    assert.deepEqual(new LinkBuilder().templatedHref('test', 'test').build(), {
      test: { href: 'test', templated: true },
    });
  });
});
