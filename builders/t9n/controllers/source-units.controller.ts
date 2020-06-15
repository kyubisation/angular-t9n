import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';

import { LinkHelper } from '../link-helper';
import {
  PaginationResponse,
  QueryParams,
  SourceUnitResponse,
  TargetUnitResponse,
  TranslationSource,
  TranslationSourceUnit,
} from '../models';
import { TranslationTargetRegistry } from '../persistance';

@Controller('source/units')
export class SourceUnitsController {
  constructor(
    private _translationSource: TranslationSource,
    private _translationTargetRegistry: TranslationTargetRegistry,
    private _linkHelper: LinkHelper
  ) {}

  @Get()
  getPagination(
    @Query() queryParams: QueryParams
  ): PaginationResponse<TranslationSourceUnit, SourceUnitResponse> {
    return new PaginationResponse({
      query: queryParams,
      entries: this._translationSource.units,
      responseMapper: (unit) => {
        const sourceUnit = new SourceUnitResponse(unit, this._linkHelper);
        sourceUnit._embedded = this._createEmbeddedObject(unit);
        return sourceUnit;
      },
      urlFactory: (query) => this._linkHelper.sourceUnits(query),
    });
  }

  @Get(':id')
  getSourceUnit(@Param('id') id: string): SourceUnitResponse {
    const unit = this._translationSource.unitMap.get(id);
    if (!unit) {
      throw new NotFoundException('Source unit does not exist');
    }

    const sourceUnit = new SourceUnitResponse(unit, this._linkHelper);
    sourceUnit._embedded = this._createEmbeddedObject(unit);
    return sourceUnit;
  }

  private _createEmbeddedObject(unit: TranslationSourceUnit) {
    return this._translationTargetRegistry.values().reduce(
      (current, next) =>
        Object.assign(current, {
          [next.language]: new TargetUnitResponse(
            next,
            next.unitMap.get(unit.id)!,
            this._linkHelper
          ),
        }),
      {} as { [language: string]: TargetUnitResponse }
    );
  }
}
