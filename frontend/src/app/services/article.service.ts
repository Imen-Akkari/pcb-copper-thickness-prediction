import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Mesure {
  Nm_mesure: number | null;
  Mesure: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  private baseUrl = 'http://localhost:8000/api';
  private articlesUrl = 'http://localhost:8000/articles';

  constructor(private http: HttpClient) {}

  getArticles(): Observable<any[]> {
    return this.http.get<any[]>(this.articlesUrl);
  }

  getArticleByNumOF(numOf: string): Observable<any> {
    return this.http.get<any>(`${this.articlesUrl}/${numOf}`);
  }

  ajouterMesure(numOF: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/mesure`, { Num_OF: numOF });
  }

  getDerniereMesure(numOF: string): Observable<Mesure> {
    return this.http.get<Mesure>(`${this.baseUrl}/mesure/latest/${numOF}`);
  }

  getArticleWithMesure(numOf: string) {
    return this.http.get<any[]>(
      `http://localhost:8000/articles_mesures/${numOf}`
    );
  }
}
