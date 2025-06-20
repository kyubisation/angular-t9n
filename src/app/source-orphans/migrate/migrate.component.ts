import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';

import { Pagination } from '../../core/pagination';
import { SourceOrphansService } from '../core/source-orphans.service';

import { MigrateDataSource } from './migrate-datasource';

@Component({
  selector: 't9n-migrate',
  templateUrl: './migrate.component.html',
  styleUrls: ['./migrate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTableModule,
    MatSortModule,
    MatTooltipModule,
    MatButtonModule,
    RouterLink,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    AsyncPipe,
  ],
})
export class MigrateComponent extends Pagination<MigrateDataSource> implements OnInit {
  private _sourceOrphansService = inject(SourceOrphansService);

  constructor() {
    super(
      inject(UntypedFormBuilder).group({
        id: '',
        description: '',
        meaning: '',
        source: '',
      }),
    );
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.dataSource = new MigrateDataSource(
      this._sourceOrphansService,
      this.paginator,
      this.sort,
      this.filter!,
    );
  }
}
