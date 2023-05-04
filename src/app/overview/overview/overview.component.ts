import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

import { TargetResponse } from '../../../models';
import { TranslationService } from '../../core/translation.service';
import { WebsocketService } from '../../core/websocket.service';
import { AddLanguageModalComponent } from '../add-language-modal/add-language-modal.component';

@Component({
  selector: 't9n-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewComponent implements OnInit {
  project: Observable<string>;
  sourceFile: Observable<string>;
  sourceLanguage: Observable<string>;
  unitCount: Observable<number>;
  targets: Observable<TargetResponse[]>;

  constructor(
    private _dialog: MatDialog,
    private _translationService: TranslationService,
    websocketService: WebsocketService
  ) {
    this.project = websocketService.projectChange.pipe(map((p) => p.project));
    this.sourceFile = websocketService.projectChange.pipe(map((p) => p.sourceFile));
    this.sourceLanguage = _translationService.root.pipe(map((r) => r.sourceLanguage));
    this.unitCount = _translationService.root.pipe(map((r) => r.unitCount));
    this.targets = _translationService.targets;
  }

  ngOnInit(): void {
    this.targets
      .pipe(
        take(1),
        switchMap((targets) =>
          targets.length
            ? forkJoin(targets.map((t) => this._translationService.updateTarget(t.language)))
            : of()
        )
      )
      .subscribe();
  }

  openLanguageModal() {
    this._dialog.open(AddLanguageModalComponent);
  }

  initialPercentage(target: TargetResponse) {
    return Math.round((100 / target.unitCount) * target.initialCount);
  }

  translatedPercentage(target: TargetResponse) {
    return Math.round((100 / target.unitCount) * target.translatedCount);
  }

  reviewedPercentage(target: TargetResponse) {
    return Math.round((100 / target.unitCount) * target.reviewedCount);
  }

  finalPercentage(target: TargetResponse) {
    return (
      100 -
      (this.initialPercentage(target) +
        this.translatedPercentage(target) +
        this.reviewedPercentage(target))
    );
  }
}
