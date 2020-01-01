import { TranslationContext } from '../../translation';
import { ROOT_ROUTE, ROUTE_TEMPLATE, SOURCE_UNITS_ROUTE, TARGET_ROUTE } from '../constants';
import { Hal, HalLink, Links } from '../hal';
import { UrlFactory } from '../url-factory';

export class RootResponse implements Hal {
  sourceLanguage: string;
  languages: string[];
  unitCount: number;
  _links?: { [key: string]: HalLink };
  _embedded?: { [key: string]: unknown };

  constructor(context: TranslationContext, urlFactory: UrlFactory) {
    this.sourceLanguage = context.source.language;
    this.languages = context.languages;
    this.unitCount = context.source.units.length;
    this._links = new Links()
      .self(urlFactory(ROOT_ROUTE))
      .href('sourceUnits', urlFactory(SOURCE_UNITS_ROUTE))
      .templatedHref(
        'targets',
        urlFactory(TARGET_ROUTE, { language: ROUTE_TEMPLATE }).replace(ROUTE_TEMPLATE, '{language}')
      )
      .build();
  }
}
