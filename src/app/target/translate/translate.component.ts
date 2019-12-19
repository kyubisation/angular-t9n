import { AfterViewInit, ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';

import { FormTargetUnit } from '../../../models';
import { TranslationTargetService } from '../core/translation-target.service';

import { TranslateDataSource } from './translate-datasource';

@Component({
  selector: 't9n-translate',
  templateUrl: './translate.component.html',
  styleUrls: ['./translate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TranslateComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<FormTargetUnit>;
  dataSource!: TranslateDataSource;
  filter: FormGroup;

  constructor(
    private _translationTargetService: TranslationTargetService,
    formBuilder: FormBuilder
  ) {
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
    this.dataSource = new TranslateDataSource(
      this.paginator,
      this.sort,
      this.filter,
      this._translationTargetService
    );
    this.table.dataSource = this.dataSource;
  }
}
