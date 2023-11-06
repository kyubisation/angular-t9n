import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable } from 'rxjs';

import { PaginationResponse, TranslationTargetUnitResponse } from '../../../models';
import { TranslationDataSource } from '../../core/translation-data-source';
import { TranslationTargetService } from '../core/translation-target.service';

/**
 * Data source for the Orphans view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class OrphansDataSource extends TranslationDataSource<TranslationTargetUnitResponse> {
  constructor(
    private _translationTargetService: TranslationTargetService,
    paginator: MatPaginator,
    sort: MatSort,
  ) {
    super(paginator, sort);
  }

  protected _fetchData(
    paginator: MatPaginator,
    sort: MatSort,
  ): Observable<PaginationResponse<TranslationTargetUnitResponse>> {
    return this._translationTargetService.orphans({
      page: paginator.pageIndex,
      entriesPerPage: paginator.pageSize,
      sort: sort,
    });
  }
}
