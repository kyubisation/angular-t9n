import { TranslationTarget } from '../translation-target';

export interface TranslationSerializer {
  serializeTarget(
    target: TranslationTarget,
    options: {
      encoding: string;
      original: string;
      includeContextInTarget: boolean;
    }
  ): Promise<void>;
}
