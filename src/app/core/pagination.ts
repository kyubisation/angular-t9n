import { Directive, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, SortDirection } from '@angular/material/sort';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { EMPTY, merge, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive()
// tslint:disable-next-line: directive-class-suffix
export abstract class Pagination<TDataSource> implements OnInit, OnDestroy {
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  filter? = inject(UntypedFormGroup);

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  dataSource!: TDataSource;
  queryParams: Observable<Params>;
  pageSize: number;
  pageIndex: number;

  protected _destroy = new Subject<void>();

  constructor() {
    const queryParams = this._route.snapshot.queryParamMap;
    this.queryParams = this._route.queryParams;
    this.pageSize = this._toInteger(queryParams.get('entriesPerPage'));
    this.pageIndex = this._toInteger(queryParams.get('page'));
  }
  ngOnInit(): void {
    this._applyCurrentSort();
    this._applyCurrentFilter();

    merge(this.paginator.page, this.sort.sortChange, this.filter ? this.filter.valueChanges : EMPTY)
      .pipe(takeUntil(this._destroy))
      .subscribe(() => this._applyToQueryParams());
  }

  ngOnDestroy(): void {
    this._destroy.next();
    this._destroy.complete();
  }

  private _toInteger(value: string | null) {
    return value && Number.isInteger(+value) ? +value : 0;
  }

  private _applyCurrentSort() {
    const sort = this._route.snapshot.queryParamMap.get('sort');
    if (!sort) {
      return;
    }

    const start: SortDirection = sort.startsWith('!') ? 'desc' : 'asc';
    const id = start === 'desc' ? sort.substring(1) : sort;

    this.sort.sort({ id, start, disableClear: false });
  }

  private _applyCurrentFilter() {
    if (!this.filter) {
      return;
    }

    const queryParams = this._route.snapshot.queryParamMap;
    const filters = Object.keys(this.filter.controls)
      .filter((k) => queryParams.get(k))
      .reduce((current, next) => Object.assign(current, { [next]: queryParams.get(next) }), {});
    this.filter.patchValue(filters);
  }

  private _applyToQueryParams() {
    const { paginator, sort, filter } = this;
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
              {},
            )
        : undefined,
    );
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams,
    });
  }
}
