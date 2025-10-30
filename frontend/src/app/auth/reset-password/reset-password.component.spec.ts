import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { ResetPasswordComponent } from './reset-password.component';
import { PasswordService } from '../../services/password.service';

class PasswordServiceStub {
  requestReset(_email: string) { return of({}); }
  resetPassword(_token: string, _newPassword: string) { return of({}); }
}

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResetPasswordComponent],
      imports: [FormsModule, RouterTestingModule],
      providers: [
        { provide: PasswordService, useClass: PasswordServiceStub },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'TEST_TOKEN' } } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reject mismatched passwords', () => {
    component.password = 'a';
    component.confirm = 'b';
    component.submit();
    expect(component.error).toBeTruthy();
  });
});
