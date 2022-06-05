import { DataSource } from '@angular/cdk/collections';
import { UntypedFormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { EMPTY, merge, Observable, Subject } from 'rxjs';
import { debounceTime, map, switchMap, tap } from 'rxjs/operators';

import { PaginationResponse } from '../../models';

export abstract class TranslationDataSource<T, TFetchResponse = T> extends DataSource<T> {
  /** Used to react to internal changes of the paginator that are made by the data source itself. */
  private readonly _internalPageChanges = new Subject<void>();

  constructor(
    private _paginator: MatPaginator,
    private _sort: MatSort,
    private _filter?: UntypedFormGroup
  ) {
    super();
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<T[]> {
    return merge(
      this._paginator.page,
      this._internalPageChanges,
      this._paginator.initialized,
      this._sort.sortChange,
      this._filter ? this._filter.valueChanges : EMPTY
    ).pipe(
      debounceTime(100),
      switchMap(() => this._fetchData(this._paginator, this._sort, this._filter)),
      tap((page) => this._updatePaginator(page.totalEntries)),
      map((page) => this._mapPaginationResponse(page))
    );
  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect() {}

  protected abstract _fetchData(
    paginator: MatPaginator,
    sort: MatSort,
    filter?: UntypedFormGroup | undefined
  ): Observable<PaginationResponse<TFetchResponse>>;

  protected _mapPaginationResponse(page: PaginationResponse<TFetchResponse>): T[] {
    return page._embedded.entries as unknown as T[];
  }

  private _updatePaginator(length: number) {
    Promise.resolve().then(() => {
      const paginator = this._paginator;

      if (!paginator) {
        return;
      }

      paginator.length = length;

      // If the page index is set beyond the page, reduce it to the last page.
      if (paginator.pageIndex > 0) {
        const lastPageIndex = Math.ceil(paginator.length / paginator.pageSize) - 1 || 0;
        const newPageIndex = Math.min(paginator.pageIndex, lastPageIndex);

        if (newPageIndex !== paginator.pageIndex) {
          paginator.pageIndex = newPageIndex;

          // Since the paginator only emits after user-generated changes,
          // we need our own stream so we know to should re-render the data.
          this._internalPageChanges.next();
        }
      }
    });
  }
}
