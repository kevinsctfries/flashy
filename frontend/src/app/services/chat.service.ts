import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatMessage {
  text: string;
  response: string;
  timestamp: number;
  type: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = 'http://localhost:5000/api';
  private conversationId = 'test-conversation'; // We'll make this dynamic later

  constructor(private http: HttpClient) {}

  getConversation(): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(
      `${this.apiUrl}/chat/conversation/${this.conversationId}`
    );
  }
}
