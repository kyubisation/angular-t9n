import { TranslationTargetUnit } from './translation-target-unit';

export interface TranslationOrphan {
  unit: TranslationTargetUnit;
  similar: { distance: number; unit: TranslationTargetUnit }[];
}
