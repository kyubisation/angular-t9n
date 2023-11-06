import { generateOrphans, MOCK_LINK_HELPER } from '../../test';
import { SourceOrphanResponse } from '../models';
import { OrphanRegistry } from '../persistence';

import { SourceOrphansController } from './source-orphans.controller';

describe('SourceOrphansController', () => {
  let controller: SourceOrphansController;
  let orphanRegistry: OrphanRegistry;

  beforeEach(() => {
    const result = generateOrphans();
    orphanRegistry = result.orphanRegistry;
    controller = new SourceOrphansController(
      result.source,
      result.orphanRegistry,
      MOCK_LINK_HELPER,
    );
  });

  it('should return pagination', () => {
    const response = controller.getPagination({});
    expect(response.currentPage).toEqual(0);
    expect(response.totalEntries).toEqual(orphanRegistry.orphans.length);
  });

  for (const sort of ['id', 'description', 'meaning', 'source']) {
    it(`should return sorted pagination with ${sort}`, () => {
      const page = controller.getPagination({ sort });
      const responseIds = (page._embedded!.entries as SourceOrphanResponse[]).map((u) => u.id);
      const stringify = (value: string | number | boolean = '') => value.toString();
      const sortedIds = orphanRegistry.orphans
        .map((o) => o.unit)
        .slice()
        .sort((a, b) => stringify((a as any)[sort]).localeCompare(stringify((b as any)[sort])))
        .map((u) => u.id)
        .slice(0, 10);
      expect(responseIds).toEqual(sortedIds);
    });
  }

  for (const filter of ['id', 'description', 'meaning', 'source']) {
    it(`should return filtered pagination with ${filter}`, async () => {
      const unit = orphanRegistry.orphans.find(
        (o) => o.unit.id && o.unit.description && o.unit.meaning && o.unit.source,
      )!.unit;
      const page = controller.getPagination({
        [filter]: (unit as any)[filter].substring(0, 10),
      });
      const responseIds = (page._embedded!.entries as SourceOrphanResponse[]).map((u) => u.id);
      const sortedIds = orphanRegistry.orphans
        .map((o) => o.unit)
        .slice()
        .filter(
          (u) => !!(u as any)[filter]?.toUpperCase().includes((unit as any)[filter].toUpperCase()),
        )
        .map((u) => u.id)
        .slice(0, 10);
      expect(responseIds).toEqual(sortedIds);
    });
  }

  it('should return source orphan', () => {
    const orphan = orphanRegistry.orphans[0];
    const response = controller.getOrphan(orphan.unit.id);
    expect(response.id).toEqual(orphan.unit.id);
    expect(response.source).toEqual(orphan.unit.source);
  });

  it('should throw on getting non-existant orphan', () => {
    expect(() => controller.getOrphan('does-not-exist')).toThrow();
  });

  it('should throw on deleting non-existant orphan', () => {
    expect(() => controller.deleteOrphan('does-not-exist')).toThrow();
  });

  it('should throw on migrating to non-existant unit', () => {
    const orphan = orphanRegistry.orphans[0];
    expect(() => controller.deleteOrphan(orphan.unit.id, { id: 'does-not-exist' })).toThrow();
  });

  it('should delete orphan with no body', () => {
    const orphan = orphanRegistry.orphans[0];
    controller.deleteOrphan(orphan.unit.id);
    expect(orphanRegistry.orphanMap.has(orphan.unit.id)).toBeFalsy();
  });

  it('should migrate orphan with body', () => {
    const orphan = orphanRegistry.orphans[1];
    const targets = Array.from(orphan.targetOrphans.keys());
    const migrateId = targets[0].units[1].id;
    orphan.targetOrphans.forEach((o, target) =>
      expect(target.unitMap.get(migrateId)!.target).not.toEqual(o.unit.target),
    );
    controller.deleteOrphan(orphan.unit.id, { id: migrateId });
    orphan.targetOrphans.forEach((o, target) =>
      expect(target.unitMap.get(migrateId)!.target).toEqual(o.unit.target),
    );
  });
});
