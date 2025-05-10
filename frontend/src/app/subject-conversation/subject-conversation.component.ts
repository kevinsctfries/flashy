import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../services/chat.service';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

interface Message {
  text: string;
  timestamp: number;
  type?: 'sent' | 'received';
  flashcards?: { question: string; answer: string }[];
}

@Component({
  selector: 'app-subject-conversation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './subject-conversation.component.html',
  styleUrls: ['./subject-conversation.component.scss'],
})
export class SubjectConversationComponent implements OnInit {
  private conversationId!: number;
  userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  title = 'flashy';
  message = '';
  sentMessage: Message[] = [];
  receivedMessage: Message[] = [];
  private apiUrl = 'http://localhost:5000/api';

  constructor(
    private chatService: ChatService,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.conversationId = +params['id'];
      this.loadConversation();
    });
  }

  private loadConversation() {
    this.chatService.getConversation(this.conversationId).subscribe({
      next: (messages) => {
        // Clear existing messages
        this.sentMessage = [];
        this.receivedMessage = [];

        // Sort messages by timestamp
        messages.forEach((msg) => {
          if (msg.type === 'sent') {
            this.sentMessage.push({
              text: msg.text,
              timestamp: msg.timestamp,
              type: 'sent',
            });
          } else {
            this.receivedMessage.push({
              text: msg.text,
              timestamp: msg.timestamp,
              type: 'received',
            });
          }
        });
      },
      error: (error) => {
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

      this.chatService.sendMessage(messageText, this.conversationId).subscribe({
        next: (response) => {
          this.receiveMessage(response.reply, Date.now());
          this.scrollToBottom();
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

  private scrollToBottom(): void {
    const container = document.querySelector('.messages-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  private formatQAResponse(
    response: string
  ): { question: string; answer: string }[] {
    return response
      .split(/(?=Q:)/g)
      .map((block) => {
        const [q, a] = block.split(/A:/).map((s) => s.trim());
        return {
          question: q.replace(/^Q:\s*/, ''),
          answer: a,
        };
      })
      .filter((pair) => pair.question && pair.answer);
  }

  receiveMessage(aiText: string, timestamp: number): void {
    const formattedBlocks = this.formatQAResponse(aiText);

    const flashcards = formattedBlocks.length > 0 ? formattedBlocks : undefined;

    const message: Message = {
      text: aiText,
      timestamp,
      flashcards,
    };

    this.receivedMessage.push(message);

    this.scrollToBottom();
  }
}
