import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Pagination } from '../../core/pagination';
import { TranslationTargetService } from '../core/translation-target.service';

import { TranslateDataSource } from './translate-datasource';

@Component({
  selector: 't9n-translate',
  templateUrl: './translate.component.html',
  styleUrls: ['./translate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TranslateComponent extends Pagination<TranslateDataSource> implements OnInit {
  constructor(
    private _translationTargetService: TranslationTargetService,
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
        target: '',
        state: '',
      })
    );
  }

  ngOnInit() {
    super.ngOnInit();
    this.dataSource = new TranslateDataSource(
      this._translationTargetService,
      this.paginator,
      this.sort,
      this.filter!
    );
  }
}
