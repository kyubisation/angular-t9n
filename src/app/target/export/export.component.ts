import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import { ExportService } from '../core/export.service';

@Component({
  selector: 't9n-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ExportService]
})
export class ExportComponent {
  filter: FormGroup;
  loading = new BehaviorSubject(false);

  constructor(private _exportService: ExportService, formBuilder: FormBuilder) {
    this.filter = formBuilder.group({
      state: ''
    });
  }

  export() {
    this.loading.next(true);
    this._exportService
      .export(this.filter.controls.state.value)
      .subscribe(() => this.loading.next(false));
  }
}
