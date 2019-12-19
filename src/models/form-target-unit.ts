import { FormControl } from '@angular/forms';

import { Hal } from './hal';

export interface FormTargetUnit extends Hal {
  id: string;
  source: string;
  target: FormControl;
  state: FormControl;
  description?: string;
  meaning?: string;
  locations?: string[];
}
