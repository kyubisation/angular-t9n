import { TranslationTarget } from '../../translation';
import {
  ORPHANS_ROUTE,
  ROUTE_TEMPLATE,
  TARGET_ROUTE,
  TARGET_UNIT_ROUTE,
  TARGET_UNITS_ROUTE
} from '../constants';
import { Hal, HalLink, Links } from '../hal';
import { UrlFactory } from '../url-factory';

export class TargetResponse implements Hal {
  language: string;
  unitCount: number;
  initialCount: number;
  translatedCount: number;
  reviewedCount: number;
  finalCount: number;
  orphanCount: number;
  _links?: { [key: string]: HalLink };
  _embedded?: { [key: string]: unknown };

  constructor(target: TranslationTarget, urlFactory: UrlFactory) {
    this.language = target.language;
    const counter = { initial: 0, translated: 0, reviewed: 0, final: 0 };
    target.units.forEach(u => ++counter[u.state]);
    this.unitCount = target.units.length;
    this.initialCount = counter.initial;
    this.translatedCount = counter.translated;
    this.reviewedCount = counter.reviewed;
    this.finalCount = counter.final;
    this.orphanCount = target.orphans.length;

    this._links = new Links()
      .self(urlFactory(TARGET_ROUTE, { language: target.language }))
      .href('units', urlFactory(TARGET_UNITS_ROUTE, { language: target.language }))
      .hrefWhen(this.orphanCount > 0, 'orphans', () =>
        urlFactory(ORPHANS_ROUTE, { language: target.language })
      )
      .templatedHref(
        'unit',
        urlFactory(TARGET_UNIT_ROUTE, { language: target.language, id: ROUTE_TEMPLATE }).replace(
          ROUTE_TEMPLATE,
          '{id}'
        )
      )
      .build();
  }
}
