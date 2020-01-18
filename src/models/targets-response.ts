import { Hal } from './hal';

export interface TargetsResponse extends Hal {
  languages: string[];
}
