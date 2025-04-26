import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Flashcard {
  subject: string;
  question: string;
  answer: string;
  conversation_id: string;
}

@Injectable({
  providedIn: 'root',
})
export class FlashcardService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  createFlashcard(flashcard: Flashcard): Observable<Flashcard> {
    return this.http.post<Flashcard>(`${this.apiUrl}/flashcards`, flashcard);
  }

  getFlashcards(conversationId: string): Observable<Flashcard[]> {
    return this.http.get<Flashcard[]>(
      `${this.apiUrl}/flashcards/${conversationId}`
    );
  }
}
