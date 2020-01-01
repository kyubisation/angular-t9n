import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of, timer } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  tap,
  timeout
} from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { RootResponse, TargetResponse } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  sourceLanguage: Observable<string>;
  unitCount: Observable<number>;
  targets: Observable<TargetResponse[]>;
  serviceDown: Observable<boolean>;

  private _rootSubject = new BehaviorSubject<RootResponse | undefined>(undefined);
  private _targetsSubject = new BehaviorSubject(new Map<string, TargetResponse>());
  private _root = this._rootSubject.pipe(
    filter((r): r is RootResponse => !!r),
    distinctUntilChanged((x, y) => JSON.stringify(x) === JSON.stringify(y))
  );

  constructor(private _http: HttpClient) {
    this.sourceLanguage = this._root.pipe(map(r => r.sourceLanguage));
    this.unitCount = this._root.pipe(map(r => r.unitCount));
    this.targets = this._targetsSubject.pipe(
      filter(t => t.size > 0),
      map(t => Array.from(t.values()).sort((a, b) => a.language.localeCompare(b.language)))
    );
    this.serviceDown = timer(0, 1000).pipe(
      switchMap(() =>
        this._http.get<RootResponse>(`${environment.translationServer}/api`).pipe(
          timeout(1000),
          tap(r => this._rootSubject.next(r)),
          catchError(() => of(undefined))
        )
      ),
      map(r => !r)
    );
    this._root
      .pipe(switchMap(r => this._loadTargets(r)))
      .subscribe(targets => this._targetsSubject.next(targets));
  }

  target(language: string): Observable<TargetResponse | undefined> {
    return this._targetsSubject.pipe(
      filter(t => t.size > 0),
      map(t => t.get(language))
    );
  }

  createTarget(language: string) {
    return this._root.pipe(
      map(r => this._targetHref(r, language)),
      switchMap(href => this._http.post<TargetResponse>(href, {})),
      tap(t => this._updateTarget(t))
    );
  }

  updateTarget(language: string) {
    return this._root.pipe(
      map(r => this._targetHref(r, language)),
      switchMap(href => this._http.get<TargetResponse>(href)),
      tap(t => this._updateTarget(t))
    );
  }

  private _loadTargets(rootResponse: RootResponse) {
    return combineLatest(
      rootResponse.languages
        .map(l => this._targetHref(rootResponse, l))
        .map(href => this._http.get<TargetResponse>(href))
    ).pipe(
      map(targets =>
        targets.reduce(
          (current, next) => current.set(next.language, next),
          new Map<string, TargetResponse>()
        )
      )
    );
  }

  private _targetHref(rootResponse: RootResponse, language: string) {
    return rootResponse._links!.targets.href.replace('{language}', language);
  }

  private _updateTarget(target: TargetResponse) {
    const targets = new Map<string, TargetResponse>(this._targetsSubject.value).set(
      target.language,
      target
    );
    this._targetsSubject.next(targets);
  }
}
