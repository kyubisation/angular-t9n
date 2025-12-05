import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { generateOrphans } from '../../test';
import { TranslationSource } from '../models';

import { OrphanRegistry } from './orphan-registry';

describe('OrphanRegistry', () => {
  let orphanRegistry: OrphanRegistry;
  let source: TranslationSource;

  beforeEach(() => {
    const result = generateOrphans();
    orphanRegistry = result.orphanRegistry;
    source = result.source;
  });

  it('should delete orphan', () => {
    for (const orphan of [...orphanRegistry.orphans]) {
      assert.ok(orphan.targetOrphans.size > 0);
      for (const [target] of orphan.targetOrphans) {
        assert.equal(target.orphanMap.has(orphan.unit.id), true);
        assert.ok(target.orphans.find((o) => o.unit.id === orphan.unit.id) !== undefined);
      }
      orphanRegistry.deleteOrphan(orphan);
      for (const [target] of orphan.targetOrphans) {
        assert.equal(target.orphanMap.has(orphan.unit.id), false);
        assert.equal(
          target.orphans.find((o) => o.unit.id === orphan.unit.id),
          undefined,
        );
      }
      assert.equal(orphanRegistry.orphanMap.has(orphan.unit.id), false);
      assert.equal(
        orphanRegistry.orphans.find((o) => o.unit.id === orphan.unit.id),
        undefined,
      );
    }

    assert.equal(orphanRegistry.orphans.length, 0);
  });

  it('should migrate orphan', () => {
    for (const orphan of [...orphanRegistry.orphans]) {
      const unit = source.units[0];
      orphanRegistry.migrateOrphan(orphan, unit);
      assert.ok(orphan.targetOrphans.size > 0);
      for (const [target, targetOrphan] of orphan.targetOrphans) {
        assert.equal(target.orphanMap.has(orphan.unit.id), false);
        assert.equal(
          target.orphans.find((o) => o.unit.id === orphan.unit.id),
          undefined,
        );
        const migratedUnit = target.unitMap.get(unit.id)!;
        assert.equal(migratedUnit.target, targetOrphan.unit.target);
        assert.equal(migratedUnit.state, targetOrphan.unit.state);
      }
      assert.equal(orphanRegistry.orphanMap.has(orphan.unit.id), false);
      assert.equal(
        orphanRegistry.orphans.find((o) => o.unit.id === orphan.unit.id),
        undefined,
      );
    }

    assert.equal(orphanRegistry.orphans.length, 0);
  });

  it('should ignore deleted orphan', () => {
    const orphan = orphanRegistry.orphans[0];
    orphanRegistry.deleteOrphan(orphan);
    orphanRegistry.deleteOrphan(orphan);
  });

  it('should ignore migrated orphan', () => {
    const orphan = orphanRegistry.orphans[0];
    const unit = source.units[0];
    orphanRegistry.deleteOrphan(orphan);
    orphanRegistry.migrateOrphan(orphan, unit);
  });
});
