import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueSidebarComponent } from './issue-sidebar.component';

describe('IssueSidebarComponent', () => {
  let component: IssueSidebarComponent;
  let fixture: ComponentFixture<IssueSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IssueSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IssueSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
