import { Controller, Get } from '@nestjs/common';

import { LinkHelper } from '../link-helper';
import { RootResponse, TranslationSource } from '../models';

@Controller()
export class AppController {
  constructor(private _translationSource: TranslationSource, private _linkHelper: LinkHelper) {}

  @Get()
  root(): RootResponse {
    return new RootResponse(this._translationSource, this._linkHelper);
  }
}
