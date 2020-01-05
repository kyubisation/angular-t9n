import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { TranslationTargetUnitResponse } from '../../../models';
import { PaginationHelper } from '../core/pagination-helper';
import { TranslationTargetService } from '../core/translation-target.service';

import { OrphansDataSource } from './orphans-datasource';

@Component({
  selector: 't9n-orphans',
  templateUrl: './orphans.component.html',
  styleUrls: ['./orphans.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrphansComponent implements AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<TranslationTargetUnitResponse>;
  dataSource!: OrphansDataSource;

  private _update = new Subject<void>();
  private _paginationHelper: PaginationHelper;
  private _destroy = new Subject<void>();

  constructor(
    private _translationTargetService: TranslationTargetService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackbar: MatSnackBar,
    private _router: Router,
    private _route: ActivatedRoute
  ) {
    this._paginationHelper = new PaginationHelper(this, this._route, this._router);
  }

  ngAfterViewInit() {
    this._paginationHelper.applyAndTrackQueryParamsUntil(this._destroy);
    this.dataSource = new OrphansDataSource(
      this.paginator,
      this.sort,
      this._update,
      this._translationTargetService
    );
    this.table.dataSource = this.dataSource;
  }

  ngOnDestroy(): void {
    this._destroy.next();
    this._destroy.complete();
  }

  toggleRow(unit: TranslationTargetUnitResponse) {
    unit._embedded!.collapsed = !unit._embedded!.collapsed;
    this._changeDetectorRef.markForCheck();
  }

  migrate(orphan: TranslationTargetUnitResponse, unit: TranslationTargetUnitResponse) {
    this._translationTargetService.migrateOrphan(orphan, unit).subscribe(orphanCount => {
      this._snackbar.open(`Migrated ${orphan.id} to ${unit.id}`, undefined, { duration: 5000 });
      if (orphanCount) {
        this._update.next();
      } else {
        this._router.navigate(['..'], { relativeTo: this._route });
      }
    });
  }

  isOrphan(_index: number, unit: TranslationTargetUnitResponse) {
    return unit._embedded && unit._embedded.similar;
  }
}
