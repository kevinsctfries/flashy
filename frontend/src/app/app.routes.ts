import { Routes } from '@angular/router';
import { NewSubjectComponent } from './new-subject/new-subject.component';
import { SubjectConversationComponent } from './subject-conversation/subject-conversation.component';

export const routes: Routes = [
  {
    path: '',
    component: NewSubjectComponent,
  },
  {
    path: 'chat/:id',
    component: SubjectConversationComponent,
  },
];
