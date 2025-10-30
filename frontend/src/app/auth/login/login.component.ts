import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  email = '';
  password = '';
  showPwd = false;
  error: string | null = null;
  year = new Date().getFullYear();

  constructor(private http: HttpClient, private router: Router) {}

  onLogin() {
    this.error = null;
    this.http
      .post<any>('http://localhost:8000/api/login', {
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: (res) => {
          localStorage.setItem('token', res.token);
          localStorage.setItem('role', res.role);
          localStorage.setItem('email', this.email);

          this.router.navigate(['/home']);
        },
        error: () => {
          this.error = 'Identifiants invalides. Veuillez réessayer.';
        },
      });
  }

  togglePwd() {
    this.showPwd = !this.showPwd;
  }
}
