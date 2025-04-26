import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ChatService,
  ChatMessage,
  ChatResponse,
} from './services/chat.service';
import { HttpClient } from '@angular/common/http';

interface Message {
  text: string;
  timestamp: number;
  type?: 'sent' | 'received';
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  title = 'flashy';
  message = '';
  sentMessage: Message[] = [];
  receivedMessage: Message[] = [];
  private apiUrl = 'http://localhost:5000/api';

  constructor(private chatService: ChatService, private http: HttpClient) {}
  ngOnInit(): void {
    this.loadConversation();
  }

  private loadConversation(): void {
    this.sentMessage = [];
    this.receivedMessage = [];

    this.chatService.getConversation().subscribe({
      next: (messages: ChatMessage[]) => {
        const sortedMessages = messages.sort(
          (a: ChatMessage, b: ChatMessage) => a.timestamp - b.timestamp
        );
        sortedMessages.forEach((msg: ChatMessage) => {
          this.sentMessage.push({ text: msg.text, timestamp: msg.timestamp });
          this.receiveMessage(msg.response, msg.timestamp);
        });
      },
      error: (error: Error) => {
        console.error('Error loading conversation:', error);
      },
    });
  }

  get chronologicalMessages() {
    const allMessages = [
      ...this.sentMessage.map((msg) => ({ ...msg, type: 'sent' })),
      ...this.receivedMessage.map((msg) => ({ ...msg, type: 'received' })),
    ];

    return allMessages.sort((a, b) => a.timestamp - b.timestamp);
  }

  sendMessage(event: Event): void {
    event.preventDefault();
    if (this.message.trim()) {
      const now = Date.now();
      const messageText = this.message;
      this.message = '';

      this.sentMessage.push({ text: messageText, timestamp: now });

      this.http
        .post<ChatResponse>(`${this.apiUrl}/chat`, { message: messageText })
        .subscribe({
          next: (response: ChatResponse) => {
            this.receiveMessage(response.reply, Date.now());
          },
          error: (error) => {
            console.error('Error sending message:', error);
            this.receiveMessage(
              'Sorry, there was an error processing your message.',
              Date.now()
            );
          },
        });
    }
  }

  receiveMessage(aiText: string, timestamp: number): void {
    this.receivedMessage.push({ text: aiText, timestamp });
  }
}
