import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { RootResponse, TargetResponse } from '../../models';
import { TargetsResponse } from '../../models/targets-response';

import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private _http = inject(HttpClient);
  private _websocketService = inject(WebsocketService);

  root: Observable<RootResponse>;
  targets: Observable<TargetResponse[]>;

  private _rootSubject = new BehaviorSubject<RootResponse | null>(null);
  private _targetsSubject = new BehaviorSubject<TargetsResponse | null>(null);
  private _targetsMap = new BehaviorSubject(new Map<string, TargetResponse>());
  private _targets = this._targetsSubject.pipe(filter((r): r is TargetsResponse => !!r));

  constructor() {
    this.root = this._rootSubject.pipe(filter((r): r is RootResponse => !!r));
    this.targets = this._targetsMap.pipe(map((t) => Array.from(t.values())));
    this.root
      .pipe(switchMap((r) => this._http.get<TargetsResponse>(r._links!.targets.href)))
      .subscribe((targets) => this._targetsSubject.next(targets));
    this._targets
      .pipe(switchMap((t) => this._loadTargets(t)))
      .subscribe((m) => this._targetsMap.next(m));
    this._websocketService.projectChange
      .pipe(switchMap(() => this._http.get<RootResponse>(`${environment.translationServer}/api`)))
      .subscribe((r) => this._rootSubject.next(r));
  }

  target(language: string): Observable<TargetResponse | undefined> {
    return this._targetsMap.pipe(map((t) => t.get(language)));
  }

  createTarget(language: string) {
    return this._targets.pipe(
      take(1),
      map((r) => this._targetHref(r, language)),
      switchMap((href) => this._http.post<TargetResponse>(href, {})),
      tap((t) => this._updateTarget(t)),
    );
  }

  updateTarget(language: string) {
    return this._targets.pipe(
      map((r) => this._targetHref(r, language)),
      switchMap((href) => this._http.get<TargetResponse>(href)),
      tap((t) => this._updateTarget(t)),
    );
  }

  private _loadTargets(targetsResponse: TargetsResponse) {
    return combineLatest(
      targetsResponse.languages
        .map((l) => this._targetHref(targetsResponse, l))
        .map((href) => this._http.get<TargetResponse>(href)),
    ).pipe(
      map((targets) =>
        targets.reduce(
          (current, next) => current.set(next.language, next),
          new Map<string, TargetResponse>(),
        ),
      ),
    );
  }

  private _targetHref(targets: TargetsResponse, language: string) {
    return targets._links!.target.href.replace('{language}', language);
  }

  private _updateTarget(target: TargetResponse) {
    const targets = new Map<string, TargetResponse>(this._targetsMap.value).set(
      target.language,
      target,
    );
    this._targetsMap.next(targets);
  }
}
