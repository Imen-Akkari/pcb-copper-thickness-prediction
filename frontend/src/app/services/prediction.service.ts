import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PredictionPoint {
  num_of: string;
  value: number;
  timestamp: string;
  prediction: any;
  proba?: number | number[] | null;
}

@Injectable({ providedIn: 'root' })
export class PredictionService {
  private base = 'http://localhost:8000/api/dashboard/predictions';
  constructor(private http: HttpClient) {}
  getPredictions(start?: string, end?: string): Observable<PredictionPoint[]> {
    let params = new HttpParams();
    if (start) params = params.set('start', start);
    if (end) params = params.set('end', end);
    return this.http.get<PredictionPoint[]>(this.base, { params });
  }
}
