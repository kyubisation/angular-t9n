import { TranslationTarget } from '../models';

export abstract class PersistanceStrategy {
  abstract languages(): string[];
  abstract get(language: string): TranslationTarget | undefined;
  abstract create(language: string): Promise<TranslationTarget>;
  abstract update(target: TranslationTarget): Promise<void>;
}
