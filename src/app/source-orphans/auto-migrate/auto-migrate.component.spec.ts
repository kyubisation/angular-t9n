import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AutoMigrateComponent } from './auto-migrate.component';

describe('AutoMigrateComponent', () => {
  let component: AutoMigrateComponent;
  let fixture: ComponentFixture<AutoMigrateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AutoMigrateComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoMigrateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
