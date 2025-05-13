import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { ChatService, Subject } from './services/chat.service';
import { DeleteBoxComponent } from './delete-box/delete-box.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, DeleteBoxComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  title = 'flashy';
  subjects: Subject[] = [];
  showDeleteDialog = false;
  subjectToDelete: number | null = null;

  constructor(private chatService: ChatService, private router: Router) {}

  ngOnInit(): void {
    this.initializeSidebar();
    this.loadSubjects();
  }

  private initializeSidebar(): void {
    const sidebar = document.getElementById('mySidebar');
    const main = document.getElementById('main');
    const button = document.querySelector('.openbtn') as HTMLElement;
    const isOpen = localStorage.getItem('sidebarOpen') !== 'false';

    if (sidebar && main && button) {
      if (isOpen) {
        sidebar.style.left = '0';
        main.style.marginLeft = '250px';
        button.style.left = '1rem';
      } else {
        sidebar.style.left = '-250px';
        main.style.marginLeft = '0';
        button.style.left = '1rem';
      }
    }
  }

  openNav() {
    const sidebar = document.getElementById('mySidebar');
    const main = document.getElementById('main');
    const button = document.querySelector('.openbtn') as HTMLElement;

    if (sidebar && main && button) {
      const isOpen = sidebar.style.left === '0px';
      if (isOpen) {
        sidebar.style.left = '-250px';
        main.style.marginLeft = '0';
        button.style.left = '1rem';
        localStorage.setItem('sidebarOpen', 'false');
      } else {
        sidebar.style.left = '0';
        main.style.marginLeft = '250px';
        button.style.left = '1rem';
        localStorage.setItem('sidebarOpen', 'true');
      }
    }
  }

  private loadSubjects() {
    this.chatService.getSubjects().subscribe({
      next: (subjects) => {
        this.subjects = subjects;
      },
      error: (error) => {
        console.error('Error loading subjects:', error);
      },
    });
  }

  deleteSubject(id: number) {
    this.subjectToDelete = id;
    this.showDeleteDialog = true;
  }

  handleDeleteConfirm() {
    if (this.subjectToDelete) {
      this.chatService.deleteSubject(this.subjectToDelete).subscribe({
        next: () => {
          this.subjects = this.subjects.filter(
            (subject) => subject.id !== this.subjectToDelete
          );
          if (this.router.url === `/chat/${this.subjectToDelete}`) {
            this.router.navigate(['/']);
          }
          this.showDeleteDialog = false;
          this.subjectToDelete = null;
        },
        error: (error) => {
          console.error('Error deleting subject:', error);
          alert('Failed to delete subject. Please try again.');
        },
      });
    }
  }

  handleDeleteCancel() {
    this.showDeleteDialog = false;
    this.subjectToDelete = null;
  }
}
