import { logging } from '@angular-devkit/core';

import { TranslationSerializer } from './serialization/translation-serializer';
import { TranslationSource } from './translation-source';
import { TranslationTarget } from './translation-target';

export interface TranslationContextConfiguration {
  logger: logging.LoggerApi;
  project: string;
  includeContextInTarget: boolean;
  source: TranslationSource;
  sourceFile: string;
  targets: Map<string, TranslationTarget>;
  serializer: TranslationSerializer;
  original: string;
  filenameFactory: (language: string) => string;
}
