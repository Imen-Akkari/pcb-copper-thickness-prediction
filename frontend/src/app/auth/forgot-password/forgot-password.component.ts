import { Component, Inject } from '@angular/core';
import { PasswordService } from '../../services/password.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;
  message: string | null = null;
  error: string | null = null;

  constructor(@Inject(PasswordService) private passwordSvc: PasswordService) {}

  submit() {
    if (!this.email) return;
    this.loading = true;
    this.message = null;
    this.error = null;
    this.passwordSvc.requestReset(this.email).subscribe({
      next: () => {
        this.loading = false;
        this.message = "Si l'adresse existe, un email de réinitialisation a été envoyé.";
      },
      error: () => {
        // Pour la confidentialité, même message côté UI
        this.loading = false;
        this.message = "Si l'adresse existe, un email de réinitialisation a été envoyé.";
      }
    });
  }
}
