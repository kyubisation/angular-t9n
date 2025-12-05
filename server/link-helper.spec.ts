import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
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
    assert.equal(linkHelper.root(), 'http://test.test/api');
  });

  it('should return the root url', () => {
    assert.equal(linkHelper.root(), '/api');
  });

  it('should return the source units url', () => {
    assert.equal(linkHelper.sourceUnits(), '/api/source/units');
  });

  it('should return the source units url with parameters', () => {
    assert.equal(linkHelper.sourceUnits({ test: 'test' }), '/api/source/units?test=test');
  });

  it('should return the source unit url with object', () => {
    assert.equal(linkHelper.sourceUnit({ id: 'test' } as any), '/api/source/units/test');
  });

  it('should return the source unit url with string', () => {
    assert.equal(linkHelper.sourceUnit('test'), '/api/source/units/test');
  });

  it('should return the source orphan url with object', () => {
    assert.equal(
      linkHelper.sourceOrphan({ unit: { id: 'test' } } as any),
      '/api/source/orphans/test',
    );
  });

  it('should return the source orphan url with string', () => {
    assert.equal(linkHelper.sourceOrphan('test'), '/api/source/orphans/test');
  });

  it('should return the source orphans url', () => {
    assert.equal(linkHelper.sourceOrphans(), '/api/source/orphans');
  });

  it('should return the source orphans url with parameters', () => {
    assert.equal(linkHelper.sourceOrphans({ test: 'test' }), '/api/source/orphans?test=test');
  });

  it('should return the targets url', () => {
    assert.equal(linkHelper.targets(), '/api/targets');
  });

  it('should return the target url', () => {
    assert.equal(linkHelper.target('en'), '/api/targets/en');
  });

  it('should return the target units url', () => {
    assert.equal(linkHelper.targetUnits({ language: 'en' } as any), '/api/targets/en/units');
  });

  it('should return the target units url with parameters', () => {
    assert.equal(
      linkHelper.targetUnits({ language: 'en' } as any, { test: 'test' }),
      '/api/targets/en/units?test=test',
    );
  });

  it('should return the target unit url with object', () => {
    assert.equal(
      linkHelper.targetUnit({ id: 'test' } as any, { language: 'en' } as any),
      '/api/targets/en/units/test',
    );
  });

  it('should return the source unit url with string', () => {
    assert.equal(
      linkHelper.targetUnit('test', { language: 'en' } as any),
      '/api/targets/en/units/test',
    );
  });

  it('should return the target orphans url', () => {
    assert.equal(linkHelper.targetOrphans({ language: 'en' } as any), '/api/targets/en/orphans');
  });

  it('should return the target orphans url with parameters', () => {
    assert.equal(
      linkHelper.targetOrphans({ language: 'en' } as any, { test: 'test' }),
      '/api/targets/en/orphans?test=test',
    );
  });

  it('should return the target orphan url with object', () => {
    assert.equal(
      linkHelper.targetOrphan({ unit: { id: 'test' } } as any, { language: 'en' } as any),
      '/api/targets/en/orphans/test',
    );
  });

  it('should return the source orphan url with string', () => {
    assert.equal(
      linkHelper.targetOrphan('test', { language: 'en' } as any),
      '/api/targets/en/orphans/test',
    );
  });
});
