import { TranslationContext } from '../../translation-context';
import { ROOT_ROUTE, SOURCE_UNITS_ROUTE, TARGETS_ROUTE } from '../constants';
import { Hal, HalLink, Links } from '../hal';
import { UrlFactory } from '../url-factory';

export class RootResponse implements Hal {
  project: string;
  sourceFile: string;
  sourceLanguage: string;
  unitCount: number;
  _links?: { [key: string]: HalLink };
  _embedded?: { [key: string]: unknown };

  constructor(context: TranslationContext, urlFactory: UrlFactory) {
    this.project = context.project;
    this.sourceFile = context.sourceFile;
    this.sourceLanguage = context.source.language;
    this.unitCount = context.source.units.length;
    this._links = new Links()
      .self(urlFactory(ROOT_ROUTE))
      .href('targets', urlFactory(TARGETS_ROUTE))
      .href('sourceUnits', urlFactory(SOURCE_UNITS_ROUTE))
      .build();
  }
}
