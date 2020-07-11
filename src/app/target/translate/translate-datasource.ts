import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable, Subject } from 'rxjs';

import { FormTargetUnit, PaginationResponse, TranslationTargetUnitResponse } from '../../../models';
import { TranslationDataSource } from '../../core/translation-data-source';
import { TranslationTargetService } from '../core/translation-target.service';

export class TranslateDataSource extends TranslationDataSource<
  FormTargetUnit,
  TranslationTargetUnitResponse
> {
  private _destroy = new Subject<void>();

  constructor(
    private _translationTargetService: TranslationTargetService,
    paginator: MatPaginator,
    sort: MatSort,
    filter: FormGroup
  ) {
    super(paginator, sort, filter);
  }

  protected _fetchData(
    paginator: MatPaginator,
    sort: MatSort,
    filter?: FormGroup | undefined
  ): Observable<PaginationResponse<TranslationTargetUnitResponse>> {
    this._destroy.next();
    return this._translationTargetService.units({
      page: paginator.pageIndex,
      entriesPerPage: paginator.pageSize,
      sort: sort,
      filter: filter!.value,
    });
  }

  protected _mapPaginationResponse(
    page: PaginationResponse<TranslationTargetUnitResponse>
  ): FormTargetUnit[] {
    return page._embedded!.entries.map((u) => {
      const unit: FormTargetUnit = {
        ...u,
        target: new FormControl(u.target),
        state: new FormControl({ value: u.state, disabled: !u.target }),
      };
      this._translationTargetService.updateUnitOnChange(u, unit, this._destroy);
      unit.target.markAsTouched();
      return unit;
    });
  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect() {
    this._destroy.next();
  }
}
