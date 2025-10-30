import { Component, OnInit, OnDestroy } from '@angular/core';
import { ArticleService } from '../../services/article.service';
import { SerialService } from 'src/app/services/serial.service';
import { HttpClient } from '@angular/common/http';
import { Subscription, interval } from 'rxjs';

interface Mesure {
  valeur: string;
  date: string;
}

interface ArticleMesure {
  article: any;
  mesures: Mesure[];
  lastValeur: string;
}

@Component({
  selector: 'app-scan-article',
  templateUrl: './scan-article.component.html',
  styleUrls: ['./scan-article.component.css'],
})
export class ScanArticleComponent implements OnInit, OnDestroy {
  numOF: string = '';
  errorMessage: string = '';
  articlesMesures: ArticleMesure[] = [];
  currentOF: string = '';
  showDisplay: boolean = false;

  private intervalSubscription?: Subscription;
  private attenteNouvelleMesure: boolean = false; // ✅ On attend une nouvelle mesure fraîche
  private valeurAvantScan: string = ''; // Valeur avant scan OF, pour comparer

  constructor(
    private articleService: ArticleService,
    private serialService: SerialService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.intervalSubscription = interval(1000).subscribe(() => {
      if (!this.currentOF) return;

      const currentEntry = this.articlesMesures.find(
        (e) => e.article.Num_OF === this.currentOF
      );
      if (!currentEntry) return;

      this.serialService.getData().subscribe((res) => {
        const valeurSerie = res.valeur?.trim() || '';
        if (!valeurSerie || !/^\d+(\.\d+)?$/.test(valeurSerie)) return;

        // Si on attend une nouvelle mesure fraîche, on ne prend pas la valeur si elle est égale à valeurAvantScan ou à la dernière valeur connue
        if (this.attenteNouvelleMesure) {
          if (
            valeurSerie === this.valeurAvantScan ||
            valeurSerie === currentEntry.lastValeur
          ) {
            return; // toujours attente, ne rien faire
          }

          // Nouvelle valeur fraîche reçue
          this.attenteNouvelleMesure = false; // fin attente
        } else {
          // Si on n’attend pas une nouvelle mesure, ignorer les doublons
          if (valeurSerie === currentEntry.lastValeur) return;
        }

        // Enregistre la nouvelle mesure
        const now = new Date();
        const isoDate = now.toISOString();
        const localDate = now.toLocaleString();

        this.http
          .post('http://localhost:8000/api/save-mesure', {
            num_of: currentEntry.article.Num_OF,
            valeur: valeurSerie,
            date: isoDate,
          })
          .subscribe({
            next: () => {
              currentEntry.mesures.unshift({
                valeur: valeurSerie,
                date: localDate,
              });
              if (currentEntry.mesures.length > 5) currentEntry.mesures.pop();
              currentEntry.lastValeur = valeurSerie;
              this.showDisplay = true; // Affiche seulement après la 1ère mesure fraîche
            },
            error: (err) => {
              console.error('Erreur enregistrement mesure :', err);
            },
          });
      });
    });
  }

  ngOnDestroy(): void {
    this.intervalSubscription?.unsubscribe();
  }

  onNumOFChange(value: string) {
    const of = value.trim();
    if (!of) return;

    this.showDisplay = false; // ne rien afficher tant que nouvelle mesure pas reçue
    this.currentOF = of;

    // Avant d'attendre une mesure, lire la valeur actuelle du port série
    this.serialService.getData().subscribe((res) => {
      this.valeurAvantScan = res.valeur?.trim() || '';
      this.attenteNouvelleMesure = true; // On attend maintenant la nouvelle mesure fraîche
    });

    // Vérifie si OF déjà chargé
    const existe = this.articlesMesures.find((e) => e.article?.Num_OF === of);
    if (existe) {
      this.errorMessage = '';
      this.numOF = '';
      return;
    }

    // Récupère l'article et mesures existantes (pour garder en mémoire, mais n'affiche pas encore)
    this.articleService.getArticleByNumOF(of).subscribe({
      next: (data) => {
        this.errorMessage = '';

        const nouveau: ArticleMesure = {
          article: data,
          mesures: [],
          lastValeur: '',
        };

        this.http
          .get<any[]>(`http://localhost:8000/api/mesures/${data.Num_OF}`)
          .subscribe({
            next: (mesuresDb) => {
              nouveau.mesures = mesuresDb.map((m) => ({
                valeur: m.valeur_mesure,
                date: new Date(m.datetime_mesure).toLocaleString(),
              }));

              if (nouveau.mesures.length > 0) {
                nouveau.lastValeur = nouveau.mesures[0].valeur;
              }
            },
            complete: () => {
              this.articlesMesures.unshift(nouveau);
            },
            error: (err) => {
              console.error('Erreur chargement mesures :', err);
              this.articlesMesures.unshift(nouveau);
            },
          });

        this.numOF = '';
      },
      error: () => {
        this.errorMessage = `❌ Article avec OF ${of} non trouvé.`;
        this.numOF = '';
      },
    });
  }

  get currentOFEntry(): ArticleMesure | null {
    return (
      this.articlesMesures.find((e) => e.article?.Num_OF === this.currentOF) ||
      null
    );
  }
}
