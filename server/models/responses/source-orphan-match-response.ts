import { LinkHelper } from '../../link-helper';
import { TranslationSourceUnit } from '../translation-source-unit';

import { SourceUnitResponse } from './source-unit-response';

export class SourceOrphanMatchResponse extends SourceUnitResponse {
  constructor(
    readonly distance: number,
    unit: TranslationSourceUnit,
    linkHelper: LinkHelper,
  ) {
    super(unit, linkHelper);
  }
}
