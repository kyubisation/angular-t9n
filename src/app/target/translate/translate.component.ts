import { TextFieldModule } from '@angular/cdk/text-field';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';

import { Pagination } from '../../core/pagination';
import { TranslationTargetService } from '../core/translation-target.service';

import { TranslateDataSource } from './translate-datasource';

@Component({
  selector: 't9n-translate',
  templateUrl: './translate.component.html',
  styleUrls: ['./translate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTableModule,
    MatSortModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    TextFieldModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    RouterLink,
    MatIconModule,
    MatPaginatorModule,
    AsyncPipe,
  ],
})
export class TranslateComponent extends Pagination<TranslateDataSource> implements OnInit {
  private _translationTargetService = inject(TranslationTargetService);

  constructor() {
    super(
      inject(UntypedFormBuilder).group({
        id: '',
        description: '',
        meaning: '',
        source: '',
        target: '',
        state: '',
      }),
    );
  }

  ngOnInit() {
    super.ngOnInit();
    this.dataSource = new TranslateDataSource(
      this._translationTargetService,
      this.paginator,
      this.sort,
      this.filter!,
    );
  }
}
