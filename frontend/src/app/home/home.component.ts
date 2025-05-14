import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChatService, Subject } from '../services/chat.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  subjects: Subject[] = [];

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.loadSubjects();
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
}
