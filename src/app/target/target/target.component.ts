import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

import { TargetResponse } from '../../../models';
import { TranslationService } from '../../core/translation.service';
import { TranslationTargetService } from '../core/translation-target.service';

@Component({
  selector: 't9n-target',
  templateUrl: './target.component.html',
  styleUrls: ['./target.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TranslationTargetService]
})
export class TargetComponent {
  target: Observable<TargetResponse>;

  constructor(private _route: ActivatedRoute, private _translationService: TranslationService) {
    this.target = this._route.params.pipe(
      switchMap(p => this._translationService.target(p.language)),
      filter((t): t is TargetResponse => !!t)
    );
  }
}
