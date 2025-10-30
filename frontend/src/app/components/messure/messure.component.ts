import { Component, OnInit } from '@angular/core';
import { SerialService } from 'src/app/services/serial.service';

@Component({
  selector: 'app-messure',
  templateUrl: './messure.component.html',
  styleUrls: ['./messure.component.css'],
})
export class MessureComponent implements OnInit {
  valeurSerie: string = '';

  constructor(private serialService: SerialService) {}

  ngOnInit(): void {
    // Met à jour la valeur toutes les secondes
    setInterval(() => {
      this.serialService.getData().subscribe((res) => {
        this.valeurSerie = res.valeur;
        console.log('Valeur série reçue :', this.valeurSerie); // Affichage dans la console
      });
    }, 1000); // 1000 ms = 1 seconde
  }
}
