import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from './services/chat.service';
import { HttpClient } from '@angular/common/http';

interface Message {
  text: string;
  timestamp: number;
}

interface ChatResponse {
  reply: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'flashy';
  message = '';
  sentMessage: Message[] = [];
  receivedMessage: Message[] = [];
  private apiUrl = 'http://localhost:5000/api';

  constructor(private chatService: ChatService, private http: HttpClient) {}
  ngOnInit(): void {
    this.loadConversation();
  }

  private loadConversation() {
    this.chatService.getConversation().subscribe({
      next: (messages) => {
        messages.forEach((msg) => {
          this.sentMessage.push({ text: msg.text, timestamp: msg.timestamp });
          this.receiveMessage(msg.response, msg.timestamp);
        });
      },
      error: (error) => {
        console.error('Error loading conversation:', error);
      },
    });
  }

  sendMessage(event: Event): void {
    event.preventDefault();
    if (this.message.trim()) {
      const now = Date.now();
      this.sentMessage.push({ text: this.message, timestamp: now });

      // Send message to backend
      this.http
        .post<ChatResponse>(`${this.apiUrl}/chat`, { message: this.message })
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

      this.message = '';
    }
  }

  receiveMessage(aiText: string, timestamp: number): void {
    this.receivedMessage.push({ text: aiText, timestamp });
  }

  get chronologicalMessages() {
    const sent = this.sentMessage.map((m) => ({ ...m, type: 'sent' }));
    const received = this.receivedMessage.map((m) => ({
      ...m,
      type: 'received',
    }));
    return [...sent, ...received].sort((a, b) => a.timestamp - b.timestamp);
  }
}
