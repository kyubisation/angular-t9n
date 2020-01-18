import { TranslationContext } from '../../translation';
import { ROUTE_TEMPLATE, TARGET_ROUTE, TARGETS_ROUTE } from '../constants';
import { Hal, HalLink, Links } from '../hal';
import { UrlFactory } from '../url-factory';

export class TargetsResponse implements Hal {
  languages: string[];
  _links?: { [key: string]: HalLink };
  _embedded?: { [key: string]: unknown };

  constructor(context: TranslationContext, urlFactory: UrlFactory) {
    this.languages = context.languages;
    this._links = new Links()
      .self(urlFactory(TARGETS_ROUTE))
      .templatedHref(
        'target',
        urlFactory(TARGET_ROUTE, { language: ROUTE_TEMPLATE }).replace(ROUTE_TEMPLATE, '{language}')
      )
      .build();
  }
}
