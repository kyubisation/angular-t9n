import { TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 't9n-i18n-examples-template',
  templateUrl: './i18n-examples-template.component.html',
  standalone: true,
  imports: [TitleCasePipe],
})
export class I18nExamplesTemplateComponent {
  title = 'angular-t9n';
  amount = 1;
  minutes = 1;
  gender = 'm';
}
