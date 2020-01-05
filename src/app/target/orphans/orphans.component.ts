import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';

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
  queryParams: Observable<Params>;

  private _paginationHelper: PaginationHelper;
  private _destroy = new Subject<void>();

  constructor(
    private _translationTargetService: TranslationTargetService,
    private _router: Router,
    private _route: ActivatedRoute
  ) {
    this._paginationHelper = new PaginationHelper(this, this._route, this._router);
    this.queryParams = this._route.queryParams;
  }

  ngAfterViewInit() {
    this._paginationHelper.applyAndTrackQueryParamsUntil(this._destroy);
    this.dataSource = new OrphansDataSource(
      this.paginator,
      this.sort,
      this._translationTargetService
    );
    this.table.dataSource = this.dataSource;
  }

  ngOnDestroy(): void {
    this._destroy.next();
    this._destroy.complete();
  }
}
