import { Body, Controller, Get, NotFoundException, Param, Put, Query } from '@nestjs/common';

import { LinkHelper } from '../link-helper';
import {
  FilterableBuilder,
  PaginationResponse,
  SortableBuilder,
  TargetUnitRequest,
  TargetUnitResponse,
  TranslationTargetUnit,
} from '../models';
import { TranslationTargetRegistry } from '../persistence';

@Controller('targets/:language/units')
export class TargetUnitsController {
  private _targetUnitSortables = new SortableBuilder<TranslationTargetUnit>()
    .addSortables('id', 'source', 'state')
    .addSafeSortables('description', 'meaning', 'target')
    .build();
  private _targetUnitFilterables = new FilterableBuilder<TranslationTargetUnit>()
    .addFilterables('id', 'description', 'meaning', 'source', 'target', 'state')
    .build();

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
      sortables: this._targetUnitSortables,
      filterables: this._targetUnitFilterables,
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
