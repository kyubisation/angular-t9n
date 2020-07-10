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
  PaginationResponse,
  SourceOrphanRequest,
  SourceOrphanResponse,
  TranslationSource,
  TranslationSourceOrphan,
} from '../models';
import { OrphanRegistry } from '../persistence';

@Controller('source/orphans')
export class SourceOrphansController {
  constructor(
    private _source: TranslationSource,
    private _orphanRegistry: OrphanRegistry,
    private _linkHelper: LinkHelper
  ) {}

  @Get()
  getPagination(
    @Query() queryParams: any
  ): PaginationResponse<TranslationSourceOrphan, SourceOrphanResponse> {
    return new PaginationResponse({
      query: queryParams,
      entries: this._orphanRegistry.orphans,
      responseMapper: (orphan) => new SourceOrphanResponse(orphan, this._linkHelper),
      urlFactory: (query) => this._linkHelper.sourceOrphans(query),
      sortables: {
        id: (a, b) => a.unit.id.localeCompare(b.unit.id),
        description: (a, b) => (a.unit.description || '').localeCompare(b.unit.description || ''),
        meaning: (a, b) => (a.unit.meaning || '').localeCompare(b.unit.meaning || ''),
        source: (a, b) => a.unit.source.localeCompare(b.unit.source),
      },
      filterables: {
        id: (f) => (e) => !!e.unit.id && e.unit.id.includes(f),
        description: (f) => (e) => !!e.unit.description && e.unit.description.includes(f),
        meaning: (f) => (e) => !!e.unit.meaning && e.unit.meaning.includes(f),
        source: (f) => (e) => !!e.unit.source && e.unit.source.includes(f),
      },
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

    if (!body) {
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
