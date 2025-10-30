import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { StaticsComponent } from './statics.component';
import { PredictionService } from '../../services/prediction.service';

class PredictionServiceMock {
  getPredictions() { return of([]); }
}

describe('StaticsComponent', () => {
  let component: StaticsComponent;
  let fixture: ComponentFixture<StaticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StaticsComponent],
      providers: [{ provide: PredictionService, useClass: PredictionServiceMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(StaticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
