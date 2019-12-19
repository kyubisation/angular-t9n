import { Hal } from './hal';

export interface TargetResponse extends Hal {
  language: string;
  unitCount: number;
  initialCount: number;
  translatedCount: number;
  reviewedCount: number;
  finalCount: number;
  orphanCount: number;
}
