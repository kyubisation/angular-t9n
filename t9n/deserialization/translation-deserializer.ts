import { TranslationSourceUnit, TranslationTargetUnit } from '../models';

import { TranslationDeserializationResult } from './translation-deserialization-result';

export interface TranslationDeserializer {
  deserializeSource(content: string): TranslationDeserializationResult<TranslationSourceUnit>;
  deserializeTarget(content: string): TranslationDeserializationResult<TranslationTargetUnit>;
}
