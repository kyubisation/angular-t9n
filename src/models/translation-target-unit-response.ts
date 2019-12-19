import { Hal } from './hal';

export interface TranslationTargetUnitResponse extends Hal {
  id: string;
  source: string;
  target: string;
  state: 'initial' | 'translated' | 'reviewed' | 'final';
  description?: string;
  meaning?: string;
  locations?: string[];
}
