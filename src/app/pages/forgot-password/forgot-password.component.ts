import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { IconComponent } from '../../shared/icon/icon.component';
import { DialogService } from '../../shared/dialog/dialog.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink, IconComponent],
  template: `
    <div class="auth-page">
      <div class="auth-container animate-fade-in-up">
        <div class="auth-card card-glass">
          <div class="auth-header">
            <img src="/logo.jpeg" alt="فالك التوفيق" class="auth-brand-logo" />
            <h1>نسيت كلمة المرور</h1>
            <p>أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين</p>
          </div>

          <form (ngSubmit)="onSubmit()" class="auth-form">
            <div class="form-group">
              <label class="form-label">البريد الإلكتروني</label>
              <input type="email" class="form-input" placeholder="example@email.com"
                [(ngModel)]="email" name="email" required dir="ltr">
            </div>
            <button type="submit" class="btn btn-primary btn-lg full-width" [disabled]="loading()">
              <span>{{ loading() ? 'جاري الإرسال...' : 'إرسال رابط التعيين' }}</span>
              @if (!loading()) {
                <app-icon name="arrow-left" [size]="16" />
              }
            </button>
          </form>

          <p class="auth-switch">
            <a routerLink="/login" style="display: inline-flex; align-items: center; gap: 6px;">
              <app-icon name="arrow-right" [size]="14" />
              <span>العودة لتسجيل الدخول</span>
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import '../login/login.component.css';
  `]
})
export class ForgotPasswordComponent {
  private api = inject(ApiService);
  private router = inject(Router);
  private dialog = inject(DialogService);

  email = '';
  loading = signal(false);

  onSubmit() {
    if (!this.email) {
      this.dialog.warning('يرجى إدخال البريد الإلكتروني لمتابعة إعادة التعيين');
      return;
    }
    this.loading.set(true);
    this.api.forgotPassword(this.email).subscribe({
      next: () => {
        this.loading.set(false);
        this.dialog.alert({
          title: 'تم إرسال الرابط',
          message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح.\nيرجى مراجعة صندوق الوارد الخاص بك.',
          type: 'success',
          okText: 'العودة لتسجيل الدخول'
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: () => {
        this.loading.set(false);
        this.dialog.alert({
          title: 'تم إرسال الرابط',
          message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح.\nيرجى مراجعة صندوق الوارد الخاص بك.',
          type: 'success',
          okText: 'العودة لتسجيل الدخول'
        }).then(() => {
          this.router.navigate(['/login']);
        });
      }
    });
  }
}
