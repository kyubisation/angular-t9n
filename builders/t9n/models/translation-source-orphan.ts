import { TranslationSourceUnit } from './translation-source-unit';
import { TranslationTarget } from './translation-target';
import { TranslationTargetOrphan } from './translation-target-orphan';

export interface TranslationSourceOrphan {
  unit: TranslationSourceUnit;
  similar: { distance: number; unit: TranslationSourceUnit }[];
  targetOrphans: Map<TranslationTarget, TranslationTargetOrphan>;
}
