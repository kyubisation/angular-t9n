import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { OrphansComponent } from './orphans.component';

describe('OrphansComponent', () => {
  let component: OrphansComponent;
  let fixture: ComponentFixture<OrphansComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [OrphansComponent],
      imports: [NoopAnimationsModule, MatPaginatorModule, MatSortModule, MatTableModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrphansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should compile', () => {
    expect(component).toBeTruthy();
  });
});
