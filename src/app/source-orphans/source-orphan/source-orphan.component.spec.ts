import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SourceOrphanComponent } from './source-orphan.component';

describe('SourceOrphanComponent', () => {
  let component: SourceOrphanComponent;
  let fixture: ComponentFixture<SourceOrphanComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SourceOrphanComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SourceOrphanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
