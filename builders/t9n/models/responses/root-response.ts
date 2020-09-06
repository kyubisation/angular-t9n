import { LinkHelper } from '../../link-helper';
import { Hal, HalLink, LinkBuilder } from '../hal';
import { TranslationSource } from '../translation-source';

export class RootResponse implements Hal {
  sourceLanguage: string;
  unitCount: number;
  _links?: { [key: string]: HalLink };
  _embedded?: { [key: string]: unknown };

  constructor(source: TranslationSource, linkHelper: LinkHelper) {
    this.sourceLanguage = source.language;
    this.unitCount = source.units.length;
    this._links = new LinkBuilder()
      .self(linkHelper.root())
      .href('targets', linkHelper.targets())
      .href('sourceUnits', linkHelper.sourceUnits())
      .href('orphans', linkHelper.sourceOrphans())
      .templatedHref('orphan', linkHelper.sourceOrphan('{id}'))
      .build();
  }
}
