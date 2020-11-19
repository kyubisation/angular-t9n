import { TranslationSourceUnit, TranslationTargetUnit } from '../models';

import { TranslationDeserializationResult } from './translation-deserialization-result';

export abstract class TranslationDeserializer {
  abstract deserializeSource(
    content: string
  ): TranslationDeserializationResult<TranslationSourceUnit>;
  abstract deserializeTarget(
    content: string
  ): TranslationDeserializationResult<TranslationTargetUnit>;
}
