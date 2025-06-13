import { AsyncPipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';

import { Pagination } from '../../core/pagination';
import { TranslationTargetService } from '../core/translation-target.service';

import { OrphansDataSource } from './orphans-datasource';

@Component({
  selector: 't9n-orphans',
  templateUrl: './orphans.component.html',
  styleUrls: ['./orphans.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTableModule,
    MatSortModule,
    MatTooltipModule,
    MatButtonModule,
    RouterLink,
    MatIconModule,
    MatPaginatorModule,
    AsyncPipe,
    TitleCasePipe,
  ],
})
export class OrphansComponent extends Pagination<OrphansDataSource> implements OnInit {
  private _translationTargetService = inject(TranslationTargetService);

  ngOnInit() {
    super.ngOnInit();
    this.dataSource = new OrphansDataSource(
      this._translationTargetService,
      this.paginator,
      this.sort,
    );
  }
}
