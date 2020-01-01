import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { locales } from '../../../locales';
import { TranslationService } from '../../core/translation.service';

@Component({
  selector: 't9n-add-language-modal',
  templateUrl: './add-language-modal.component.html',
  styleUrls: ['./add-language-modal.component.scss']
})
export class AddLanguageModalComponent {
  form: FormGroup;
  locales: Observable<string[]>;

  constructor(
    private _dialogRef: MatDialogRef<AddLanguageModalComponent>,
    private _translationService: TranslationService,
    formBuilder: FormBuilder
  ) {
    this.form = formBuilder.group({
      language: ['', [Validators.required, Validators.pattern('\\w[\\w-]*')]]
    });
    this.locales = this.form.controls.language.valueChanges.pipe(
      startWith(''),
      map(language =>
        language ? locales.filter(locale => locale.startsWith(language)).slice(0, 10) : []
      )
    );
  }

  createLanguage() {
    if (!this.form.valid) {
      return;
    }

    this._translationService
      .createTarget(this.form.controls.language.value)
      .subscribe(() => this._dialogRef.close());
  }
}
