import {
  MOCK_LINK_HELPER,
  MOCK_PERSISTANCE_STRATEGY,
  MOCK_TARGET_DE,
  MOCK_TARGET_REGISTRY,
} from '../../../test';
import { OrphanResponse } from '../models';

import { TargetOrphansController } from './target-orphans.controller';

describe('TargetOrphansController', () => {
  let controller: TargetOrphansController;

  beforeEach(() => {
    controller = new TargetOrphansController(
      MOCK_TARGET_REGISTRY,
      MOCK_PERSISTANCE_STRATEGY,
      MOCK_LINK_HELPER
    );
  });

  it('should return pagination', () => {
    const response = controller.getPagination(MOCK_TARGET_DE.language, {});
    expect(response.currentPage).toEqual(0);
    expect(response.totalEntries).toEqual(MOCK_TARGET_DE.orphans.length);
  });

  for (const sort of ['id', 'description', 'meaning', 'source', 'target', 'state']) {
    it(`should return sorted pagination with ${sort}`, () => {
      const page = controller.getPagination(MOCK_TARGET_DE.language, { sort });
      const responseIds = (page._embedded!.entries as OrphanResponse[]).map((u) => u.id);
      const stringify = (value: string | number | boolean = '') => value.toString();
      const sortedIds = MOCK_TARGET_DE.orphans
        .map((o) => o.unit)
        .slice()
        .sort((a, b) => stringify((a as any)[sort]).localeCompare(stringify((b as any)[sort])))
        .map((u) => u.id);
      expect(responseIds).toEqual(sortedIds);
    });
  }

  for (const filter of ['id', 'description', 'meaning', 'source', 'target', 'state']) {
    it(`should return filtered pagination with ${filter}`, async () => {
      const unit = MOCK_TARGET_DE.orphans[0].unit;
      const page = controller.getPagination(MOCK_TARGET_DE.language, {
        [filter]: (unit as any)[filter],
      });
      const responseIds = (page._embedded!.entries as OrphanResponse[]).map((u) => u.id);
      const sortedIds = MOCK_TARGET_DE.orphans
        .map((o) => o.unit)
        .slice()
        .filter(
          (u) => (u as any)[filter] && (u as any)[filter].toString().includes((unit as any)[filter])
        )
        .map((u) => u.id);
      expect(responseIds).toEqual(sortedIds);
    });
  }

  it('should throw on non-existant target', () => {
    expect(() => controller.getPagination('does-not-exist', {})).toThrow();
  });

  it('should return target orphan', () => {
    const orphan = MOCK_TARGET_DE.orphans[0];
    const response = controller.getOrphan(MOCK_TARGET_DE.language, orphan.unit.id);
    expect(response.id).toEqual(orphan.unit.id);
    expect(response.source).toEqual(orphan.unit.source);
    expect(response.target).toEqual(orphan.unit.target);
  });

  it('should throw on getting orphan with non-existant target', () => {
    expect(() => controller.getOrphan('does-not-exist', 'does-not-exist')).toThrow();
  });

  it('should throw on getting orphan with non-existant target orphan', () => {
    expect(() => controller.getOrphan(MOCK_TARGET_DE.language, 'does-not-exist')).toThrow();
  });

  it('should throw on deleting orphan with non-existant target', () => {
    expect(() => controller.deleteOrphan('does-not-exist', 'does-not-exist')).toThrow();
  });

  it('should throw on deleting orphan with non-existant target orphan', () => {
    expect(() => controller.deleteOrphan(MOCK_TARGET_DE.language, 'does-not-exist')).toThrow();
  });
});
