import { DataSource } from '@angular/cdk/collections';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, merge, Observable, Subject } from 'rxjs';
import { debounceTime, map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';

import { FormTargetUnit } from '../../../models';
import { TranslationTargetService } from '../core/translation-target.service';

export class TranslateDataSource extends DataSource<FormTargetUnit> {
  totalEntries: Observable<number>;

  private _totalEntries = new BehaviorSubject(0);
  private _destroy = new Subject<void>();

  constructor(
    private _paginator: MatPaginator,
    private _sort: MatSort,
    private _filter: FormGroup,
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
  connect(): Observable<FormTargetUnit[]> {
    return merge(this._paginator.page, this._sort.sortChange, this._filter.valueChanges).pipe(
      startWith(undefined),
      tap(() => this._destroy.next()),
      switchMap(() =>
        this._translationTargetService.units({
          page: this._paginator.pageIndex,
          entriesPerPage: this._paginator.pageSize,
          sort: this._sort,
          filter: this._filter.value
        })
      ),
      tap(unitPage => this._totalEntries.next(unitPage.totalEntries)),
      map(unitPage =>
        unitPage._embedded!.entries.map(u => {
          const unit: FormTargetUnit = {
            ...u,
            target: new FormControl(u.target),
            state: new FormControl(u.state)
          };
          if (!u.target) {
            unit.state.disable();
          }
          unit.target.valueChanges
            .pipe(
              takeUntil(this._destroy),
              debounceTime(500),
              tap(target =>
                target
                  ? unit.state.enable({ emitEvent: false })
                  : unit.state.disable({ emitEvent: false })
              ),
              switchMap(target =>
                this._translationTargetService.updateUnit({ ...u, target, state: unit.state.value })
              )
            )
            .subscribe(r => unit.state.setValue(r.state, { emitEvent: false }));
          unit.state.valueChanges
            .pipe(
              takeUntil(this._destroy),
              switchMap(state =>
                this._translationTargetService.updateUnit({
                  ...u,
                  target: unit.target.value,
                  state
                })
              )
            )
            .subscribe();
          return unit;
        })
      )
    );
  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect() {
    this._destroy.next();
  }
}
