import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OrphanComponent } from './orphan.component';

describe('OrphanComponent', () => {
  let component: OrphanComponent;
  let fixture: ComponentFixture<OrphanComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [OrphanComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(OrphanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
