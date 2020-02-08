import { TranslationTarget } from '../translation-target';

export interface TranslationSerializer {
  serializeTarget(
    target: TranslationTarget,
    options: {
      original: string;
      includeContextInTarget: boolean;
    }
  ): Promise<void>;
}
