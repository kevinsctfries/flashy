import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
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
export class HomeComponent implements OnInit, AfterViewInit {
  subjects: Subject[] = [];

  @ViewChild('flashcardContainer', { static: false })
  flashcardContainer!: ElementRef<HTMLDivElement>;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.chatService.subjects$.subscribe({
      next: (subjects) => {
        this.subjects = subjects;
      },
      error: (error) => {
        console.error('Error loading subjects:', error);
      },
    });
    this.chatService.getSubjects();
  }

  ngAfterViewInit(): void {
    console.log('Flashcards created');
  }
}
