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
import {
  FilterableBuilder,
  PaginationResponse,
  SortableBuilder,
  TargetOrphanResponse,
  TranslationTargetOrphan,
} from '../models';
import { TranslationTargetRegistry } from '../persistence';

@Controller('targets/:language/orphans')
export class TargetOrphansController {
  private _targetOrphanSortables = new SortableBuilder<TranslationTargetOrphan>((o) => o.unit)
    .addSortables('id', 'source', 'state')
    .addSafeSortables('description', 'meaning', 'target')
    .build();
  private _targetOrphanFilterables = new FilterableBuilder<TranslationTargetOrphan>((o) => o.unit)
    .addFilterables('id', 'description', 'meaning', 'source', 'target', 'state')
    .build();

  constructor(
    private _translationTargetRegistry: TranslationTargetRegistry,
    private _linkHelper: LinkHelper,
  ) {}

  @Get()
  getPagination(
    @Param('language') language: string,
    @Query() queryParams: any,
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
      sortables: this._targetOrphanSortables,
      filterables: this._targetOrphanFilterables,
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
