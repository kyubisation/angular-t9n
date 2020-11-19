import { TranslationTargetUnit } from './translation-target-unit';

export interface TranslationTargetOrphan {
  unit: TranslationTargetUnit;
  similar: { distance: number; unit: TranslationTargetUnit }[];
}
