import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
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
  private subjectsSource = new BehaviorSubject<Subject[]>([]);
  subjects$ = this.subjectsSource.asObservable();

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

  getSubjects(): Observable<Subject[]> {
    this.http.get<Subject[]>(`${this.apiUrl}/subjects`).subscribe({
      next: (subjects) => this.subjectsSource.next(subjects),
      error: (error) => console.error('Error fetching subjects:', error),
    });
    return this.subjects$;
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
        tap(() => this.getSubjects()), // refreshes subjects after creating new one
        tap((response) => {
          this.currentConversationId = response.conversation_id;
        })
      );
  }

  deleteSubject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/subjects/${id}`).pipe(
      tap(() => this.getSubjects()) // refreshes subjects after deletion
    );
  }
}
