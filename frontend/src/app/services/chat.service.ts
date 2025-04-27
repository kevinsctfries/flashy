import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface ChatMessage {
  text: string;
  response: string;
  timestamp: number;
  type: string;
}

export interface ChatResponse {
  reply: string;
  timestamp: number;
  conversation_id: number;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = 'http://localhost:5000/api';
  private timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  private currentConversationId = 1; // temporarily set to 1

  constructor(private http: HttpClient) {}

  getConversation(): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(
      `${this.apiUrl}/chat/conversation/${this.currentConversationId}`
    );
  }

  sendMessage(message: string): Observable<ChatResponse> {
    return this.http
      .post<ChatResponse>(`${this.apiUrl}/chat`, {
        message,
        timezone: this.timezone,
        conversation_id: this.currentConversationId,
      })
      .pipe(
        tap((response) => {
          this.currentConversationId = response.conversation_id;
        })
      );
  }
}
