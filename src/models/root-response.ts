import { Hal } from './hal';

export interface RootResponse extends Hal {
  sourceLanguage: string;
  languages: string[];
  unitCount: number;
}
