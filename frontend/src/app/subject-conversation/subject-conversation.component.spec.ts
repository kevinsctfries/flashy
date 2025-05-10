import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectConversationComponent } from './subject-conversation.component';

describe('SubjectConversationComponent', () => {
  let component: SubjectConversationComponent;
  let fixture: ComponentFixture<SubjectConversationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectConversationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubjectConversationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
