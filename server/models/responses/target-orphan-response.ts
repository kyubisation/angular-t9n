import { LinkHelper } from '../../link-helper';
import { TranslationTarget } from '../translation-target';
import { TranslationTargetOrphan } from '../translation-target-orphan';

import { TargetOrphanMatchResponse } from './target-orphan-match-response';
import { TargetUnitResponse } from './target-unit-response';

export class TargetOrphanResponse extends TargetUnitResponse {
  constructor(target: TranslationTarget, orphan: TranslationTargetOrphan, linkHelper: LinkHelper) {
    super(target, orphan.unit, linkHelper);
    this._links!.self = {
      href: linkHelper.targetOrphan(orphan, target),
    };
    this._embedded = {
      similar: orphan.similar
        .slice(0, 10)
        .map(
          ({ distance, unit }) => new TargetOrphanMatchResponse(distance, target, unit, linkHelper),
        ),
    };
  }
}
