import { Component, HostBinding } from '@angular/core';

import { TranslationService } from './core/translation.service';

@Component({
  selector: 't9n-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @HostBinding('class.service-down') serviceDown = false;

  constructor(translationService: TranslationService) {
    translationService.serviceDown.subscribe(a => (this.serviceDown = a));
  }
}
