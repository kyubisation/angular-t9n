import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, filter, retry, tap } from 'rxjs/operators';
import { webSocket } from 'rxjs/webSocket';

import { environment } from '../../environments/environment';

import { ProjectInfo } from './project-info';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private readonly _projectSubject = new BehaviorSubject<ProjectInfo | null>(null);
  readonly project = this._projectSubject.pipe(
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
  );
  readonly projectChange = this.project.pipe(filter((p): p is ProjectInfo => !!p));

  constructor() {
    webSocket(environment.translationSocket)
      .pipe(tap({ error: () => this._projectSubject.next(null) }), retry({ delay: 1000 }))
      .subscribe((r) => this._projectSubject.next(r as ProjectInfo));
  }
}
