import { Component, HostBinding } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TranslationService } from './core/translation.service';

@Component({
  selector: 't9n-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @HostBinding('class.service-down') serviceDown = false;

  constructor(translationService: TranslationService, snackbar: MatSnackBar) {
    translationService.serviceDown.subscribe(a => {
      this.serviceDown = a;
      if (a) {
        snackbar.open(
          `Translation server is not available. Start the server in the console with the command 'ng run yourProject:t9n'`,
          undefined,
          { duration: 2500 }
        );
      }
    });
  }
}
