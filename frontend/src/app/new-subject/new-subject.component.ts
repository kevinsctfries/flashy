import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-new-subject',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './new-subject.component.html',
  styleUrls: ['./new-subject.component.scss'],
})
export class NewSubjectComponent {
  subjectName = '';
  subjectDesc = '';

  constructor(private chatService: ChatService) {}

  startSubject() {
    if (this.subjectName) {
      this.chatService
        .startNewSubject(this.subjectName, this.subjectDesc)
        .subscribe({
          next: (response) => {
            console.log('New subject started:', response);
          },
          error: (error) => {
            console.error('Error starting subject:', error);
          },
        });
    }
  }
}
