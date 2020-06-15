import { LinkHelper } from '../../link-helper';
import { Hal, HalLink, Links } from '../hal';
import { TranslationSourceUnit } from '../translation-source-unit';

export class SourceUnitResponse implements TranslationSourceUnit, Hal {
  id!: string;
  source!: string;
  description?: string;
  meaning?: string;
  locations?: string[];
  _links?: { [key: string]: HalLink };
  _embedded?: { [key: string]: unknown };

  constructor(unit: TranslationSourceUnit, linkHelper: LinkHelper) {
    Object.assign(this, { ...unit });
    this._links = new Links().self(linkHelper.sourceUnit(unit)).build();
  }
}
