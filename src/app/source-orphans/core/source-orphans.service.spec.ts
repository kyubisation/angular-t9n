import { TestBed } from '@angular/core/testing';

import { SourceOrphansService } from './source-orphans.service';

describe('SourceOrphansService', () => {
  let service: SourceOrphansService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SourceOrphansService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
