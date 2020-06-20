import { FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, SortDirection } from '@angular/material/sort';
import { ActivatedRoute, ActivatedRouteSnapshot, Params, Router } from '@angular/router';
import { EMPTY, merge, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export class PaginationHelper {
  constructor(
    private _source: { paginator: MatPaginator; sort: MatSort; filter?: FormGroup },
    private _route: ActivatedRoute,
    private _router: Router
  ) {}

  applyAndTrackQueryParamsUntil(until: Observable<void>) {
    const route = this._route.snapshot;
    this._applyToPaginator(route);
    this._applyToSort(route);
    this._applyToFilter(route);
    merge(
      this._source.paginator.page,
      this._source.sort.sortChange,
      this._source.filter ? this._source.filter.valueChanges : EMPTY
    )
      .pipe(takeUntil(until))
      .subscribe(() => this._applyToQueryParams());
  }

  private _applyToPaginator(route: ActivatedRouteSnapshot) {
    const entriesPerPage = route.queryParamMap.get('entriesPerPage');
    if (
      entriesPerPage &&
      Number.isInteger(+entriesPerPage) &&
      this._source.paginator.pageSizeOptions.indexOf(+entriesPerPage) >= 0 &&
      this._source.paginator.pageSizeOptions[0] !== +entriesPerPage
    ) {
      this._source.paginator.pageSize = +entriesPerPage;
    }
    const page = route.queryParamMap.get('page');
    if (page && Number.isInteger(+page) && +page > 0) {
      this._source.paginator.pageIndex = +page;
    }
  }

  private _applyToSort(route: ActivatedRouteSnapshot) {
    const sort = route.queryParamMap.get('sort');
    if (!sort) {
      return;
    }

    const start: SortDirection = sort.startsWith('!') ? 'desc' : 'asc';
    const id = start === 'desc' ? sort.substring(1) : sort;

    this._source.sort.sort({ id, start, disableClear: false });
  }

  private _applyToFilter(route: ActivatedRouteSnapshot) {
    if (!this._source.filter) {
      return;
    }

    const filters = Object.keys(this._source.filter.controls)
      .filter((k) => route.queryParamMap.get(k))
      .reduce(
        (current, next) => Object.assign(current, { [next]: route.queryParamMap.get(next) }),
        {}
      );
    this._source.filter.patchValue(filters);
  }

  private _applyToQueryParams() {
    const { paginator, sort, filter } = this._source;
    const queryParams: Params = Object.assign(
      {},
      paginator.pageSize !== paginator.pageSizeOptions[0]
        ? { entriesPerPage: paginator.pageSize }
        : undefined,
      paginator.pageIndex ? { page: paginator.pageIndex } : undefined,
      sort.active && sort.direction
        ? { sort: `${sort.direction === 'desc' ? '!' : ''}${sort.active}` }
        : undefined,
      filter
        ? Object.keys(filter.controls)
            .filter((k) => filter.get(k)!.value)
            .reduce(
              (current, next) => Object.assign(current, { [next]: filter.get(next)!.value }),
              {}
            )
        : undefined
    );
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams,
    });
  }
}
