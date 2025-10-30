import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ArticleService } from '../../services/article.service';

@Component({
  selector: 'app-details-article',
  templateUrl: './details-article.component.html',
  styleUrls: ['./details-article.component.css'],
})
export class DetailsArticleComponent implements OnInit {
  numOF!: string;
  mesures: any[] = [];
  articleInfo: any = {};

  constructor(
    private route: ActivatedRoute,
    private articleService: ArticleService
  ) {}

  ngOnInit(): void {
    this.numOF = this.route.snapshot.paramMap.get('numOF')!;
    this.loadMesures();
  }

  loadMesures(): void {
    this.articleService.getArticleWithMesure(this.numOF).subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.articleInfo = {
            Article: data[0].Article,
            Num_OF: data[0].Num_OF,
            Quantite_Prevue: data[0].Quantite_Prevue,
          };
          this.mesures = data;
        }
      },
      error: (err) => {
        console.error('Erreur chargement mesures:', err);
        alert('Impossible de charger les mesures');
      },
    });
  }
}
