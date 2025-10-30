import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessureComponent } from './messure.component';

describe('MessureComponent', () => {
  let component: MessureComponent;
  let fixture: ComponentFixture<MessureComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MessureComponent]
    });
    fixture = TestBed.createComponent(MessureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
