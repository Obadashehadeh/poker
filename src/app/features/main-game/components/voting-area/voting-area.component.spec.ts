import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VotingAreaComponent } from './voting-area.component';

describe('VotingAreaComponent', () => {
  let component: VotingAreaComponent;
  let fixture: ComponentFixture<VotingAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VotingAreaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VotingAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
