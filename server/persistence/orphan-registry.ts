import { Injectable } from '@nestjs/common';

import {
  TranslationSource,
  TranslationSourceOrphan,
  TranslationSourceUnit,
  TranslationTarget,
  TranslationTargetOrphan,
} from '../models';

import { TranslationTargetRegistry } from './translation-target-registry';

@Injectable()
export class OrphanRegistry {
  readonly orphans: TranslationSourceOrphan[];
  readonly orphanMap = new Map<string, TranslationSourceOrphan>();

  constructor(translationTargetRegistry: TranslationTargetRegistry, source: TranslationSource) {
    for (const translationTarget of translationTargetRegistry.values()) {
      for (const orphan of translationTarget.orphans) {
        const sourceOrphan = this.orphanMap.get(orphan.unit.id);
        if (sourceOrphan) {
          sourceOrphan.targetOrphans.set(translationTarget, orphan);
        } else {
          const { target, state, ...unit } = orphan.unit;
          this.orphanMap.set(orphan.unit.id, {
            unit,
            similar: orphan.similar.map((s) => ({
              distance: s.distance,
              unit: source.unitMap.get(s.unit.id)!,
            })),
            targetOrphans: new Map<TranslationTarget, TranslationTargetOrphan>().set(
              translationTarget,
              orphan
            ),
          });
        }
      }
    }
    this.orphans = Array.from(this.orphanMap.values()).sort((a, b) =>
      a.unit.id.localeCompare(b.unit.id)
    );
  }

  migrateOrphan(orphan: TranslationSourceOrphan, unit: TranslationSourceUnit) {
    if (this.orphanMap.delete(orphan.unit.id)) {
      const index = this.orphans.indexOf(orphan);
      this.orphans.splice(index, 1);
      orphan.targetOrphans.forEach((targetOrphan, target) => {
        const targetUnit = target.unitMap.get(unit.id)!;
        target.migrateOrphan(targetOrphan, targetUnit);
      });
    }
  }

  deleteOrphan(orphan: TranslationSourceOrphan) {
    if (this.orphanMap.delete(orphan.unit.id)) {
      const index = this.orphans.indexOf(orphan);
      this.orphans.splice(index, 1);
      orphan.targetOrphans.forEach((targetOrphan, target) => target.deleteOrphan(targetOrphan));
    }
  }
}
