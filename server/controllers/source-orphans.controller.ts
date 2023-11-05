import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';

import { LinkHelper } from '../link-helper';
import {
  FilterableBuilder,
  PaginationResponse,
  SortableBuilder,
  SourceOrphanRequest,
  SourceOrphanResponse,
  TranslationSource,
  TranslationSourceOrphan,
} from '../models';
import { OrphanRegistry } from '../persistence';

@Controller('source/orphans')
export class SourceOrphansController {
  private _sourceOrphanSortables = new SortableBuilder<TranslationSourceOrphan>((o) => o.unit)
    .addSortables('id', 'source')
    .addSafeSortables('description', 'meaning')
    .build();
  private _sourceOrphanFilterables = new FilterableBuilder<TranslationSourceOrphan>((o) => o.unit)
    .addFilterables('id', 'description', 'meaning', 'source')
    .build();

  constructor(
    private _source: TranslationSource,
    private _orphanRegistry: OrphanRegistry,
    private _linkHelper: LinkHelper,
  ) {}

  @Get()
  getPagination(
    @Query() queryParams: any,
  ): PaginationResponse<TranslationSourceOrphan, SourceOrphanResponse> {
    return new PaginationResponse({
      query: queryParams,
      entries: this._orphanRegistry.orphans,
      responseMapper: (orphan) => new SourceOrphanResponse(orphan, this._linkHelper),
      urlFactory: (query) => this._linkHelper.sourceOrphans(query),
      sortables: this._sourceOrphanSortables,
      filterables: this._sourceOrphanFilterables,
    });
  }

  @Get(':id')
  getOrphan(@Param('id') id: string): SourceOrphanResponse {
    const orphan = this._orphanRegistry.orphanMap.get(id);
    if (!orphan) {
      throw new NotFoundException('Orphan does not exist');
    }

    return new SourceOrphanResponse(orphan, this._linkHelper);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteOrphan(@Param('id') id: string, @Body() body?: SourceOrphanRequest): void {
    const orphan = this._orphanRegistry.orphanMap.get(id);
    if (!orphan) {
      throw new NotFoundException('Orphan does not exist');
    }

    if (!body || !body.id) {
      this._orphanRegistry.deleteOrphan(orphan);
      return;
    }

    const sourceUnit = this._source.unitMap.get(body.id);
    if (!sourceUnit) {
      throw new NotFoundException('Migration unit does not exist');
    }

    this._orphanRegistry.migrateOrphan(orphan, sourceUnit);
  }
}
