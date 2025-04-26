import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatMessage {
  text: string;
  response: string;
  timestamp: number;
  type: string;
}

export interface ChatResponse {
  reply: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = 'http://localhost:5000/api';
  private timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  constructor(private http: HttpClient) {}

  getConversation(): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(
      `${this.apiUrl}/chat/conversation/test-conversation`
    );
  }

  sendMessage(message: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/chat`, {
      message,
      timezone: this.timezone,
    });
  }
}
