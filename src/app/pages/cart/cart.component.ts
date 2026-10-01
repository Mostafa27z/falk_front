import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { CartItem } from '../../core/models';
import { IconComponent } from '../../shared/icon/icon.component';
import { DialogService } from '../../shared/dialog/dialog.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <div class="cart-page">
      <div class="container">
        <h1 class="page-title animate-fade-in-up">
          <app-icon name="shopping-cart" [size]="28" />
          <span>سلة التسوق</span>
        </h1>

        @if (loading()) {
          <div class="cart-skeleton">
            @for (i of [1,2,3]; track i) {
              <div class="skeleton" style="height: 100px; border-radius: 16px; margin-bottom: 16px"></div>
            }
          </div>
        } @else if (items().length === 0) {
          <div class="empty-state animate-fade-in-up">
            <div class="empty-icon-wrap">
              <app-icon name="shopping-cart" [size]="48" [strokeWidth]="1.5" />
            </div>
            <h3>سلتك فارغة</h3>
            <p>تصفح الدورات المتاحة وأضف ما يناسبك</p>
            <a routerLink="/courses" class="btn btn-primary btn-lg">
              <span>تصفح الدورات</span>
              <app-icon name="arrow-left" [size]="16" />
            </a>
          </div>
        } @else {
          <div class="cart-layout animate-fade-in-up">
            <div class="cart-items">
              @for (item of items(); track item.courseId) {
                <div class="cart-item card">
                  <div class="cart-item-img">
                    @if (item.picturePath) {
                      <img [src]="item.picturePath" [alt]="item.title">
                    } @else {
                      <div class="cart-item-placeholder">
                        <app-icon name="book-open" [size]="24" [strokeWidth]="1.5" />
                      </div>
                    }
                  </div>
                  <div class="cart-item-info">
                    <h3>{{ item.title }}</h3>
                    @if (item.isRenewal) {
                      <span class="badge badge-amber">تجديد</span>
                    }
                  </div>
                  <div class="cart-item-price">{{ item.price }} ر.س</div>
                  <button class="cart-remove" (click)="removeItem(item.courseId)" title="إزالة من السلة">
                    <app-icon name="trash" [size]="16" />
                  </button>
                </div>
              }
            </div>

            <div class="cart-summary card-glass">
              <h3>ملخص الطلب</h3>
              <div class="summary-row">
                <span>عدد الدورات</span>
                <span>{{ items().length }}</span>
              </div>
              <div class="summary-row total">
                <span>الإجمالي</span>
                <span class="total-price">{{ total() }} ر.س</span>
              </div>
              <button class="btn btn-primary btn-lg full-width" (click)="checkout()" [disabled]="paying()">
                <app-icon name="credit-card" [size]="18" />
                <span>{{ paying() ? 'جاري المعالجة...' : 'ادفع الآن' }}</span>
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .cart-page { padding: var(--space-12) 0 var(--space-20); }
    .page-title {
      font-size: var(--font-size-3xl); font-weight: 900;
      color: var(--gray-900); margin-bottom: var(--space-8);
      display: flex; align-items: center; gap: var(--space-3);
    }

    .empty-state {
      text-align: center; padding: var(--space-20) 0;
    }
    .empty-icon-wrap {
      width: 80px; height: 80px; border-radius: var(--radius-2xl);
      background: var(--primary-50); color: var(--primary-600);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto var(--space-4);
    }
    .empty-state h3 { font-weight: 700; color: var(--gray-700); margin-bottom: var(--space-2); }
    .empty-state p { color: var(--gray-500); margin-bottom: var(--space-6); }

    .cart-layout {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: var(--space-8);
      align-items: start;
    }

    .cart-items { display: flex; flex-direction: column; gap: var(--space-4); }

    .cart-item {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-4);
    }

    .cart-item-img { width: 100px; height: 70px; border-radius: var(--radius-lg); overflow: hidden; flex-shrink: 0; }
    .cart-item-img img { width: 100%; height: 100%; object-fit: cover; }
    .cart-item-placeholder {
      width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
      background: var(--primary-50);
    }

    .cart-item-info { flex: 1; }
    .cart-item-info h3 { font-size: var(--font-size-base); font-weight: 700; color: var(--gray-800); margin-bottom: var(--space-1); }

    .cart-item-price {
      font-weight: 800; color: var(--primary-700); font-size: var(--font-size-lg);
      white-space: nowrap; flex-shrink: 0;
    }

    .cart-remove {
      width: 36px; height: 36px; border-radius: var(--radius-full);
      display: flex; align-items: center; justify-content: center;
      color: var(--gray-400); transition: all var(--transition-fast); flex-shrink: 0;
    }
    .cart-remove:hover { background: #fef2f2; color: var(--error); }

    .cart-summary {
      padding: var(--space-6);
      border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-lg);
      position: sticky;
      top: calc(var(--navbar-height) + var(--space-4));
    }
    .cart-summary h3 {
      font-weight: 800; color: var(--gray-900);
      margin-bottom: var(--space-5);
      padding-bottom: var(--space-4);
      border-bottom: 1px solid var(--gray-200);
    }

    .summary-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: var(--space-3) 0;
      font-size: var(--font-size-sm); color: var(--gray-600);
    }
    .summary-row.total {
      border-top: 1px solid var(--gray-200);
      padding-top: var(--space-4); margin-top: var(--space-3); margin-bottom: var(--space-5);
      font-weight: 700; font-size: var(--font-size-base);
    }
    .total-price { font-size: var(--font-size-xl); color: var(--primary-700); font-weight: 900; }
    .full-width { width: 100%; }

    @media (max-width: 768px) {
      .cart-layout { grid-template-columns: 1fr; }
      .cart-summary { position: static; }
    }
    @media (max-width: 480px) {
      .cart-item {
        position: relative;
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-3);
      }
      .cart-item-img { width: 100%; height: 130px; }
      .cart-item-info { width: 100%; }
      .cart-remove {
        position: absolute;
        top: var(--space-4);
        left: var(--space-4);
        background: rgba(255, 255, 255, 0.95);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
      }
      .cart-item-price { margin-top: var(--space-1); }
      .page-title { font-size: var(--font-size-2xl); }
    }
  `]
})
export class CartComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private dialog = inject(DialogService);

  items = signal<CartItem[]>([]);
  loading = signal(true);
  paying = signal(false);

  total = computed(() => this.items().reduce((s, i) => s + i.price, 0));

  ngOnInit() {
    this.api.getCartItems().subscribe({
      next: (items) => { this.items.set(items); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  async removeItem(courseId: string) {
    const ok = await this.dialog.confirm({
      title: 'إزالة من السلة',
      message: 'هل أنت متأكد من رغبتك في إزالة هذه الدورة من سلة مشترياتك؟',
      type: 'danger',
      confirmText: 'نعم، إزالة',
      cancelText: 'تراجع'
    });
    if (!ok) return;

    this.api.removeCartItem(courseId).subscribe({
      next: () => {
        this.items.update(items => items.filter(i => i.courseId !== courseId));
        this.dialog.alert({
          title: 'تم التحديث',
          message: 'تم إزالة الدورة من السلة بنجاح.',
          type: 'info',
          okText: 'حسناً'
        });
      },
      error: () => this.dialog.error('حدث خطأ أثناء محاولة إزالة الدورة، يرجى المحاولة لاحقاً.')
    });
  }

  checkout() {
    this.paying.set(true);
    this.api.createPayment({
      gateway: 'Paymob',
      redirectionUrl: window.location.origin + '/payment-status'
    }).subscribe({
      next: (res) => {
        // Redirect to Paymob checkout
        window.location.href = res.paymentUrl;
      },
      error: (err) => {
        this.paying.set(false);
        this.dialog.error(err.error?.detail || 'حدث خطأ في بدء عملية الدفع، يرجى المحاولة لاحقاً.', 'فشل الدفع');
      }
    });
  }
}
