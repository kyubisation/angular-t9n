import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
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
    assert.equal(response.currentPage, 0);
    assert.equal(response.totalEntries, orphanRegistry.orphans.length);
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
      assert.deepEqual(responseIds, sortedIds);
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
      assert.deepEqual(responseIds, sortedIds);
    });
  }

  it('should return source orphan', () => {
    const orphan = orphanRegistry.orphans[0];
    const response = controller.getOrphan(orphan.unit.id);
    assert.equal(response.id, orphan.unit.id);
    assert.equal(response.source, orphan.unit.source);
  });

  it('should throw on getting non-existant orphan', () => {
    assert.throws(() => controller.getOrphan('does-not-exist'));
  });

  it('should throw on deleting non-existant orphan', () => {
    assert.throws(() => controller.deleteOrphan('does-not-exist'));
  });

  it('should throw on migrating to non-existant unit', () => {
    const orphan = orphanRegistry.orphans[0];
    assert.throws(() => controller.deleteOrphan(orphan.unit.id, { id: 'does-not-exist' }));
  });

  it('should delete orphan with no body', () => {
    const orphan = orphanRegistry.orphans[0];
    controller.deleteOrphan(orphan.unit.id);
    assert.equal(orphanRegistry.orphanMap.has(orphan.unit.id), false);
  });

  it('should migrate orphan with body', () => {
    const orphan = orphanRegistry.orphans[1];
    const targets = Array.from(orphan.targetOrphans.keys());
    const migrateId = targets[0].units[1].id;
    orphan.targetOrphans.forEach((o, target) =>
      assert.notEqual(target.unitMap.get(migrateId)!.target, o.unit.target),
    );
    controller.deleteOrphan(orphan.unit.id, { id: migrateId });
    orphan.targetOrphans.forEach((o, target) =>
      assert.equal(target.unitMap.get(migrateId)!.target, o.unit.target),
    );
  });
});
