import { NgIf, AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BehaviorSubject } from 'rxjs';

import { TranslationSourceUnitResponse } from '../../../models';
import { SourceOrphansService } from '../core/source-orphans.service';

@Component({
  selector: 't9n-auto-migrate',
  templateUrl: './auto-migrate.component.html',
  styleUrls: ['./auto-migrate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    NgIf,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatSortModule,
    MatTooltipModule,
    AsyncPipe,
  ],
})
export class AutoMigrateComponent {
  configuration: UntypedFormGroup;
  loading = new BehaviorSubject(false);
  migrations = new BehaviorSubject<TranslationSourceUnitResponse[] | null>(null);

  constructor(
    private _sourceOrphansService: SourceOrphansService,
    formBuilder: UntypedFormBuilder,
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
