import { TranslationSource, TranslationTarget } from '../models';

export interface PersistanceStrategy {
  readonly source: TranslationSource;
  readonly targets: ReadonlyMap<string, TranslationTarget>;
  create(language: string): Promise<TranslationTarget>;
  update(target: TranslationTarget): Promise<void>;
}
