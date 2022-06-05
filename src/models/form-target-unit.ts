import { UntypedFormControl } from '@angular/forms';

import { Hal } from './hal';

export interface FormTargetUnit extends Hal {
  id: string;
  source: string;
  target: UntypedFormControl;
  state: UntypedFormControl;
  description?: string;
  meaning?: string;
  locations?: string[];
}
