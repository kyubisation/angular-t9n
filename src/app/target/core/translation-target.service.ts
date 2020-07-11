import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { SortDirection } from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  skip,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { PaginationResponse, TargetResponse, TranslationTargetUnitResponse } from '../../../models';
import { createPageParams } from '../../core/create-page-params';
import { TranslationService } from '../../core/translation.service';

@Injectable()
export class TranslationTargetService {
  target: Observable<TargetResponse>;

  constructor(
    private _translationService: TranslationService,
    private _activatedRoute: ActivatedRoute,
    private _http: HttpClient
  ) {
    this.target = this._activatedRoute.params.pipe(
      switchMap((p) => this._translationService.target(p.language)),
      filter((t): t is TargetResponse => !!t)
    );
  }

  unit(id: string) {
    return this.target.pipe(
      take(1),
      map((t) => t._links!.unit.href.replace('{id}', id)),
      switchMap((href) => this._http.get<TranslationTargetUnitResponse>(href))
    );
  }

  units(query: {
    page?: number;
    entriesPerPage?: number;
    sort?: { active: string; direction: SortDirection };
    filter?: { [property: string]: string };
  }) {
    const params = createPageParams(query);
    return this.target.pipe(
      take(1),
      map((t) => t._links!.units.href),
      switchMap((href) =>
        this._http.get<PaginationResponse<TranslationTargetUnitResponse>>(href, { params })
      )
    );
  }

  updateUnitOnChange(
    unit: TranslationTargetUnitResponse,
    controls: { target: AbstractControl; state: AbstractControl },
    until: Observable<void>
  ) {
    // The startWith, skip combination is necessary to deal with an IE11 bug
    controls.target.valueChanges
      .pipe(
        takeUntil(until),
        startWith(controls.target.value),
        debounceTime(500),
        distinctUntilChanged(),
        skip(1),
        tap((target) =>
          target
            ? controls.state.enable({ emitEvent: false })
            : controls.state.disable({ emitEvent: false })
        ),
        switchMap((target) => this.updateUnit({ ...unit, target, state: controls.state.value }))
      )
      .subscribe((r) => controls.state.setValue(r.state, { emitEvent: false }));
    controls.state.valueChanges
      .pipe(
        takeUntil(until),
        startWith(controls.state.value),
        distinctUntilChanged(),
        skip(1),
        switchMap((state) =>
          this.updateUnit({
            ...unit,
            target: controls.target.value,
            state,
          })
        )
      )
      .subscribe();
  }

  updateUnit(unit: Partial<TranslationTargetUnitResponse>) {
    if (unit.target === '' && unit.state !== 'initial') {
      unit.state = 'initial';
    } else if (unit.target !== '' && unit.state === 'initial') {
      unit.state = 'translated';
    }

    const { target, state } = unit;
    return this._http.put<TranslationTargetUnitResponse>(unit._links!.self.href, { target, state });
  }

  orphan(id: string) {
    return this.target.pipe(
      take(1),
      map((t) => t._links!.orphan.href.replace('{id}', id)),
      switchMap((href) => this._http.get<TranslationTargetUnitResponse>(href))
    );
  }

  orphans(query: {
    page?: number;
    entriesPerPage?: number;
    sort?: { active: string; direction: SortDirection };
    filter?: { [property: string]: string };
  }) {
    const params = createPageParams(query);
    return this.target.pipe(
      take(1),
      map((t) => t._links!.orphans.href),
      switchMap((href) =>
        this._http.get<PaginationResponse<TranslationTargetUnitResponse>>(href, { params })
      )
    );
  }

  migrateOrphan(orphan: TranslationTargetUnitResponse, unit: TranslationTargetUnitResponse) {
    return this.updateUnit({ ...unit, target: orphan.target, state: orphan.state }).pipe(
      switchMap(() => this.deleteOrphan(orphan))
    );
  }

  deleteOrphan(orphan: TranslationTargetUnitResponse) {
    return this._http.delete(orphan._links!.self.href).pipe(
      switchMap(() =>
        this.target.pipe(
          take(1),
          switchMap((t) => this._translationService.updateTarget(t.language))
        )
      ),
      map((t) => ({ orphansRemaining: t.orphanCount > 0 }))
    );
  }
}
