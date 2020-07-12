import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { delay, filter, retryWhen, skip, tap } from 'rxjs/operators';
import { webSocket } from 'rxjs/webSocket';

import { environment } from '../../environments/environment';

import { ProjectInfo } from './project-info';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private readonly _projectSubject = new BehaviorSubject<ProjectInfo | null>(null);
  readonly project = this._projectSubject.pipe(skip(1));
  readonly projectChange = this.project.pipe(filter((p): p is ProjectInfo => !!p));

  constructor() {
    webSocket(environment.translationSocket)
      .pipe(
        retryWhen((errors) =>
          errors.pipe(
            tap(() => this._projectSubject.next(null)),
            delay(1000)
          )
        )
      )
      .subscribe((r) => this._projectSubject.next(r as ProjectInfo));
  }
}
