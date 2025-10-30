import { Component, OnDestroy, OnInit, Inject } from '@angular/core';
import { PredictionPoint } from '../../services/prediction.service';
import { ModelResultsService } from '../../services/model-results.service';
import { Subscription, interval, switchMap } from 'rxjs';

@Component({
  selector: 'app-model-results',
  templateUrl: './model-results.component.html',
  styleUrls: ['./model-results.component.css']
})
export class ModelResultsComponent implements OnInit, OnDestroy {
  start = '';
  end = '';
  loading = false;
  error: string | null = null;
  data: PredictionPoint[] = [];
  sub?: Subscription;

  constructor(@Inject(ModelResultsService) private modelResults: ModelResultsService) {}

  ngOnInit(): void {
    // default fixed window used in report
    this.start = '25/07/2025';
    this.end = '12/08/2025';
    this.fetch();
    // Optional light polling to keep page fresh
    this.sub = interval(10000)
      .pipe(switchMap(() => this.modelResults.getPredictions(this.start, this.end)))
      .subscribe({
        next: (rows: PredictionPoint[]) => {
          this.data = rows.slice().reverse();
        },
        error: (_err: any) => {
          // silent on background refresh
        }
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  fetch() {
    this.loading = true;
    this.error = null;
    this.modelResults.getPredictions(this.start, this.end).subscribe({
      next: (rows: PredictionPoint[]) => {
        this.data = rows.slice().reverse();
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Erreur lors du chargement des résultats';
        this.loading = false;
        // eslint-disable-next-line no-console
        console.error(err);
      }
    });
  }

  formatProba(p: any): string {
    if (p === null || p === undefined) return '';
    if (typeof p === 'number') return p.toFixed(2);
    if (Array.isArray(p)) return '[' + p.map((x: any) => (typeof x === 'number' ? x.toFixed(2) : String(x))).join(', ') + ']';
    return JSON.stringify(p);
  }

  useSample() {
    // Static realistic sample results for demo/report
    const now = Date.now();
    const mkTs = (minAgo: number) => new Date(now - minAgo * 60 * 1000).toISOString();
    const sample: PredictionPoint[] = [
      { num_of: 'P0-02104-09-000', value: 26.5, prediction: 0 as any, proba: 0.33 as any, timestamp: mkTs(0) },
      { num_of: 'P0-02104-09-000', value: 29.6, prediction: 0 as any, proba: 0.48 as any, timestamp: mkTs(2) },
      { num_of: 'P0-02104-09-000', value: 23.7, prediction: 0 as any, proba: 0.12 as any, timestamp: mkTs(4) },
      { num_of: 'P0-02104-09-000', value: 31.6, prediction: 0 as any, proba: 0.58 as any, timestamp: mkTs(6) },
      { num_of: 'P0-02104-09-000', value: 26.5, prediction: 1 as any, proba: 0.69 as any, timestamp: mkTs(8) },
      { num_of: 'P0-02104-09-000', value: 27.4, prediction: 1 as any, proba: 0.72 as any, timestamp: mkTs(10) },
      { num_of: 'P0-02104-09-000', value: 32.9, prediction: 1 as any, proba: 0.84 as any, timestamp: mkTs(12) },
      { num_of: 'P0-02104-09-000', value: 27.8, prediction: 0 as any, proba: 0.39 as any, timestamp: mkTs(14) },
      { num_of: 'P0-02104-09-000', value: 30.7, prediction: 0 as any, proba: 0.54 as any, timestamp: mkTs(16) },
      { num_of: 'P0-02104-09-000', value: 25.3, prediction: 0 as any, proba: 0.28 as any, timestamp: mkTs(18) },
      { num_of: 'P0-02104-09-000', value: 34.9, prediction: 1 as any, proba: 0.86 as any, timestamp: mkTs(20) },
      { num_of: 'P0-02104-09-000', value: 33.2, prediction: 1 as any, proba: 0.81 as any, timestamp: mkTs(22) },
    ];
    this.error = null;
    this.loading = false;
    // Most recent first
    this.data = sample;
  }
}
