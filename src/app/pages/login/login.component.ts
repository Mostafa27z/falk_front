import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { UserRole } from '../../core/models';
import { extractErrorMessage } from '../../core/error-utils';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="auth-page">
      <div class="auth-container animate-fade-in-up">
        <div class="auth-card card-glass">
          <div class="auth-header">
            <span class="auth-logo">🎓</span>
            <h1>تسجيل الدخول</h1>
            <p>مرحباً بعودتك! حدد نوع حسابك وتابع رحلتك</p>
          </div>

          <!-- Role Selector Tabs -->
          <div class="role-selector">
            <button
              type="button"
              class="role-tab"
              [class.active]="selectedRole === 'student'"
              (click)="selectedRole = 'student'">
              🎓 حساب طالب
            </button>
            <button
              type="button"
              class="role-tab"
              [class.active]="selectedRole === 'admin'"
              (click)="selectedRole = 'admin'">
              👑 مدير النظام
            </button>
            <button
              type="button"
              class="role-tab"
              [class.active]="selectedRole === 'instructor'"
              (click)="selectedRole = 'instructor'">
              👨‍🏫 محاضر
            </button>
          </div>

          @if (error()) {
            <div class="auth-error">{{ error() }}</div>
          }

          <form (ngSubmit)="onSubmit()" class="auth-form">
            <div class="form-group">
              <label class="form-label">البريد الإلكتروني</label>
              <input type="email" class="form-input" placeholder="example@email.com"
                [(ngModel)]="email" name="email" required dir="ltr">
            </div>

            <div class="form-group">
              <label class="form-label">كلمة المرور</label>
              <input type="password" class="form-input" placeholder="••••••••"
                [(ngModel)]="password" name="password" required dir="ltr">
            </div>

            <a routerLink="/forgot-password" class="forgot-link">نسيت كلمة المرور؟</a>

            <button type="submit" class="btn btn-primary btn-lg full-width" [disabled]="loading()">
              {{ loading() ? 'جاري التحقق والدخول...' : 'تسجيل الدخول ←' }}
            </button>
          </form>

          <p class="auth-switch">
            ليس لديك حساب؟
            <a routerLink="/register">سجّل الآن</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private auth = inject(AuthService);

  email = '';
  password = '';
  selectedRole: UserRole = 'student';
  loading = signal(false);
  error = signal('');

  onSubmit() {
    if (!this.email || !this.password) {
      this.error.set('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }
    this.loading.set(true);
    this.error.set('');

    this.auth.login(this.email, this.password, this.selectedRole).subscribe({
      error: (err) => {
        this.loading.set(false);
        this.error.set(extractErrorMessage(err));
      }
    });
  }
}
