import {
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
import { PaginationResponse, TargetOrphanResponse, TranslationTargetOrphan } from '../models';
import { TranslationTargetRegistry } from '../persistence';

@Controller('targets/:language/orphans')
export class TargetOrphansController {
  constructor(
    private _translationTargetRegistry: TranslationTargetRegistry,
    private _linkHelper: LinkHelper
  ) {}

  @Get()
  getPagination(
    @Param('language') language: string,
    @Query() queryParams: any
  ): PaginationResponse<TranslationTargetOrphan, TargetOrphanResponse> {
    const target = this._translationTargetRegistry.get(language);
    if (!target) {
      throw new NotFoundException('Target does not exist');
    }

    return new PaginationResponse({
      query: queryParams,
      entries: target.orphans,
      responseMapper: (orphan) => new TargetOrphanResponse(target, orphan, this._linkHelper),
      urlFactory: (query) => this._linkHelper.targetOrphans(target, query),
      sortables: {
        id: (a, b) => a.unit.id.localeCompare(b.unit.id),
        description: (a, b) => (a.unit.description || '').localeCompare(b.unit.description || ''),
        meaning: (a, b) => (a.unit.meaning || '').localeCompare(b.unit.meaning || ''),
        source: (a, b) => a.unit.source.localeCompare(b.unit.source),
        target: (a, b) => (a.unit.target || '').localeCompare(b.unit.target || ''),
        state: (a, b) => a.unit.state.localeCompare(b.unit.state),
      },
      filterables: {
        id: (f) => (e) => !!e.unit.id && e.unit.id.includes(f),
        description: (f) => (e) => !!e.unit.description && e.unit.description.includes(f),
        meaning: (f) => (e) => !!e.unit.meaning && e.unit.meaning.includes(f),
        source: (f) => (e) => !!e.unit.source && e.unit.source.includes(f),
        target: (f) => (e) => !!e.unit.target && e.unit.target.includes(f),
        state: (f) => (e) => !!e.unit.state && e.unit.state.includes(f),
      },
    });
  }

  @Get(':id')
  getOrphan(@Param('language') language: string, @Param('id') id: string): TargetOrphanResponse {
    const target = this._translationTargetRegistry.get(language);
    if (!target) {
      throw new NotFoundException('Target does not exist');
    }

    const orphan = target.orphanMap.get(id);
    if (!orphan) {
      throw new NotFoundException('Orphan does not exist');
    }

    return new TargetOrphanResponse(target, orphan, this._linkHelper);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteOrphan(@Param('language') language: string, @Param('id') id: string): void {
    const target = this._translationTargetRegistry.get(language);
    if (!target) {
      throw new NotFoundException('Target does not exist');
    }

    const orphan = target.orphanMap.get(id);
    if (!orphan) {
      throw new NotFoundException('Orphan does not exist');
    }

    target.deleteOrphan(orphan);
  }
}
