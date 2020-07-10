import { generateOrphans } from '../../../test';
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
    orphanRegistry.orphans.forEach((orphan) => {
      orphan.targetOrphans.forEach((_, target) => {
        expect(target.orphanMap.has(orphan.unit.id)).toBeTruthy();
        expect(target.orphans.find((o) => o.unit.id === orphan.unit.id)).toBeDefined();
      });
      orphanRegistry.deleteOrphan(orphan);
      expect(orphan.targetOrphans.size).toBeGreaterThan(0);
      orphan.targetOrphans.forEach((_, target) => {
        expect(target.orphanMap.has(orphan.unit.id)).toBeFalsy();
        expect(target.orphans.find((o) => o.unit.id === orphan.unit.id)).toBeUndefined();
      });
      expect(orphanRegistry.orphanMap.has(orphan.unit.id)).toBeFalsy();
      expect(orphanRegistry.orphans.find((o) => o.unit.id === orphan.unit.id)).toBeUndefined();
    });
  });

  it('should migrate orphan', () => {
    orphanRegistry.orphans.forEach((orphan) => {
      const unit = source.units[0];
      orphanRegistry.migrateOrphan(orphan, unit);
      expect(orphan.targetOrphans.size).toBeGreaterThan(0);
      orphan.targetOrphans.forEach((targetOrphan, target) => {
        expect(target.orphanMap.has(orphan.unit.id)).toBeFalsy();
        expect(target.orphans.find((o) => o.unit.id === orphan.unit.id)).toBeUndefined();
        const migratedUnit = target.unitMap.get(unit.id)!;
        expect(migratedUnit.target).toEqual(targetOrphan.unit.target);
        expect(migratedUnit.state).toEqual(targetOrphan.unit.state);
      });
      expect(orphanRegistry.orphanMap.has(orphan.unit.id)).toBeFalsy();
      expect(orphanRegistry.orphans.find((o) => o.unit.id === orphan.unit.id)).toBeUndefined();
    });
  });

  it('should ignore deleted orphan', () => {
    const orphan = orphanRegistry.orphans[0];
    orphanRegistry.deleteOrphan(orphan);
    expect(() => orphanRegistry.deleteOrphan(orphan)).not.toThrow();
  });

  it('should ignore migrated orphan', () => {
    const orphan = orphanRegistry.orphans[0];
    const unit = source.units[0];
    orphanRegistry.deleteOrphan(orphan);
    expect(() => orphanRegistry.migrateOrphan(orphan, unit)).not.toThrow();
  });
});
