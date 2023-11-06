import { NgIf, AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { map, share, switchMap, tap } from 'rxjs/operators';

import { TranslationSourceUnitResponse } from '../../../models';
import { OrphanMatchResponse } from '../../../models/orphan-match-response';
import { SourceOrphansService } from '../core/source-orphans.service';

@Component({
  selector: 't9n-source-orphan',
  templateUrl: './source-orphan.component.html',
  styleUrls: ['./source-orphan.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    MatTableModule,
    MatSortModule,
    MatTooltipModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    AsyncPipe,
  ],
})
export class SourceOrphanComponent implements OnDestroy {
  orphan: Observable<TranslationSourceUnitResponse>;
  params: Observable<Params>;
  similar: Observable<OrphanMatchResponse[]>;
  private _destroy = new Subject<void>();
  private _orphan?: TranslationSourceUnitResponse;

  constructor(
    private _sourceOrphanService: SourceOrphansService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _snackbar: MatSnackBar,
  ) {
    this.params = this._route.params.pipe(map(({ orphanId, ...params }) => params));
    this.orphan = this._route.paramMap.pipe(
      switchMap((p) => this._sourceOrphanService.orphan(p.get('orphanId')!)),
      tap((o) => (this._orphan = o)),
      share(),
    );
    this.similar = this.orphan.pipe(map((o) => o._embedded!.similar as OrphanMatchResponse[]));
  }

  ngOnDestroy(): void {
    this._destroy.next();
    this._destroy.complete();
  }

  migrate(unit: TranslationSourceUnitResponse) {
    if (!this.orphan) {
      return;
    }

    this._orphanAction(
      this._sourceOrphanService.migrateOrphan(this._orphan!, unit),
      `Migrated orphan ${this._orphan!.id} to unit ${unit.id}`,
    );
  }

  delete() {
    if (!this.orphan) {
      return;
    }

    this._orphanAction(
      this._sourceOrphanService.deleteOrphan(this._orphan!),
      `Deleted orphan ${this._orphan!.id}`,
    );
  }

  private _orphanAction(action: Observable<void>, message: string) {
    action
      .pipe(switchMap(() => this._router.navigate(['..'], { relativeTo: this._route })))
      .subscribe(() => this._snackbar.open(message, undefined, { duration: 2500 }));
  }
}
