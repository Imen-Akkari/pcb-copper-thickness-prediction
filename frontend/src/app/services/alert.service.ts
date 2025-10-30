import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private apiUrl = 'http://127.0.0.1:8000/alertes';

  constructor(private http: HttpClient) {}

  getAlertes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
