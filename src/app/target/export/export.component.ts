import { NgIf, AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { BehaviorSubject } from 'rxjs';

import { ExportService } from '../core/export.service';

@Component({
  selector: 't9n-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ExportService],
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    NgIf,
    MatProgressSpinnerModule,
    AsyncPipe,
  ],
})
export class ExportComponent {
  configuration: UntypedFormGroup;
  loading = new BehaviorSubject(false);

  constructor(
    private _exportService: ExportService,
    formBuilder: UntypedFormBuilder,
  ) {
    this.configuration = formBuilder.group({
      state: 'initial',
    });
  }

  export() {
    this.loading.next(true);
    this._exportService.export(this.configuration.value).subscribe(() => this.loading.next(false));
  }
}
