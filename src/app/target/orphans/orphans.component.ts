import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Pagination } from '../../core/pagination';
import { TranslationTargetService } from '../core/translation-target.service';

import { OrphansDataSource } from './orphans-datasource';

@Component({
  selector: 't9n-orphans',
  templateUrl: './orphans.component.html',
  styleUrls: ['./orphans.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrphansComponent extends Pagination<OrphansDataSource> implements OnInit {
  constructor(
    private _translationTargetService: TranslationTargetService,
    route: ActivatedRoute,
    router: Router
  ) {
    super(route, router);
  }

  ngOnInit() {
    super.ngOnInit();
    this.dataSource = new OrphansDataSource(
      this._translationTargetService,
      this.paginator,
      this.sort
    );
  }
}
