import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { map, startWith, switchMap, tap } from 'rxjs/operators';

import { TranslationTargetUnitResponse } from '../../../models';
import { TranslationTargetService } from '../core/translation-target.service';

/**
 * Data source for the Orphans view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class OrphansDataSource extends DataSource<TranslationTargetUnitResponse> {
  totalEntries: Observable<number>;

  private _totalEntries = new BehaviorSubject(0);

  constructor(
    private _paginator: MatPaginator,
    private _sort: MatSort,
    private _translationTargetService: TranslationTargetService
  ) {
    super();
    this.totalEntries = this._totalEntries.asObservable();
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<TranslationTargetUnitResponse[]> {
    return merge(this._paginator.page, this._sort.sortChange).pipe(
      startWith(undefined),
      switchMap(() =>
        this._translationTargetService.orphans({
          page: this._paginator.pageIndex,
          entriesPerPage: this._paginator.pageSize,
          sort: this._sort
        })
      ),
      tap(orphanPage => this._totalEntries.next(orphanPage.totalEntries)),
      map(orphanPage => orphanPage._embedded.entries)
    );
  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect() {}
}
