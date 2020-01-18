import { Hal } from './hal';

export interface RootResponse extends Hal {
  project: string;
  sourceFile: string;
  sourceLanguage: string;
  unitCount: number;
}
