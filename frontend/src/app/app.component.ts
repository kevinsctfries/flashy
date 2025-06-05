import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { ChatService, Subject } from './services/chat.service';
import { DeleteBoxComponent } from './delete-box/delete-box.component';
import { ModelDownloaderComponent } from './model-downloader/model-downloader.component';

import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    DeleteBoxComponent,
    ModelDownloaderComponent,
    MatDialogModule,
    MatButtonModule,
    MatProgressBarModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  @ViewChild(ModelDownloaderComponent)
  modelDownloader!: ModelDownloaderComponent;

  userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  title = 'flashy';
  subjects: Subject[] = [];
  showDeleteDialog = false;
  subjectToDelete: number | null = null;

  constructor(private chatService: ChatService, private router: Router) {}

  ngOnInit(): void {
    this.initializeSidebar();

    // Subscribe to subjects$ for updates
    this.chatService.subjects$.subscribe({
      next: (subjects) => {
        this.subjects = subjects;
      },
      error: (error) => {
        console.error('Error loading subjects:', error);
      },
    });

    this.chatService.getSubjects().subscribe({
      error: (error) => {
        console.error('Error fetching subjects:', error);
      },
    });
  }

  private initializeSidebar(): void {
    const sidebar = document.getElementById('mySidebar');
    const main = document.getElementById('main');
    const button = document.querySelector('.button') as HTMLElement;
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

  openDownloadMenu() {
    if (this.modelDownloader) {
      this.modelDownloader.openDialog();
    }
  }

  openNav() {
    const sidebar = document.getElementById('mySidebar');
    const main = document.getElementById('main');
    const button = document.querySelector('.button') as HTMLElement;

    if (sidebar && main && button) {
      // checks local storage for sidebar state
      const isOpen = localStorage.getItem('sidebarOpen') !== 'false';

      if (isOpen) {
        sidebar.style.left = '-250px';
        main.style.marginLeft = '0';
        button.style.left = '1rem';
        localStorage.setItem('sidebarOpen', 'false');
      } else {
        sidebar.style.left = '0';
        main.style.marginLeft = '250px';
        localStorage.setItem('sidebarOpen', 'true');
      }
    }
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
