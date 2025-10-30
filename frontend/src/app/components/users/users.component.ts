import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  searchText: string = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => {
        console.error('Erreur chargement utilisateurs :', err);
        alert('Erreur lors de la récupération des utilisateurs.');
      },
    });
  }

  get filteredUsers(): any[] {
    const search = this.searchText.toLowerCase();
    return this.users.filter(
      (u) =>
        u.Email.toLowerCase().includes(search) ||
        u.Role.toLowerCase().includes(search)
    );
  }

  deleteUser(id: number) {
    if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.users = this.users.filter((u) => u.Id !== id);
          alert('Utilisateur supprimé ✅');
        },
        error: (err) => {
          console.error(err);
          alert('Erreur lors de la suppression');
        },
      });
    }
  }
}
