import { Body, Controller, Get, NotFoundException, Param, Put, Query } from '@nestjs/common';

import { LinkHelper } from '../link-helper';
import {
  PaginationResponse,
  TargetUnitRequest,
  TargetUnitResponse,
  TranslationTargetUnit,
} from '../models';
import { TranslationTargetRegistry } from '../persistence';

@Controller('targets/:language/units')
export class TargetUnitsController {
  constructor(
    private _translationTargetRegistry: TranslationTargetRegistry,
    private _linkHelper: LinkHelper
  ) {}

  @Get()
  getPagination(
    @Param('language') language: string,
    @Query() queryParams: any
  ): PaginationResponse<TranslationTargetUnit, TargetUnitResponse> {
    const target = this._translationTargetRegistry.get(language);
    if (!target) {
      throw new NotFoundException('Target does not exist');
    }

    return new PaginationResponse({
      query: queryParams,
      entries: target.units,
      responseMapper: (unit) => new TargetUnitResponse(target, unit, this._linkHelper),
      urlFactory: (query) => this._linkHelper.targetUnits(target, query),
      sortables: {
        id: (a, b) => a.id.localeCompare(b.id),
        description: (a, b) => (a.description || '').localeCompare(b.description || ''),
        meaning: (a, b) => (a.meaning || '').localeCompare(b.meaning || ''),
        source: (a, b) => a.source.localeCompare(b.source),
        target: (a, b) => (a.target || '').localeCompare(b.target || ''),
        state: (a, b) => a.state.localeCompare(b.state),
      },
      filterables: {
        id: (f) => (e) => !!e.id && e.id.includes(f),
        description: (f) => (e) => !!e.description && e.description.includes(f),
        meaning: (f) => (e) => !!e.meaning && e.meaning.includes(f),
        source: (f) => (e) => !!e.source && e.source.includes(f),
        target: (f) => (e) => !!e.target && e.target.includes(f),
        state: (f) => (e) => !!e.state && e.state.includes(f),
      },
    });
  }

  @Get(':id')
  getTargetUnit(@Param('language') language: string, @Param('id') id: string): TargetUnitResponse {
    const target = this._translationTargetRegistry.get(language);
    if (!target) {
      throw new NotFoundException('Target does not exist');
    }

    const unit = target.unitMap.get(id);
    if (!unit) {
      throw new NotFoundException('Unit does not exist');
    }

    return new TargetUnitResponse(target, unit, this._linkHelper);
  }

  @Put(':id')
  updateTargetUnit(
    @Param('language') language: string,
    @Param('id') id: string,
    @Body() body: TargetUnitRequest
  ): TargetUnitResponse {
    const target = this._translationTargetRegistry.get(language);
    if (!target) {
      throw new NotFoundException('Target does not exist');
    }

    const unit = target.unitMap.get(id);
    if (!unit) {
      throw new NotFoundException('Unit does not exist');
    }

    const translatedUnit = target.translateUnit(unit, body);
    return new TargetUnitResponse(target, translatedUnit, this._linkHelper);
  }
}
