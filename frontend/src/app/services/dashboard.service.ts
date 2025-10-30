import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = 'http://127.0.0.1:8000'; // FastAPI backend

  constructor(private http: HttpClient) {}

  // Récupérer les mesures
  getMesures(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mesures`);
  }

  // Récupérer le nombre d’articles et de mesures
  getArticlesCount(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }
}
