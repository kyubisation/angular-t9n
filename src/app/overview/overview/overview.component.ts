import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { TargetResponse } from '../../../models';
import { TranslationService } from '../../core/translation.service';
import { AddLanguageModalComponent } from '../add-language-modal/add-language-modal.component';

@Component({
  selector: 't9n-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverviewComponent {
  sourceLanguage: Observable<string>;
  unitCount: Observable<number>;
  targets: Observable<TargetResponse[]>;

  constructor(private dialog: MatDialog, translationService: TranslationService) {
    this.sourceLanguage = translationService.sourceLanguage;
    this.unitCount = translationService.unitCount;
    this.targets = translationService.targets;
  }

  openLanguageModal() {
    this.dialog.open(AddLanguageModalComponent);
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
