import { LinkBuilder } from './link-builder';

describe('LinkBuilder', () => {
  it('should build undefined with no input', () => {
    expect(new LinkBuilder().build()).toBeUndefined();
  });

  it('should build the self link', () => {
    expect(new LinkBuilder().self('test').build()).toEqual({ self: { href: 'test' } });
  });

  it('should build a href with a condition', () => {
    expect(new LinkBuilder().hrefWhen(true, 'test', () => 'test').build()).toEqual({
      test: { href: 'test' },
    });
  });

  it('should not build a href with a negative condition', () => {
    expect(new LinkBuilder().hrefWhen(false, 'test', () => 'test').build()).toBeUndefined();
  });

  it('should build a templated href', () => {
    expect(new LinkBuilder().templatedHref('test', 'test').build()).toEqual({
      test: { href: 'test', templated: true },
    });
  });
});
