import { ChangeDetectionStrategy, Component, HostBinding, HostListener } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import { ImportResult } from '../core/import-result';
import { ImportService } from '../core/import.service';

@Component({
  selector: 't9n-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ImportService],
})
export class ImportComponent {
  @HostBinding('class.dragging') dragging = false;
  importing = new BehaviorSubject(false);
  importResult = new BehaviorSubject<ImportResult | undefined>(undefined);
  targetState = new UntypedFormControl('translated');

  constructor(private _importService: ImportService) {}

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
