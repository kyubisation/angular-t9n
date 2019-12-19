import { TranslationTarget } from '../translation-target';

export interface TranslationSerializer {
  serializeTarget(
    file: string,
    target: TranslationTarget,
    options: {
      encoding: string;
      original: string;
      includeContextInTarget: boolean;
    }
  ): Promise<void>;
}
