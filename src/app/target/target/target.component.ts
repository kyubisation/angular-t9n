import { NgIf, AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
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
  standalone: true,
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
  target: Observable<TargetResponse>;

  constructor(
    private _route: ActivatedRoute,
    private _translationService: TranslationService,
  ) {
    this.target = this._route.params.pipe(
      switchMap((p) => this._translationService.target(p.language)),
      filter((t): t is TargetResponse => !!t),
    );
  }
}
