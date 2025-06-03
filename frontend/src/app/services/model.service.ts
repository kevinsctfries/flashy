import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface ModelDownloadResponse {
  status?: string;
  error?: string;
  requires_token?: boolean;
}

export interface ModelProgress {
  progress: number;
  total: number;
  status: string;
  error_message?: string;
}

export interface ModelCancelResponse {
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class ModelService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  checkModelStatus(): Observable<{ downloaded: boolean }> {
    return this.http
      .get<{ downloaded: boolean }>(`${this.apiUrl}/model/check`)
      .pipe(
        catchError((error) => {
          console.error('Error checking model status:', error);
          return throwError(() => error);
        })
      );
  }

  downloadModel(token?: string): Observable<ModelDownloadResponse> {
    return this.http.post<ModelDownloadResponse>(
      `${this.apiUrl}/model/download`,
      token ? { token } : {}
    );
  }

  getProgress(): Observable<ModelProgress> {
    return this.http.get<ModelProgress>(`${this.apiUrl}/model/progress`);
  }

  cancelDownload(): Observable<ModelCancelResponse> {
    return this.http
      .post<ModelCancelResponse>(`${this.apiUrl}/model/cancel`, {})
      .pipe(
        catchError((error) => {
          console.error('Error canceling download:', error);
          return throwError(() => error);
        })
      );
  }
}
