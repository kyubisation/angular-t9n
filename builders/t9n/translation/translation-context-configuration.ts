import { TranslationSerializer } from './serialization/translation-serializer';
import { TranslationSource } from './translation-source';
import { TranslationTarget } from './translation-target';

export interface TranslationContextConfiguration {
  encoding: string;
  includeContextInTarget: boolean;
  source: TranslationSource;
  targets: Map<string, TranslationTarget>;
  serializer: TranslationSerializer;
  original: string;
  filenameFactory: (target: TranslationTarget) => string;
}
