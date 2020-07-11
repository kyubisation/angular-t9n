import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoMigrateComponent } from './auto-migrate.component';

describe('AutoMigrateComponent', () => {
  let component: AutoMigrateComponent;
  let fixture: ComponentFixture<AutoMigrateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AutoMigrateComponent],
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
