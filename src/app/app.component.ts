import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'flashy';
  sentMessage: string[] = [];
  receivedMessage: string[] = [];

  addMessage(userMessage: string, aiMessage: string): void {
    this.sentMessage.push(userMessage);
    this.receivedMessage.push(aiMessage);
  }
}
