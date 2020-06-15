import { LinkHelper } from '../../link-helper';
import { TranslationOrphan } from '../translation-orphan';
import { TranslationTarget } from '../translation-target';

import { OrphanMatchResponse } from './orphan-match-response';
import { TargetUnitResponse } from './target-unit-response';

export class OrphanResponse extends TargetUnitResponse {
  constructor(target: TranslationTarget, orphan: TranslationOrphan, linkHelper: LinkHelper) {
    super(target, orphan.unit, linkHelper);
    this._links!.self = {
      href: linkHelper.targetOrphan(orphan, target),
    };
    this._embedded = {
      similar: orphan.similar
        .slice(0, 10)
        .map(({ distance, unit }) => new OrphanMatchResponse(distance, target, unit, linkHelper)),
    };
  }
}
