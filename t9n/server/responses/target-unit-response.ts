import { TranslationTarget, TranslationTargetUnit } from '../../models';
import { SOURCE_UNIT_ROUTE, TARGET_UNIT_ROUTE } from '../constants';
import { Hal, HalLink, Links } from '../hal';
import { UrlFactory } from '../url-factory';

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

  constructor(target: TranslationTarget, unit: TranslationTargetUnit, urlFactory: UrlFactory) {
    Object.assign(this, { ...target.source.unitMap.get(unit.id), ...unit });
    this._links = new Links()
      .self(urlFactory(TARGET_UNIT_ROUTE, { language: target.language, id: unit.id }))
      .href('source', urlFactory(SOURCE_UNIT_ROUTE, { id: unit.id }))
      .build();
  }
}
