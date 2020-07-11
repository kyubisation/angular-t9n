import { FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable } from 'rxjs';

import { PaginationResponse, TranslationSourceUnitResponse } from '../../../models';
import { TranslationDataSource } from '../../core/translation-data-source';
import { SourceOrphansService } from '../core/source-orphans.service';

export class MigrateDataSource extends TranslationDataSource<TranslationSourceUnitResponse> {
  constructor(
    private _sourceOrphansService: SourceOrphansService,
    paginator: MatPaginator,
    sort: MatSort,
    filter: FormGroup
  ) {
    super(paginator, sort, filter);
  }

  protected _fetchData(
    paginator: MatPaginator,
    sort: MatSort,
    filter: FormGroup | undefined
  ): Observable<PaginationResponse<TranslationSourceUnitResponse>> {
    return this._sourceOrphansService.orphans({
      page: paginator.pageIndex,
      entriesPerPage: paginator.pageSize,
      sort: sort,
      filter: filter!.value,
    });
  }
}
