import { TranslationTargetUnitResponse } from './translation-target-unit-response';

export interface OrphanMatchResponse extends TranslationTargetUnitResponse {
  distance: number;
}
