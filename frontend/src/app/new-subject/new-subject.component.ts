import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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

  constructor(private chatService: ChatService, private router: Router) {}

  startSubject() {
    if (this.subjectName) {
      console.log('Sending request with:', {
        name: this.subjectName,
        desc: this.subjectDesc,
      });

      this.chatService
        .startNewSubject(this.subjectName, this.subjectDesc || '')
        .subscribe({
          next: (response) => {
            console.log('New subject started:', response);
            this.router.navigate(['/chat', response.conversation_id]);
          },
          error: (error) => {
            console.error('Error starting subject:', error);
            if (error.error && error.error.error) {
              alert(error.error.error);
            } else {
              alert('Failed to create subject. Please try again.');
            }
          },
        });
    }
  }
}
