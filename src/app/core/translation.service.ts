import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of, timer } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  take,
  tap,
  timeout
} from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { RootResponse, TargetResponse } from '../../models';
import { TargetsResponse } from '../../models/targets-response';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  project: Observable<string>;
  sourceFile: Observable<string>;
  sourceLanguage: Observable<string>;
  unitCount: Observable<number>;
  targets: Observable<TargetResponse[]>;
  serviceDown: Observable<boolean>;

  private _rootSubject = new BehaviorSubject<RootResponse | undefined>(undefined);
  private _targetsSubject = new BehaviorSubject<TargetsResponse | undefined>(undefined);
  private _targetsMap = new BehaviorSubject(new Map<string, TargetResponse>());
  private _root = this._rootSubject.pipe(
    filter((r): r is RootResponse => !!r),
    distinctUntilChanged((x, y) => x.sourceFile === y.sourceFile)
  );
  private _targets = this._targetsSubject.pipe(filter((r): r is TargetsResponse => !!r));

  constructor(private _http: HttpClient) {
    this.project = this._root.pipe(map(r => r.project));
    this.sourceFile = this._root.pipe(map(r => r.sourceFile));
    this.sourceLanguage = this._root.pipe(map(r => r.sourceLanguage));
    this.unitCount = this._root.pipe(map(r => r.unitCount));
    this.targets = this._targetsMap.pipe(map(t => Array.from(t.values())));
    this.serviceDown = timer(0, 1000).pipe(
      switchMap(() =>
        this._http.get<RootResponse>(`${environment.translationServer}/api`).pipe(
          timeout(1000),
          tap(r => this._rootSubject.next(r)),
          catchError(() => of(undefined))
        )
      ),
      map(r => !r),
      distinctUntilChanged()
    );
    this._root
      .pipe(switchMap(r => this._http.get<TargetsResponse>(r._links!.targets.href)))
      .subscribe(targets => this._targetsSubject.next(targets));
    this._targets
      .pipe(switchMap(t => this._loadTargets(t)))
      .subscribe(m => this._targetsMap.next(m));
  }

  target(language: string): Observable<TargetResponse | undefined> {
    return this._targetsMap.pipe(map(t => t.get(language)));
  }

  createTarget(language: string) {
    return this._targets.pipe(
      take(1),
      map(r => this._targetHref(r, language)),
      switchMap(href => this._http.post<TargetResponse>(href, {})),
      tap(t => this._updateTarget(t))
    );
  }

  updateTarget(language: string) {
    return this._targets.pipe(
      map(r => this._targetHref(r, language)),
      switchMap(href => this._http.get<TargetResponse>(href)),
      tap(t => this._updateTarget(t))
    );
  }

  private _loadTargets(targetsResponse: TargetsResponse) {
    return combineLatest(
      targetsResponse.languages
        .map(l => this._targetHref(targetsResponse, l))
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

  private _targetHref(targets: TargetsResponse, language: string) {
    return targets._links!.target.href.replace('{language}', language);
  }

  private _updateTarget(target: TargetResponse) {
    const targets = new Map<string, TargetResponse>(this._targetsMap.value).set(
      target.language,
      target
    );
    this._targetsMap.next(targets);
  }
}
