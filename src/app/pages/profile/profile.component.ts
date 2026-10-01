import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Student } from '../../core/models';
import { DialogService } from '../../shared/dialog/dialog.service';

import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `
    <div class="profile-page">
      <div class="container">
        <div class="profile-header animate-fade-in-up">
          <div class="profile-avatar">
            <span>{{ getInitials() }}</span>
          </div>
          <h1>{{ student()?.displayName || 'الملف الشخصي' }}</h1>
          <p>{{ student()?.email }}</p>
        </div>

        @if (student()) {
          <div class="profile-card card animate-fade-in-up">
            <h2>معلومات الحساب</h2>

            <form (ngSubmit)="onSave()" class="profile-form">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">الاسم الأول</label>
                  <input type="text" class="form-input" [(ngModel)]="firstName" name="firstName">
                </div>
                <div class="form-group">
                  <label class="form-label">الاسم الأخير</label>
                  <input type="text" class="form-input" [(ngModel)]="lastName" name="lastName">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">البريد الإلكتروني</label>
                <input type="email" class="form-input" [value]="student()?.email" disabled dir="ltr">
              </div>

              <div class="form-group">
                <label class="form-label">رقم الجوال</label>
                <input type="tel" class="form-input" [value]="student()?.phoneNumber" disabled dir="ltr">
              </div>

              <button type="submit" class="btn btn-primary btn-save" [disabled]="saving()">
                <app-icon name="check" [size]="16" />
                <span>{{ saving() ? 'جاري الحفظ...' : 'حفظ التغييرات' }}</span>
              </button>
            </form>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .profile-page { padding: var(--space-12) 0 var(--space-20); }

    .profile-header {
      text-align: center;
      margin-bottom: var(--space-10);
    }
    .profile-avatar {
      width: 100px; height: 100px; border-radius: var(--radius-full);
      background: var(--accent-gradient);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto var(--space-4);
      font-size: var(--font-size-3xl); font-weight: 900; color: white;
    }
    .profile-header h1 {
      font-size: var(--font-size-2xl); font-weight: 900; color: var(--gray-900);
      margin-bottom: var(--space-2);
    }
    .profile-header p { color: var(--gray-500); font-size: var(--font-size-sm); }

    .profile-card {
      max-width: 600px; margin: 0 auto;
      padding: var(--space-8);
      border-radius: var(--radius-2xl);
    }
    .profile-card h2 {
      font-size: var(--font-size-xl); font-weight: 800; color: var(--gray-900);
      margin-bottom: var(--space-6);
      padding-bottom: var(--space-4);
      border-bottom: 1px solid var(--gray-100);
    }

    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }

    .form-input:disabled {
      background: var(--gray-50); color: var(--gray-400); cursor: not-allowed;
    }

    .btn-save {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-6);
    }

    @media (max-width: 640px) {
      .profile-page { padding: var(--space-6) 0 var(--space-12); }
      .profile-card { padding: var(--space-5); }
      .btn-save { width: 100%; }
    }
    @media (max-width: 480px) {
      .form-row { grid-template-columns: 1fr; }
      .profile-avatar { width: 80px; height: 80px; font-size: var(--font-size-2xl); }
    }
  `]
})
export class ProfileComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private dialog = inject(DialogService);

  student = signal<Student | null>(null);
  firstName = '';
  lastName = '';
  saving = signal(false);

  ngOnInit() {
    this.api.getStudent().subscribe({
      next: (s) => {
        this.student.set(s);
        this.firstName = s.firstName;
        this.lastName = s.lastName;
      }
    });
  }

  getInitials(): string {
    const s = this.student();
    if (!s) return 'م';
    return (s.firstName[0] || '') + (s.lastName[0] || '');
  }

  onSave() {
    this.saving.set(true);
    this.api.updateStudent({ firstName: this.firstName, lastName: this.lastName }).subscribe({
      next: () => {
        this.saving.set(false);
        this.dialog.success('تم حفظ وتحديث بيانات حسابك بنجاح!');
      },
      error: () => {
        this.saving.set(false);
        this.dialog.error('حدث خطأ أثناء حفظ التغييرات، يرجى المحاولة لاحقاً.');
      }
    });
  }
}
