import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SourceOrphansComponent } from './source-orphans.component';

describe('SourceOrphansComponent', () => {
  let component: SourceOrphansComponent;
  let fixture: ComponentFixture<SourceOrphansComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [SourceOrphansComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(SourceOrphansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
