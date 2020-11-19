import { LinkHelper } from '../../link-helper';
import { TranslationTarget } from '../translation-target';
import { TranslationTargetUnit } from '../translation-target-unit';

import { TargetUnitResponse } from './target-unit-response';

export class TargetOrphanMatchResponse extends TargetUnitResponse {
  constructor(
    readonly distance: number,
    target: TranslationTarget,
    unit: TranslationTargetUnit,
    linkHelper: LinkHelper
  ) {
    super(target, unit, linkHelper);
  }
}
