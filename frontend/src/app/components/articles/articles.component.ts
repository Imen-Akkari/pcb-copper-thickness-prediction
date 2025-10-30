import { Component, OnInit } from '@angular/core';
import { ArticleService } from '../../services/article.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Router } from '@angular/router';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css'],
})
export class ArticlesComponent implements OnInit {
  articles: any[] = [];
  searchText = '';

  constructor(private articleService: ArticleService, private router: Router) {}

  ngOnInit(): void {
    this.articleService.getArticles().subscribe({
      next: (data) => {
        this.articles = data;
        console.log('Articles reçus depuis l’API :', this.articles);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des articles :', err);
        alert('Erreur lors du chargement des articles.');
      },
    });
  }

  // 🔍 Filtrage par Article OU Num_OF
  get filteredArticles(): any[] {
    if (!this.searchText.trim()) {
      return this.articles;
    }
    const lowerSearch = this.searchText.toLowerCase();
    return this.articles.filter(
      (article) =>
        article.Article?.toLowerCase().includes(lowerSearch) ||
        article.Num_OF?.toLowerCase().includes(lowerSearch)
    );
  }

  // 📦 Export Excel
  exportToExcel(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.filteredArticles);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Articles');
    const excelBuffer: any = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
    });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'articles.xlsx');
  }

  // 📊 Afficher détails
  showDetails(article: any): void {
    this.router.navigate(['/details', article.Num_OF]);
  }

  // 📡 Si scan d’un Num_OF → ouvre directement la page si un seul résultat
  onScanComplete(): void {
    if (this.filteredArticles.length === 1) {
      this.showDetails(this.filteredArticles[0]);
    }
  }
}
