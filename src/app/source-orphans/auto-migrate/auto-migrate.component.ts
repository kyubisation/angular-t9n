import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import { TranslationSourceUnitResponse } from '../../../models';
import { SourceOrphansService } from '../core/source-orphans.service';

@Component({
  selector: 't9n-auto-migrate',
  templateUrl: './auto-migrate.component.html',
  styleUrls: ['./auto-migrate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutoMigrateComponent {
  configuration: UntypedFormGroup;
  loading = new BehaviorSubject(false);
  migrations = new BehaviorSubject<TranslationSourceUnitResponse[] | null>(null);

  constructor(
    private _sourceOrphansService: SourceOrphansService,
    formBuilder: UntypedFormBuilder
  ) {
    this.configuration = formBuilder.group({
      distanceThreshold: [0, [Validators.min(0), Validators.required]],
    });
  }

  autoMigrate() {
    this.loading.next(true);
    const distanceThreshold = +this.configuration.get('distanceThreshold')!.value;
    this._sourceOrphansService.autoMigrateOrphans(distanceThreshold).subscribe((o) => {
      this.migrations.next(o);
      this.loading.next(false);
    });
  }
}
