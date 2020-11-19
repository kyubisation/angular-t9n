import { LinkHelper } from './link-helper';

describe('LinkHelper', () => {
  let linkHelper: LinkHelper;

  beforeEach(() => {
    linkHelper = new LinkHelper({
      get: () => '',
    } as any);
  });

  it('should return url with host if available', () => {
    linkHelper = new LinkHelper({ get: () => 'test.test', protocol: 'http' } as any);
    expect(linkHelper.root()).toEqual('http://test.test/api');
  });

  it('should return the root url', () => {
    expect(linkHelper.root()).toEqual('/api');
  });

  it('should return the source units url', () => {
    expect(linkHelper.sourceUnits()).toEqual('/api/source/units');
  });

  it('should return the source units url with parameters', () => {
    expect(linkHelper.sourceUnits({ test: 'test' })).toEqual('/api/source/units?test=test');
  });

  it('should return the source unit url with object', () => {
    expect(linkHelper.sourceUnit({ id: 'test' } as any)).toEqual('/api/source/units/test');
  });

  it('should return the source unit url with string', () => {
    expect(linkHelper.sourceUnit('test')).toEqual('/api/source/units/test');
  });

  it('should return the source orphan url with object', () => {
    expect(linkHelper.sourceOrphan({ unit: { id: 'test' } } as any)).toEqual(
      '/api/source/orphans/test'
    );
  });

  it('should return the source orphan url with string', () => {
    expect(linkHelper.sourceOrphan('test')).toEqual('/api/source/orphans/test');
  });

  it('should return the source orphans url', () => {
    expect(linkHelper.sourceOrphans()).toEqual('/api/source/orphans');
  });

  it('should return the source orphans url with parameters', () => {
    expect(linkHelper.sourceOrphans({ test: 'test' })).toEqual('/api/source/orphans?test=test');
  });

  it('should return the targets url', () => {
    expect(linkHelper.targets()).toEqual('/api/targets');
  });

  it('should return the target url', () => {
    expect(linkHelper.target('en')).toEqual('/api/targets/en');
  });

  it('should return the target units url', () => {
    expect(linkHelper.targetUnits({ language: 'en' } as any)).toEqual('/api/targets/en/units');
  });

  it('should return the target units url with parameters', () => {
    expect(linkHelper.targetUnits({ language: 'en' } as any, { test: 'test' })).toEqual(
      '/api/targets/en/units?test=test'
    );
  });

  it('should return the target unit url with object', () => {
    expect(linkHelper.targetUnit({ id: 'test' } as any, { language: 'en' } as any)).toEqual(
      '/api/targets/en/units/test'
    );
  });

  it('should return the source unit url with string', () => {
    expect(linkHelper.targetUnit('test', { language: 'en' } as any)).toEqual(
      '/api/targets/en/units/test'
    );
  });

  it('should return the target orphans url', () => {
    expect(linkHelper.targetOrphans({ language: 'en' } as any)).toEqual('/api/targets/en/orphans');
  });

  it('should return the target orphans url with parameters', () => {
    expect(linkHelper.targetOrphans({ language: 'en' } as any, { test: 'test' })).toEqual(
      '/api/targets/en/orphans?test=test'
    );
  });

  it('should return the target orphan url with object', () => {
    expect(
      linkHelper.targetOrphan({ unit: { id: 'test' } } as any, { language: 'en' } as any)
    ).toEqual('/api/targets/en/orphans/test');
  });

  it('should return the source orphan url with string', () => {
    expect(linkHelper.targetOrphan('test', { language: 'en' } as any)).toEqual(
      '/api/targets/en/orphans/test'
    );
  });
});
