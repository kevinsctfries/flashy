import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewSubjectComponent } from './new-subject.component';

describe('NewSubjectComponent', () => {
  let component: NewSubjectComponent;
  let fixture: ComponentFixture<NewSubjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewSubjectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewSubjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
