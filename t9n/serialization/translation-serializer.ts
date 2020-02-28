import { TranslationTarget } from '../models';

export interface TranslationSerializer {
  serializeTarget(target: TranslationTarget): string;
}
