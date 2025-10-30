import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;
  userEmail: string | null = null;
  userRole: string | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const token = localStorage.getItem('token');
        const isLoginPage = this.router.url.includes('/login');
        this.isLoggedIn = !!token && !isLoginPage;

        this.userEmail = localStorage.getItem('email');
        this.userRole = localStorage.getItem('role');
      }
    });

    // Pour les cas où l'utilisateur ne change pas de route mais recharge la page
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token && !this.router.url.includes('/login');
    this.userEmail = localStorage.getItem('email');
    this.userRole = localStorage.getItem('role');
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
