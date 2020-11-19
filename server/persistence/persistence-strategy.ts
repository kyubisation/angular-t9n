import { TranslationTarget } from '../models';

export abstract class PersistenceStrategy {
  abstract create(target: TranslationTarget): Promise<void>;
  abstract update(target: TranslationTarget): Promise<void>;
}
