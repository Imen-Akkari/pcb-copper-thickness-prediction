import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PasswordService } from '../../services/password.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  token = '';
  password = '';
  confirm = '';
  loading = false;
  message: string | null = null;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router, private passwordSvc: PasswordService) {
    this.token = this.route.snapshot.paramMap.get('token') || '';
  }

  submit() {
    if (!this.password || this.password !== this.confirm) {
      this.error = 'Les mots de passe ne correspondent pas.';
      return;
    }
    this.loading = true;
    this.message = null;
    this.error = null;
    this.passwordSvc.resetPassword(this.token, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.message = 'Mot de passe réinitialisé avec succès. Vous pouvez vous connecter.';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: () => {
        this.loading = false;
        this.error = 'Lien invalide ou expiré.';
      }
    });
  }
}
