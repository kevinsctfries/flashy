import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';

type Message = {
  text: string;
  timestamp: number;
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'flashy';
  message: string = '';
  sentMessage: Message[] = [];
  receivedMessage: Message[] = [];

  sendMessage(event: Event): void {
    event.preventDefault();
    if (this.message.trim()) {
      const now = Date.now();
      this.sentMessage.push({ text: this.message, timestamp: now });

      // Simulate AI response after a short delay
      setTimeout(() => {
        this.receiveMessage('AI response goes here', Date.now());
      }, 300);

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
