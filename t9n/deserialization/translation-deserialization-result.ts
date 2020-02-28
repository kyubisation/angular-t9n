export interface TranslationDeserializationResult<TUnit> {
  language: string;
  unitMap: Map<string, TUnit>;
}
