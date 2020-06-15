import { TranslationTarget } from '../models';

export abstract class TranslationSerializer {
  abstract serializeTarget(target: TranslationTarget): string;
}
