import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import { ExportService } from '../core/export.service';

@Component({
  selector: 't9n-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ExportService],
})
export class ExportComponent {
  configuration: FormGroup;
  loading = new BehaviorSubject(false);

  constructor(private _exportService: ExportService, formBuilder: FormBuilder) {
    this.configuration = formBuilder.group({
      state: 'initial',
    });
  }

  export() {
    this.loading.next(true);
    this._exportService.export(this.configuration.value).subscribe(() => this.loading.next(false));
  }
}
