import { TranslationOrphan, TranslationTarget } from '../../translation';
import { ORPHAN_ROUTE } from '../constants';
import { UrlFactory } from '../url-factory';

import { OrphanMatchResponse } from './orphan-match-response';
import { TargetUnitResponse } from './target-unit-response';

export class OrphanResponse extends TargetUnitResponse {
  constructor(target: TranslationTarget, orphan: TranslationOrphan, urlFactory: UrlFactory) {
    super(target, orphan.unit, urlFactory);
    this._links!.self = {
      href: urlFactory(ORPHAN_ROUTE, { language: target.language, id: this.id })
    };
    this._embedded = {
      similar: orphan.similar
        .slice(0, 10)
        .map(({ distance, unit }) => new OrphanMatchResponse(distance, target, unit, urlFactory))
    };
  }
}
