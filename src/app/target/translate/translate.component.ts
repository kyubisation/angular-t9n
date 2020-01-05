import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';

import { FormTargetUnit } from '../../../models';
import { PaginationHelper } from '../core/pagination-helper';
import { TranslationTargetService } from '../core/translation-target.service';

import { TranslateDataSource } from './translate-datasource';

@Component({
  selector: 't9n-translate',
  templateUrl: './translate.component.html',
  styleUrls: ['./translate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TranslateComponent implements AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<FormTargetUnit>;
  dataSource!: TranslateDataSource;
  queryParams: Observable<Params>;
  filter: FormGroup;
  private _paginationHelper: PaginationHelper;
  private _destroy = new Subject<void>();

  constructor(
    private _translationTargetService: TranslationTargetService,
    private _route: ActivatedRoute,
    private _router: Router,
    formBuilder: FormBuilder
  ) {
    this._paginationHelper = new PaginationHelper(this, this._route, this._router);
    this.queryParams = this._route.queryParams;
    this.filter = formBuilder.group({
      id: '',
      description: '',
      meaning: '',
      source: '',
      target: '',
      state: ''
    });
  }

  ngAfterViewInit() {
    this._paginationHelper.applyAndTrackQueryParamsUntil(this._destroy);
    this.dataSource = new TranslateDataSource(
      this.paginator,
      this.sort,
      this.filter,
      this._translationTargetService
    );
    this.table.dataSource = this.dataSource;
  }

  ngOnDestroy(): void {
    this._destroy.next();
    this._destroy.complete();
  }
}
