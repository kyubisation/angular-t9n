import { NgIf, AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
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
  providers: [TranslationTargetService],
  imports: [
    MatSidenavModule,
    MatListModule,
    RouterLink,
    RouterLinkActive,
    NgIf,
    MatCardModule,
    RouterOutlet,
    AsyncPipe,
  ],
})
export class TargetComponent {
  private _route = inject(ActivatedRoute);
  private _translationService = inject(TranslationService);

  target: Observable<TargetResponse>;

  constructor() {
    this.target = this._route.params.pipe(
      switchMap((p) => this._translationService.target(p.language)),
      filter((t): t is TargetResponse => !!t),
    );
  }
}
