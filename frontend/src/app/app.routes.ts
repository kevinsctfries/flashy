import { Routes } from '@angular/router';
import { NewSubjectComponent } from './new-subject/new-subject.component';
import { SubjectConversationComponent } from './subject-conversation/subject-conversation.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'new-subject',
    component: NewSubjectComponent,
  },
  {
    path: 'chat/:id',
    component: SubjectConversationComponent,
  },
];
