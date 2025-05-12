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

export interface NewSubjectResponse {
  conversation_id: number;
  subject_name: string;
  subject_desc: string;
}

export interface Subject {
  id: number;
  subject_name: string;
  subject_desc: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = 'http://localhost:5000/api';
  private timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  private currentConversationId: number | null = null;

  constructor(private http: HttpClient) {}

  getConversation(id: number): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(
      `${this.apiUrl}/chat/conversation/${id}`
    );
  }

  sendMessage(
    message: string,
    conversationId: number
  ): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/chat`, {
      message,
      timezone: this.timezone,
      conversation_id: conversationId,
    });
  }

  startNewSubject(
    subjectName: string,
    subjectDesc: string
  ): Observable<NewSubjectResponse> {
    return this.http
      .post<NewSubjectResponse>(`${this.apiUrl}/chat/new`, {
        subject_name: subjectName,
        subject_desc: subjectDesc,
      })
      .pipe(
        tap((response) => {
          this.currentConversationId = response.conversation_id;
        })
      );
  }

  getSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.apiUrl}/subjects`);
  }
}
