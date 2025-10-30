import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanArticleComponent } from './scan-article.component';

describe('ScanArticleComponent', () => {
  let component: ScanArticleComponent;
  let fixture: ComponentFixture<ScanArticleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ScanArticleComponent]
    });
    fixture = TestBed.createComponent(ScanArticleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
