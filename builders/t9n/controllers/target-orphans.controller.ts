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
import { OrphanResponse, PaginationResponse, TranslationOrphan } from '../models';
import { PersistanceStrategy, TranslationTargetRegistry } from '../persistance';

@Controller('targets/:language/orphans')
export class TargetOrphansController {
  constructor(
    private _translationTargetRegistry: TranslationTargetRegistry,
    private _persistanceStrategy: PersistanceStrategy,
    private _linkHelper: LinkHelper
  ) {}

  @Get()
  getPagination(
    @Param('language') language: string,
    @Query() queryParams: any
  ): PaginationResponse<TranslationOrphan, OrphanResponse> {
    const target = this._translationTargetRegistry.get(language);
    if (!target) {
      throw new NotFoundException('Target does not exist');
    }

    return new PaginationResponse({
      query: queryParams,
      entries: target.orphans,
      responseMapper: (orphan) => new OrphanResponse(target, orphan, this._linkHelper),
      urlFactory: (query) => this._linkHelper.targetOrphans(target, query),
      sortables: {
        id: (a, b) => (a.unit.id || '').localeCompare(b.unit.id || ''),
        description: (a, b) => (a.unit.description || '').localeCompare(b.unit.description || ''),
        meaning: (a, b) => (a.unit.meaning || '').localeCompare(b.unit.meaning || ''),
        source: (a, b) => (a.unit.source || '').localeCompare(b.unit.source || ''),
        target: (a, b) => (a.unit.target || '').localeCompare(b.unit.target || ''),
        state: (a, b) => (a.unit.state || '').localeCompare(b.unit.state || ''),
      },
      filterables: {
        id: (f) => (e) => (e.unit.id ? e.unit.id.includes(f) : false),
        description: (f) => (e) => (e.unit.description ? e.unit.description.includes(f) : false),
        meaning: (f) => (e) => (e.unit.meaning ? e.unit.meaning.includes(f) : false),
        source: (f) => (e) => (e.unit.source ? e.unit.source.includes(f) : false),
        target: (f) => (e) => (e.unit.target ? e.unit.target.includes(f) : false),
        state: (f) => (e) => (e.unit.state ? e.unit.state.includes(f) : false),
      },
    });
  }

  @Get(':id')
  getTargetUnit(@Param('language') language: string, @Param('id') id: string): OrphanResponse {
    const target = this._translationTargetRegistry.get(language);
    if (!target) {
      throw new NotFoundException('Target does not exist');
    }

    const orphan = target.orphanMap.get(id);
    if (!orphan) {
      throw new NotFoundException('Orphan does not exist');
    }

    return new OrphanResponse(target, orphan, this._linkHelper);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  updateTargetUnit(@Param('language') language: string, @Param('id') id: string): void {
    const target = this._translationTargetRegistry.get(language);
    if (!target) {
      throw new NotFoundException('Target does not exist');
    }

    const orphan = target.orphanMap.get(id);
    if (!orphan) {
      throw new NotFoundException('Orphan does not exist');
    }

    target.orphanMap.delete(id);
    const index = target.orphans.indexOf(orphan);
    target.orphans.splice(index, 1);
    this._persistanceStrategy.update(target);
  }
}
