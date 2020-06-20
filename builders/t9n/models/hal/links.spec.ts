import { Links } from './links';

describe('Links', () => {
  it('should build undefined with no input', () => {
    expect(new Links().build()).toBeUndefined();
  });

  it('should build the self link', () => {
    expect(new Links().self('test').build()).toEqual({ self: { href: 'test' } });
  });

  it('should build a href with a condition', () => {
    expect(new Links().hrefWhen(true, 'test', () => 'test').build()).toEqual({
      test: { href: 'test' },
    });
  });

  it('should not build a href with a negative condition', () => {
    expect(new Links().hrefWhen(false, 'test', () => 'test').build()).toBeUndefined();
  });

  it('should build a templated href', () => {
    expect(new Links().templatedHref('test', 'test').build()).toEqual({
      test: { href: 'test', templated: true },
    });
  });
});
