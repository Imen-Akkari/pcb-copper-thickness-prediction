import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SerialService {
  private apiUrl = 'http://localhost:8000/api/data'; // 🔁 adapte si ton port est différent

  constructor(private http: HttpClient) {}

  getData(): Observable<{ valeur: string }> {
    return this.http.get<{ valeur: string }>(this.apiUrl);
  }
}
