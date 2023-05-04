import { Component } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, startWith, switchMap, take } from 'rxjs/operators';

import { locales } from '../../../locales';
import { TranslationService } from '../../core/translation.service';

@Component({
  selector: 't9n-add-language-modal',
  templateUrl: './add-language-modal.component.html',
  styleUrls: ['./add-language-modal.component.scss'],
})
export class AddLanguageModalComponent {
  form: UntypedFormGroup;
  locales: Observable<string[]>;

  constructor(
    private _dialogRef: MatDialogRef<AddLanguageModalComponent>,
    private _translationService: TranslationService,
    formBuilder: UntypedFormBuilder
  ) {
    this.form = formBuilder.group({
      language: [
        '',
        [Validators.required, Validators.pattern('\\w[\\w-]*')],
        (control: AbstractControl) => this._targetExists(control),
      ],
    });
    this.locales = this.form.controls.language.valueChanges.pipe(
      startWith(''),
      map((language) => (language ? locales.filter((locale) => locale.startsWith(language)) : [])),
      switchMap((filteredLocales) =>
        this._translationService.targets.pipe(
          map((targets) => targets.map((t) => t.language)),
          map((t) => filteredLocales.filter((l) => t.indexOf(l) < 0))
        )
      ),
      map((l) => l.slice(0, 20))
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

  private _targetExists(control: AbstractControl) {
    return this._translationService.targets.pipe(
      take(1),
      map((targets) =>
        targets.some((t) => t.language === control.value) ? { target: true } : null
      )
    );
  }
}
