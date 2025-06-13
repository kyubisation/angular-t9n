import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { SortDirection } from '@angular/material/sort';
import { forkJoin, Observable, of } from 'rxjs';
import { map, mapTo, switchMap, take } from 'rxjs/operators';

import { PaginationResponse, TranslationSourceUnitResponse } from '../../../models';
import { createPageParams } from '../../core/create-page-params';
import { TranslationService } from '../../core/translation.service';

@Injectable({
  providedIn: 'root',
})
export class SourceOrphansService {
  private _translationService = inject(TranslationService);
  private _http = inject(HttpClient);

  orphan(id: string) {
    return this._translationService.root.pipe(
      take(1),
      map((r) => r._links!.orphan.href.replace('{id}', id)),
      switchMap((href) => this._http.get<TranslationSourceUnitResponse>(href)),
    );
  }

  orphans(query: {
    page?: number;
    entriesPerPage?: number;
    sort?: { active: string; direction: SortDirection };
    filter?: { [property: string]: string };
  }) {
    const params = createPageParams(query);
    return this._translationService.root.pipe(
      take(1),
      map((t) => t._links!.orphans.href),
      switchMap((href) =>
        this._http.get<PaginationResponse<TranslationSourceUnitResponse>>(href, { params }),
      ),
    );
  }

  deleteOrphan(orphan: TranslationSourceUnitResponse): Observable<void> {
    return this._http.delete<void>(orphan._links!.self.href);
  }

  migrateOrphan(
    orphan: TranslationSourceUnitResponse,
    unit: TranslationSourceUnitResponse,
  ): Observable<void> {
    return this._http.request<void>('DELETE', orphan._links!.self.href, { body: unit });
  }

  autoMigrateOrphans(distanceThreshold: number) {
    return this._fetchOrphans().pipe(
      switchMap((orphans) => {
        const migrateableOrphans = orphans
          .filter((o) => this._canMigrate(o, distanceThreshold))
          .map((o) => this.migrateOrphan(o, (o._embedded!.similar as any)[0]).pipe(mapTo(o)));
        return migrateableOrphans.length ? forkJoin(migrateableOrphans) : of([]);
      }),
    );
  }

  private _fetchOrphans(page = 0): Observable<TranslationSourceUnitResponse[]> {
    return this.orphans({ page, entriesPerPage: 250 }).pipe(
      switchMap((pageResponse) =>
        pageResponse._links!.next
          ? this._fetchOrphans(++page).pipe(
              map((entries) => pageResponse._embedded.entries.concat(entries)),
            )
          : of(pageResponse._embedded.entries),
      ),
    );
  }

  private _canMigrate(orphan: TranslationSourceUnitResponse, distanceThreshold: number) {
    const similar: Array<TranslationSourceUnitResponse & { distance: number }> | undefined = orphan
      ._embedded?.similar as any;
    return (
      similar &&
      similar[0].distance <= distanceThreshold &&
      similar.filter((s) => s.distance === similar[0].distance).length === 1
    );
  }
}
