import { Component, OnInit } from '@angular/core';
import { AlertService } from '../../services/alert.service';

interface Alerte {
  article: number;
  mesure: number;
  status: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  alertes: Alerte[] = []; // <- déclaration de la propriété

  constructor(private alertService: AlertService) { }

  ngOnInit(): void {
    this.alertes = [
      { article: 93115, mesure: 66.4, status: 'alerte' },
      { article: 93115, mesure: 63.5, status: 'alerte' },
      { article: 93115, mesure: 30.1, status: 'ok' },
      { article: 93115, mesure: 44.5, status: 'ok' },
      { article: 93116, mesure: 25.1, status: 'ok' },
      { article: 93116, mesure: 25.1, status: 'ok' },
      { article: 93116, mesure: 26.1, status: 'ok' },
      { article: 93116, mesure: 23.0, status: 'ok' },
      { article: 93116, mesure: 33.1, status: 'ok' },
      { article: 93116, mesure: 35.0, status: 'ok' },
      { article: 93116, mesure: 31.8, status: 'ok' },
      { article: 93116, mesure: 33.1, status: 'ok' },
      { article: 92835, mesure: 66.0, status: 'alerte' },
      { article: 92835, mesure: 33.1, status: 'ok' },
      { article: 92835, mesure: 44.3, status: 'ok' },
      { article: 92835, mesure: 48.7, status: 'ok' },
      { article: 92835, mesure: 72.2, status: 'alerte' },
      { article: 94001, mesure: 28.9, status: 'ok' },
      { article: 94001, mesure: 29.3, status: 'ok' },
      { article: 94001, mesure: 61.2, status: 'alerte' },
      { article: 94002, mesure: 24.7, status: 'ok' },
      { article: 94002, mesure: 26.0, status: 'ok' },
      { article: 94002, mesure: 54.1, status: 'alerte' },
      { article: 95210, mesure: 22.5, status: 'ok' },
      { article: 95210, mesure: 27.4, status: 'ok' },
      { article: 95210, mesure: 68.9, status: 'alerte' },
      { article: 95211, mesure: 34.0, status: 'ok' },
      { article: 95211, mesure: 39.1, status: 'ok' },
      { article: 95211, mesure: 70.5, status: 'alerte' },
      { article: 96000, mesure: 31.2, status: 'ok' },
      { article: 96000, mesure: 29.9, status: 'ok' },
      { article: 96000, mesure: 62.3, status: 'alerte' }
    ];
  }

  removeItem(index: number) {
    const item = this.alertes[index];
    const ok = window.confirm(`Supprimer l'entrée Article ${item.article} (mesure ${item.mesure}) ?`);
    if (!ok) return;
    this.alertes.splice(index, 1);
    this.alertes = [...this.alertes];
  }

  trackByIndex(i: number) { return i; }

}
