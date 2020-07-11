import { Hal } from './hal';

export interface TranslationSourceUnitResponse extends Hal {
  id: string;
  source: string;
  description?: string;
  meaning?: string;
  locations?: string[];
}
