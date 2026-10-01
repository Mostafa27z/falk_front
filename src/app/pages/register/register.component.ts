import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { extractErrorMessage } from '../../core/error-utils';
import { IconComponent } from '../../shared/icon/icon.component';
import { DialogService } from '../../shared/dialog/dialog.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule, IconComponent],
  template: `
    <div class="auth-page">
      <div class="auth-container animate-fade-in-up">
        <div class="auth-card card-glass">
          <div class="auth-header">
            <img src="/logo.jpeg" alt="فالك التوفيق" class="auth-brand-logo" />
            <h1>تسجيل حساب جديد</h1>
            <p>انضم لآلاف الطلاب وابدأ رحلتك التعليمية</p>
          </div>

          @if (success()) {
            <div class="auth-success" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
              <app-icon name="check-circle" [size]="20" />
              <span>تم إنشاء حسابك بنجاح! تحقق من بريدك الإلكتروني لتأكيد الحساب.</span>
            </div>
          }

          @if (error()) {
            <div class="auth-error">{{ error() }}</div>
          }

          @if (!success()) {
            <form (ngSubmit)="onSubmit()" class="auth-form">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">الاسم الأول</label>
                  <input type="text" class="form-input" placeholder="محمد"
                    [(ngModel)]="firstName" name="firstName" required>
                </div>
                <div class="form-group">
                  <label class="form-label">الاسم الأخير</label>
                  <input type="text" class="form-input" placeholder="أحمد"
                    [(ngModel)]="lastName" name="lastName" required>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">البريد الإلكتروني</label>
                <input type="email" class="form-input" placeholder="example@email.com"
                  [(ngModel)]="email" name="email" required dir="ltr">
              </div>

              <div class="form-group">
                <label class="form-label">رقم الجوال</label>
                <input type="tel" class="form-input" placeholder="05xxxxxxxx"
                  [(ngModel)]="phone" name="phone" required dir="ltr">
              </div>

              <div class="form-group">
                <label class="form-label">كلمة المرور</label>
                <input type="password" class="form-input" placeholder="••••••••"
                  [(ngModel)]="password" name="password" required dir="ltr">
                <small style="color:var(--gray-500); font-size: 0.75rem; margin-top: 4px; display: block">
                  يجب أن تحتوي على 6 أحرف على الأقل، حرف كبير، رقم، ورمز خاص.
                </small>
              </div>

              <button type="submit" class="btn btn-primary btn-lg full-width" [disabled]="loading()">
                <span>{{ loading() ? 'جاري التسجيل...' : 'إنشاء حساب جديد' }}</span>
                @if (!loading()) {
                  <app-icon name="arrow-left" [size]="16" />
                }
              </button>
            </form>
          }

          <p class="auth-switch">
            لديك حساب بالفعل؟
            <a routerLink="/login">سجّل الدخول</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import '../login/login.component.css';

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }

    .auth-success {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #16a34a;
      padding: var(--space-4);
      border-radius: var(--radius-xl);
      font-size: var(--font-size-sm);
      font-weight: 600;
      margin-bottom: var(--space-5);
      text-align: center;
      line-height: 1.7;
    }

    @media (max-width: 480px) {
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(DialogService);

  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  password = '';
  loading = signal(false);
  error = signal('');
  success = signal(false);

  onSubmit() {
    if (!this.firstName || !this.lastName || !this.email || !this.phone || !this.password) {
      this.dialog.warning('يرجى ملء جميع الحقول المطلوبة لإنشاء الحساب');
      return;
    }
    this.loading.set(true);
    this.error.set('');

    this.auth.register({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phoneNumber: this.phone,
      password: this.password
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        this.dialog.alert({
          title: 'تم إنشاء حسابك بنجاح!',
          message: 'أهلاً بك في منصة فالك التوفيق!\nتم إنشاء حسابك بنجاح، يمكنك الآن تسجيل الدخول والبدء.',
          type: 'success',
          okText: 'الانتقال لتسجيل الدخول'
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        this.loading.set(false);
        const errMessage = extractErrorMessage(err);
        this.error.set(errMessage);
        this.dialog.error(errMessage, 'تعذر التسجيل');
      }
    });
  }
}
