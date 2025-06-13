import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  HostListener,
  inject,
} from '@angular/core';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { ImportResult } from '../core/import-result';
import { ImportService } from '../core/import.service';

@Component({
  selector: 't9n-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ImportService],
  imports: [
    RouterLink,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatOptionModule,
    MatButtonModule,
    NgIf,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatListModule,
    NgFor,
    AsyncPipe,
  ],
})
export class ImportComponent {
  private _importService = inject(ImportService);

  @HostBinding('class.dragging') dragging = false;
  importing = new BehaviorSubject(false);
  importResult = new BehaviorSubject<ImportResult | undefined>(undefined);
  targetState = new UntypedFormControl('translated');

  @HostListener('dragover', ['$event']) onDragOver(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.dragging = true;
  }

  @HostListener('dragleave', ['$event']) onDragLeave(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.dragging = false;
  }

  @HostListener('drop', ['$event']) onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragging = false;
    if (event.dataTransfer?.files.length) {
      this._import(event.dataTransfer.files);
    }
  }

  onInput(event: Event) {
    if ((event?.target as HTMLInputElement)?.files) {
      this._import((event.target as HTMLInputElement).files!);
    }
  }

  private async _import(files: FileList) {
    this.importResult.next(undefined);
    this.importing.next(true);
    try {
      const result = await this._importService.import(files, this.targetState.value);
      this.importResult.next(result);
    } catch {}
    this.importing.next(false);
  }
}
