import { LinkHelper } from '../../link-helper';
import { Hal, HalLink, LinkBuilder } from '../hal';
import { TranslationTarget } from '../translation-target';
import { TranslationTargetUnit } from '../translation-target-unit';

export class TargetUnitResponse implements TranslationTargetUnit, Hal {
  id!: string;
  source!: string;
  target!: string;
  state!: 'initial' | 'translated' | 'reviewed' | 'final';
  description?: string;
  meaning?: string;
  locations?: string[];
  _links?: { [key: string]: HalLink };
  _embedded?: { [key: string]: unknown };

  constructor(target: TranslationTarget, unit: TranslationTargetUnit, linkHelper: LinkHelper) {
    Object.assign(this, { ...target.source.unitMap.get(unit.id), ...unit });
    this._links = new LinkBuilder()
      .self(linkHelper.targetUnit(unit, target))
      .href('source', linkHelper.sourceUnit(unit.id))
      .build();
  }
}
