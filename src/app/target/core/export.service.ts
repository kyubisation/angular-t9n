import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { PaginationResponse, TranslationTargetUnitResponse } from '../../../models';

import { TranslationTargetService } from './translation-target.service';

@Injectable()
export class ExportService {
  constructor(
    private _translationTargetService: TranslationTargetService,
    private _http: HttpClient
  ) {}

  export(state: string): Observable<void> {
    const params = new HttpParams().set('entriesPerPage', '100').set('state', state);
    return this._translationTargetService.target.pipe(
      switchMap((t) =>
        this._http
          .get<PaginationResponse<TranslationTargetUnitResponse>>(t._links!.units.href, {
            params,
          })
          .pipe(
            switchMap((p) => this._loadNextUnitsPage(p, p._embedded.entries)),
            map((entries) =>
              entries.map(({ id, description, meaning, source, target }) => ({
                Id: id,
                Description: description,
                Meaning: meaning,
                Source: source,
                Target: target,
              }))
            ),
            switchMap(async (entries) => {
              const { utils, writeFile } = await import('xlsx');
              const header = ['Id', 'Description', 'Meaning', 'Source', 'Target'];
              const sheet = utils.json_to_sheet(entries, { header });
              const workbook = utils.book_new();
              utils.book_append_sheet(workbook, sheet, t.language);
              writeFile(workbook, `t9n-${t.language}-${state || 'all'}.xlsx`);
            })
          )
      )
    );
  }

  private _loadNextUnitsPage(
    page: PaginationResponse<TranslationTargetUnitResponse>,
    entries: TranslationTargetUnitResponse[]
  ): Observable<TranslationTargetUnitResponse[]> {
    if (!page._links.next) {
      return of(entries);
    } else {
      return this._http
        .get<PaginationResponse<TranslationTargetUnitResponse>>(page._links.next.href)
        .pipe(switchMap((p) => this._loadNextUnitsPage(p, entries.concat(p._embedded.entries))));
    }
  }
}
