import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
})
export class AddUserComponent {
  user = {
    email: '',
    firstname: '',
    lastname: '',
    role: 'operateur',
  };

  successMessage = '';
  errorMessage = '';
  returnedPassword = '';
  emailSent: boolean | null = null;

  constructor(private http: HttpClient) {}

  onSubmit() {
    this.http
      .post<any>('http://localhost:8000/api/add-user', this.user)
      .subscribe({
        next: (response) => {
          this.successMessage = '✅ Utilisateur ajouté avec succès !';
          this.errorMessage = '';
          this.returnedPassword = response?.password || '';
          this.emailSent = !!response?.email_sent;
          this.user = { email: '', firstname: '', lastname: '', role: 'operateur' };
        },
        error: (error) => {
          this.errorMessage =
            error.error?.detail || '❌ Une erreur est survenue.';
          this.successMessage = '';
          this.returnedPassword = '';
          this.emailSent = null;
        },
      });
  }
}
