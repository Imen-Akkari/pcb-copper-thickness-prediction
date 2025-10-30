import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PasswordService {
  private base = 'http://localhost:8000/api/auth';
  constructor(private http: HttpClient) {}

  requestReset(email: string): Observable<any> {
    // POST /api/auth/forgot-password { email }
    return this.http.post(`${this.base}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    // POST /api/auth/reset-password { token, new_password }
    return this.http.post(`${this.base}/reset-password`, {
      token,
      new_password: newPassword,
    });
  }
}
