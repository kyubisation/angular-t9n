import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Pagination } from '../../core/pagination';
import { SourceOrphansService } from '../core/source-orphans.service';

import { MigrateDataSource } from './migrate-datasource';

@Component({
  selector: 't9n-migrate',
  templateUrl: './migrate.component.html',
  styleUrls: ['./migrate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MigrateComponent extends Pagination<MigrateDataSource> implements OnInit {
  constructor(
    private _sourceOrphansService: SourceOrphansService,
    route: ActivatedRoute,
    router: Router,
    formBuilder: UntypedFormBuilder
  ) {
    super(
      route,
      router,
      formBuilder.group({
        id: '',
        description: '',
        meaning: '',
        source: '',
      })
    );
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.dataSource = new MigrateDataSource(
      this._sourceOrphansService,
      this.paginator,
      this.sort,
      this.filter!
    );
  }
}
