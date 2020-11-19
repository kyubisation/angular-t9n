import { LinkHelper } from '../../link-helper';
import { Hal, HalLink, LinkBuilder } from '../hal';
import { TranslationTarget } from '../translation-target';

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

  constructor(target: TranslationTarget, linkHelper: LinkHelper) {
    this.language = target.language;
    const counter = { initial: 0, translated: 0, reviewed: 0, final: 0 };
    target.units.forEach((u) => ++counter[u.state]);
    this.unitCount = target.units.length;
    this.initialCount = counter.initial;
    this.translatedCount = counter.translated;
    this.reviewedCount = counter.reviewed;
    this.finalCount = counter.final;
    this.orphanCount = target.orphans.length;

    this._links = new LinkBuilder()
      .self(linkHelper.target(target.language))
      .href('units', linkHelper.targetUnits(target))
      .templatedHref('unit', linkHelper.targetUnit('{id}', target))
      .href('orphans', linkHelper.targetOrphans(target))
      .templatedHref('orphan', linkHelper.targetOrphan('{id}', target))
      .build();
  }
}
