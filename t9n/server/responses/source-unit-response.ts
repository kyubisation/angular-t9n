import { TranslationSourceUnit } from '../../models';
import { SOURCE_UNIT_ROUTE } from '../constants';
import { Hal, HalLink, Links } from '../hal';
import { UrlFactory } from '../url-factory';

export class SourceUnitResponse implements TranslationSourceUnit, Hal {
  id!: string;
  source!: string;
  description?: string;
  meaning?: string;
  locations?: string[];
  _links?: { [key: string]: HalLink };
  _embedded?: { [key: string]: unknown };

  constructor(unit: TranslationSourceUnit, urlFactory: UrlFactory) {
    Object.assign(this, { ...unit });
    this._links = new Links().self(urlFactory(SOURCE_UNIT_ROUTE, { id: unit.id })).build();
  }
}
