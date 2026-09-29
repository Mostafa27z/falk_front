import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-container animate-fade-in-up">
        <div class="auth-card card-glass">
          <div class="auth-header">
            <span class="auth-logo">🔑</span>
            <h1>نسيت كلمة المرور</h1>
            <p>أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين</p>
          </div>

          @if (sent()) {
            <div class="auth-success">
              ✅ تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني
            </div>
          }

          @if (error()) {
            <div class="auth-error">{{ error() }}</div>
          }

          @if (!sent()) {
            <form (ngSubmit)="onSubmit()" class="auth-form">
              <div class="form-group">
                <label class="form-label">البريد الإلكتروني</label>
                <input type="email" class="form-input" placeholder="example@email.com"
                  [(ngModel)]="email" name="email" required dir="ltr">
              </div>
              <button type="submit" class="btn btn-primary btn-lg full-width" [disabled]="loading()">
                {{ loading() ? 'جاري الإرسال...' : 'إرسال الرابط ←' }}
              </button>
            </form>
          }

          <p class="auth-switch">
            <a routerLink="/login">← العودة لتسجيل الدخول</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import '../login/login.component.css';
    .auth-success {
      background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a;
      padding: var(--space-4); border-radius: var(--radius-xl);
      font-size: var(--font-size-sm); font-weight: 600;
      margin-bottom: var(--space-5); text-align: center;
    }
  `]
})
export class ForgotPasswordComponent {
  private api = inject(ApiService);
  email = '';
  loading = signal(false);
  error = signal('');
  sent = signal(false);

  onSubmit() {
    if (!this.email) { this.error.set('يرجى إدخال البريد الإلكتروني'); return; }
    this.loading.set(true);
    this.error.set('');
    this.api.forgotPassword(this.email).subscribe({
      next: () => { this.loading.set(false); this.sent.set(true); },
      error: () => { this.loading.set(false); this.sent.set(true); } // Always show success for security
    });
  }
}
