import { TranslationTarget, TranslationTargetUnit } from '../../translation';
import { UrlFactory } from '../url-factory';

import { TargetUnitResponse } from './target-unit-response';

export class OrphanMatchResponse extends TargetUnitResponse {
  constructor(
    readonly distance: number,
    target: TranslationTarget,
    unit: TranslationTargetUnit,
    urlFactory: UrlFactory
  ) {
    super(target, unit, urlFactory);
  }
}
