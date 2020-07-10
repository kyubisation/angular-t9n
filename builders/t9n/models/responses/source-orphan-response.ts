import { LinkHelper } from '../../link-helper';
import { TranslationSourceOrphan } from '../translation-source-orphan';

import { SourceOrphanMatchResponse } from './source-orphan-match-response';
import { SourceUnitResponse } from './source-unit-response';

export class SourceOrphanResponse extends SourceUnitResponse {
  constructor(orphan: TranslationSourceOrphan, linkHelper: LinkHelper) {
    super(orphan.unit, linkHelper);
    this._links!.self = {
      href: linkHelper.sourceOrphan(orphan),
    };
    this._embedded = {
      similar: orphan.similar
        .slice(0, 10)
        .map(({ distance, unit }) => new SourceOrphanMatchResponse(distance, unit, linkHelper)),
      locales: Array.from(orphan.targetOrphans.keys()).map((t) => t.language),
    };
  }
}
