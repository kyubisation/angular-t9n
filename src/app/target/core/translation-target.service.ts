import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SortDirection } from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, first, map, switchMap } from 'rxjs/operators';

import { PaginationResponse, TargetResponse, TranslationTargetUnitResponse } from '../../../models';
import { TranslationService } from '../../core/translation.service';

import { createPageParams } from './create-page-params';

@Injectable()
export class TranslationTargetService {
  target: Observable<TargetResponse>;

  constructor(
    private _translationService: TranslationService,
    private _activatedRoute: ActivatedRoute,
    private _http: HttpClient
  ) {
    this.target = this._activatedRoute.params.pipe(
      switchMap(p => this._translationService.target(p.language)),
      filter((t): t is TargetResponse => !!t)
    );
  }

  unit(id: string) {
    return this.target.pipe(
      first(),
      map(t => t._links!.unit.href.replace('{id}', id)),
      switchMap(href => this._http.get<TranslationTargetUnitResponse>(href))
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
      first(),
      map(t => t._links!.units.href),
      switchMap(href =>
        this._http.get<PaginationResponse<TranslationTargetUnitResponse>>(href, { params })
      )
    );
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

  orphans(query: {
    page?: number;
    entriesPerPage?: number;
    sort?: { active: string; direction: SortDirection };
    filter?: { [property: string]: string };
  }) {
    const params = createPageParams(query);
    return this.target.pipe(
      first(),
      map(t => t._links!.orphans.href),
      switchMap(href =>
        this._http.get<PaginationResponse<TranslationTargetUnitResponse>>(href, { params })
      )
    );
  }

  migrateOrphan(orphan: TranslationTargetUnitResponse, unit: TranslationTargetUnitResponse) {
    return this.updateUnit({ ...unit, target: orphan.target, state: orphan.state }).pipe(
      switchMap(() => this._http.delete(orphan._links!.self.href)),
      switchMap(() => this.updateTarget()),
      map(t => t.orphanCount)
    );
  }

  updateTarget() {
    return this.target.pipe(
      first(),
      switchMap(t => this._translationService.updateTarget(t.language))
    );
  }
}
