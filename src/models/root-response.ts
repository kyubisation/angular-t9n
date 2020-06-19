import { Hal } from './hal';

export interface RootResponse extends Hal {
  sourceLanguage: string;
  unitCount: number;
}
