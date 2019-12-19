import { TranslationContext, TranslationSourceUnit } from '../../translation';
import { UrlFactory } from '../url-factory';

import { SourceUnitResponse } from './source-unit-response';
import { TargetUnitResponse } from './target-unit-response';

export class SourceUnitWithTranslationsResponse extends SourceUnitResponse {
  constructor(
    unit: TranslationSourceUnit,
    translationContext: TranslationContext,
    urlFactory: UrlFactory
  ) {
    super(unit, urlFactory);
    this._embedded = translationContext.languages
      .map(l => translationContext.target(l)!)
      .reduce(
        (current, next) =>
          Object.assign(current, {
            [next.language]: new TargetUnitResponse(next, next.unitMap.get(unit.id)!, urlFactory)
          }),
        {} as { [language: string]: TargetUnitResponse }
      );
  }
}
