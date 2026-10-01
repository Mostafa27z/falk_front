import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { PaymentStatusResponse } from '../../core/models';
import { IconComponent } from '../../shared/icon/icon.component';
import { DialogService } from '../../shared/dialog/dialog.service';

@Component({
  selector: 'app-payment-status',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <div class="status-page">
      <div class="container">
        <div class="status-card card-glass animate-scale-in">
          @if (loading()) {
            <div class="state-container">
              <div class="spinner"></div>
              <h2>جاري التحقق من عملية الدفع...</h2>
              <p>يرجى الانتظار لحظات ريثما نتأكد من حالة السداد</p>
            </div>
          } @else if (status() === 'Succeeded') {
            <div class="state-container success">
              <div class="icon-circle success-icon">
                <app-icon name="check-circle" [size]="44" />
              </div>
              <h2>تمت عملية الدفع بنجاح!</h2>
              <p>تهانينا! تم اشتراكك في الدورة بنجاح. يمكنك الآن بدء رحلتك التعليمية.</p>
              <div class="actions">
                <a routerLink="/courses" class="btn btn-primary btn-lg">
                  <span>تصفح دوراتي</span>
                  <app-icon name="arrow-left" [size]="16" />
                </a>
                <a routerLink="/" class="btn btn-outline btn-lg">العودة للرئيسية</a>
              </div>
            </div>
          } @else if (status() === 'Pending') {
            <div class="state-container pending">
              <div class="icon-circle pending-icon">
                <app-icon name="clock" [size]="44" />
              </div>
              <h2>عملية الدفع معلقة</h2>
              <p>ما زالت عملية الدفع قيد المعالجة من قبل مزود الخدمة. سنواصل التحديث تلقائياً...</p>
              <div class="actions">
                <button class="btn btn-primary" (click)="checkStatus()">إعادة الفحص الآن</button>
                <button class="btn btn-outline" (click)="cancel()">إلغاء المعاملة</button>
              </div>
            </div>
          } @else if (status() === 'Cancelled') {
            <div class="state-container cancelled">
              <div class="icon-circle cancelled-icon">
                <app-icon name="x" [size]="44" />
              </div>
              <h2>تم إلغاء عملية الدفع</h2>
              <p>لقد قمت بإلغاء العملية. يمكنك العودة إلى السلة والمحاولة في أي وقت.</p>
              <div class="actions">
                <a routerLink="/cart" class="btn btn-primary btn-lg">العودة إلى السلة</a>
                <a routerLink="/courses" class="btn btn-outline btn-lg">تصفح الدورات</a>
              </div>
            </div>
          } @else {
            <div class="state-container failed">
              <div class="icon-circle failed-icon">
                <app-icon name="alert-circle" [size]="44" />
              </div>
              <h2>فشلت عملية الدفع</h2>
              <p>{{ errorMessage() || 'تعذر إتمام الدفع. يرجى التأكد من بيانات بطاقتك والمحاولة مجدداً.' }}</p>
              <div class="actions">
                <a routerLink="/cart" class="btn btn-primary btn-lg">المحاولة مرة أخرى</a>
                <a routerLink="/" class="btn btn-outline btn-lg">الرئيسية</a>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .status-page {
      min-height: calc(100vh - var(--navbar-height) - 200px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-12) 0;
    }

    .status-card {
      max-width: 580px;
      margin: 0 auto;
      padding: var(--space-10) var(--space-8);
      text-align: center;
      border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-xl);
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(139, 92, 246, 0.15);
    }

    .state-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-4);
    }

    .spinner {
      width: 56px;
      height: 56px;
      border: 4px solid var(--primary-100);
      border-top-color: var(--primary-600);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: var(--space-2);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .icon-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--space-2);
    }

    .success-icon {
      background: #ecfdf5;
      color: var(--success);
      border: 3px solid #a7f3d0;
      box-shadow: 0 0 24px rgba(16, 185, 129, 0.25);
    }

    .pending-icon {
      background: #fffbeb;
      color: #d97706;
      border: 3px solid #fde68a;
      box-shadow: 0 0 24px rgba(217, 119, 6, 0.2);
    }

    .cancelled-icon, .failed-icon {
      background: #fef2f2;
      color: var(--error);
      border: 3px solid #fecaca;
      box-shadow: 0 0 24px rgba(239, 68, 68, 0.2);
    }

    h2 {
      font-size: var(--font-size-2xl);
      font-weight: 800;
      color: var(--gray-900);
    }

    p {
      color: var(--gray-600);
      font-size: var(--font-size-base);
      line-height: 1.6;
      max-width: 440px;
    }

    .actions {
      display: flex;
      gap: var(--space-3);
      margin-top: var(--space-6);
      flex-wrap: wrap;
      justify-content: center;
    }

    @media (max-width: 480px) {
      .status-page { padding: var(--space-6) 0; }
      .status-card {
        padding: var(--space-6) var(--space-4);
        margin: 0 var(--space-3);
      }
      .actions {
        flex-direction: column;
        width: 100%;
      }
      .actions .btn {
        width: 100%;
        justify-content: center;
      }
      h2 { font-size: var(--font-size-xl); }
      p { font-size: var(--font-size-sm); }
    }
  `]
})
export class PaymentStatusComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private dialog = inject(DialogService);

  paymentId = signal<string>('');
  status = signal<string>('Pending');
  loading = signal<boolean>(true);
  errorMessage = signal<string>('');
  private pollInterval: any;
  private pollCount = 0;

  ngOnInit() {
    // Check both param and queryParam
    const routeId = this.route.snapshot.paramMap.get('id');
    const queryId = this.route.snapshot.queryParamMap.get('paymentAttemptId') ||
                    this.route.snapshot.queryParamMap.get('id');

    const id = routeId || queryId;
    if (id) {
      this.paymentId.set(id);
      this.checkStatus();
      this.startPolling();
    } else {
      this.loading.set(false);
      this.status.set('Failed');
      this.errorMessage.set('لم يتم العثور على رقم معاملة الدفع');
    }
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  checkStatus() {
    const id = this.paymentId();
    if (!id) return;

    this.api.getPaymentStatus(id).subscribe({
      next: (res: PaymentStatusResponse) => {
        this.status.set(res.status);
        this.loading.set(false);
        if (res.status === 'Succeeded' || res.status === 'Failed' || res.status === 'Cancelled') {
          this.stopPolling();
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.status.set('Failed');
        this.errorMessage.set(err.error?.detail || 'تعذر التحقق من حالة الدفع');
        this.stopPolling();
      }
    });
  }

  async cancel() {
    const ok = await this.dialog.confirm({
      title: 'إلغاء المعاملة',
      message: 'هل أنت متأكد من رغبتك في إلغاء عملية الدفع؟ يمكنك العودة إلى السلة وإعادة المحاولة في أي وقت.',
      type: 'warning',
      confirmText: 'نعم، إلغاء المعاملة',
      cancelText: 'تراجع'
    });
    if (!ok) return;

    this.api.cancelPayment().subscribe({
      next: () => {
        this.status.set('Cancelled');
        this.stopPolling();
      }
    });
  }

  private startPolling() {
    this.pollCount = 0;
    this.pollInterval = setInterval(() => {
      this.pollCount++;
      if (this.pollCount > 10) {
        this.stopPolling();
        return;
      }
      this.checkStatus();
    }, 4000);
  }

  private stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
}
