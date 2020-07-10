import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';

import { LinkHelper } from '../link-helper';
import { TargetResponse, TargetsResponse } from '../models';
import { TranslationTargetRegistry } from '../persistence';

@Controller('targets')
export class TargetsController {
  constructor(
    private _translationTargetRegistry: TranslationTargetRegistry,
    private _linkHelper: LinkHelper
  ) {}

  @Get()
  targets(): TargetsResponse {
    return new TargetsResponse(this._translationTargetRegistry.keys(), this._linkHelper);
  }

  @Get(':language')
  target(@Param('language') language: string) {
    const target = this._translationTargetRegistry.get(language);
    if (!target) {
      throw new NotFoundException('Target does not exist');
    }

    return new TargetResponse(target, this._linkHelper);
  }

  @Post(':language')
  async createTarget(@Param('language') language: string) {
    const existingTarget = this._translationTargetRegistry.get(language);
    if (existingTarget) {
      throw new BadRequestException('Target already exists');
    }

    const target = await this._translationTargetRegistry.create(language);
    return new TargetResponse(target, this._linkHelper);
  }
}
