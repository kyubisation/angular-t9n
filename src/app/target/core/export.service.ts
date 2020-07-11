import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { TranslationTargetUnitResponse } from '../../../models';

import { TranslationTargetService } from './translation-target.service';

@Injectable()
export class ExportService {
  constructor(private _translationTargetService: TranslationTargetService) {}

  export(config: { state: string }): Observable<void> {
    return this._translationTargetService.target.pipe(
      switchMap((t) =>
        this._fetchUnits().pipe(
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
            writeFile(workbook, `t9n-${t.language}-${config.state || 'all'}.xlsx`);
          })
        )
      )
    );
  }

  private _fetchUnits(page = 0): Observable<TranslationTargetUnitResponse[]> {
    return this._translationTargetService
      .units({ page, entriesPerPage: 250 })
      .pipe(
        switchMap((pageResponse) =>
          pageResponse._links!.next
            ? this._fetchUnits(++page).pipe(
                map((entries) => pageResponse._embedded.entries.concat(entries))
              )
            : of(pageResponse._embedded.entries)
        )
      );
  }
}
