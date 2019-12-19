import { TestBed } from '@angular/core/testing';

import { TranslationTargetService } from './translation-target.service';

describe('TranslationTargetService', () => {
  let service: TranslationTargetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TranslationTargetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
