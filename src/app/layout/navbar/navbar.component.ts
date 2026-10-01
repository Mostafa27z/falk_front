import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { IconComponent } from '../../shared/icon/icon.component';
import { DialogService } from '../../shared/dialog/dialog.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconComponent],
  template: `
    <nav class="navbar" [class.scrolled]="scrolled()">
      <div class="container nav-content">
        <a routerLink="/" class="logo" title="فالك التوفيق">
          <img src="/logo.jpeg" alt="فالك التوفيق" class="brand-logo-img" />
        </a>

        <ul class="nav-links" [class.open]="menuOpen()">
          <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">الرئيسية</a></li>
          <li><a routerLink="/courses" routerLinkActive="active">الدورات</a></li>
          @if (auth.isAdmin() || auth.isInstructor()) {
            <li><a routerLink="/admin" routerLinkActive="active">لوحة الإدارة</a></li>
          }
        </ul>

        <div class="nav-actions">
          @if (auth.isLoggedIn()) {
            @if (auth.isAdmin()) {
              <a routerLink="/admin" class="btn btn-primary btn-sm action-btn" title="لوحة الإدارة" aria-label="لوحة الإدارة">
                <app-icon name="dashboard" [size]="16" />
                <span class="btn-text">لوحة الإدارة</span>
              </a>
              <span class="role-badge admin">
                <app-icon name="shield-check" [size]="14" />
                <span>أدمن</span>
              </span>
            } @else if (auth.isInstructor()) {
              <a routerLink="/admin" class="btn btn-primary btn-sm action-btn" title="لوحة التحكم" aria-label="لوحة التحكم">
                <app-icon name="dashboard" [size]="16" />
                <span class="btn-text">لوحة التحكم</span>
              </a>
              <span class="role-badge instructor">
                <app-icon name="graduation-cap" [size]="14" />
                <span>محاضر</span>
              </span>
            } @else {
              <a routerLink="/cart" class="cart-btn" title="السلة" aria-label="السلة">
                <app-icon name="shopping-cart" [size]="20" />
              </a>
              <a routerLink="/profile" class="btn btn-outline btn-sm action-btn" title="حسابي" aria-label="حسابي">
                <app-icon name="user" [size]="16" />
                <span class="btn-text">حسابي</span>
              </a>
            }
            <button class="btn btn-sm logout-btn" (click)="onLogout()" title="تسجيل الخروج" aria-label="تسجيل الخروج">
              <app-icon name="log-out" [size]="16" />
              <span class="btn-text">خروج</span>
            </button>
          } @else {
            <a routerLink="/login" class="btn btn-outline btn-sm action-btn" title="تسجيل الدخول" aria-label="تسجيل الدخول">
              <app-icon name="log-in" [size]="16" />
              <span class="btn-text">دخول</span>
            </a>
            <a routerLink="/register" class="btn btn-primary btn-sm action-btn" title="تسجيل جديد" aria-label="تسجيل جديد">
              <app-icon name="user-plus" [size]="16" />
              <span class="btn-text">تسجيل</span>
            </a>
          }
        </div>

        <button class="hamburger" (click)="menuOpen.set(!menuOpen())" aria-label="القائمة">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      height: var(--navbar-height);
      display: flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.88);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid transparent;
      transition: all var(--transition-base);
    }
    .navbar.scrolled {
      border-bottom-color: rgba(139, 92, 246, 0.12);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }
    .nav-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
      width: 100%;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      flex-shrink: 0;
    }
    .brand-logo-img {
      height: 44px;
      width: auto;
      max-width: 130px;
      object-fit: contain;
      border-radius: var(--radius-md);
      transition: transform 0.2s ease;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      flex: 1;
      justify-content: center;
    }
    .nav-links a {
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-lg);
      font-weight: 600;
      font-size: var(--font-size-sm);
      color: var(--gray-600);
      transition: all var(--transition-fast);
    }
    .nav-links a:hover,
    .nav-links a.active {
      color: var(--primary-700);
      background: var(--primary-50);
    }
    .nav-actions {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-shrink: 0;
    }
    .role-badge {
      font-size: var(--font-size-xs);
      font-weight: 800;
      padding: 5px 10px;
      border-radius: var(--radius-full);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
    }
    .role-badge.admin {
      background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
      color: #be185d;
      border: 1px solid #fbcfe8;
    }
    .role-badge.instructor {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
    }
    .cart-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border-radius: var(--radius-full);
      color: var(--gray-600);
      background: var(--gray-50);
      border: 1px solid var(--gray-200);
      transition: all var(--transition-fast);
      flex-shrink: 0;
    }
    .cart-btn:hover {
      background: var(--primary-50);
      color: var(--primary-600);
      border-color: var(--primary-200);
    }
    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
      height: 38px;
      padding: 0 14px;
      border-radius: var(--radius-full);
    }
    .logout-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 38px;
      padding: 0 12px;
      color: var(--gray-600);
      background: var(--gray-100);
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-full);
      transition: all var(--transition-fast);
      white-space: nowrap;
      flex-shrink: 0;
    }
    .logout-btn:hover {
      background: #fef2f2;
      color: var(--error);
      border-color: #fecaca;
    }
    .hamburger {
      display: none;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 5px;
      width: 38px;
      height: 38px;
      padding: 0;
      border-radius: var(--radius-md);
      background: var(--gray-50);
      border: 1px solid var(--gray-200);
      cursor: pointer;
      flex-shrink: 0;
    }
    .hamburger span {
      width: 20px;
      height: 2px;
      background: var(--gray-700);
      border-radius: 2px;
      transition: all var(--transition-fast);
    }

    @media (max-width: 900px) {
      .nav-links {
        display: none;
        position: absolute;
        top: var(--navbar-height);
        right: 0;
        left: 0;
        background: white;
        flex-direction: column;
        padding: var(--space-4);
        border-bottom: 1px solid var(--gray-200);
        box-shadow: var(--shadow-lg);
      }
      .nav-links.open { display: flex; }
      .hamburger { display: flex; }
    }

    @media (max-width: 640px) {
      .brand-logo-img {
        height: 36px;
        max-width: 100px;
      }
      .btn-text {
        display: none;
      }
      .action-btn {
        width: 36px;
        height: 36px;
        padding: 0;
        justify-content: center;
        border-radius: var(--radius-full);
      }
      .logout-btn {
        width: 36px;
        height: 36px;
        padding: 0;
        justify-content: center;
        border-radius: var(--radius-full);
      }
      .role-badge {
        display: none;
      }
      .cart-btn {
        width: 36px;
        height: 36px;
      }
      .nav-actions {
        gap: 6px;
      }
    }
  `]
})
export class NavbarComponent {
  auth = inject(AuthService);
  private dialog = inject(DialogService);
  scrolled = signal(false);
  menuOpen = signal(false);

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.scrolled.set(window.scrollY > 20);
      });
    }
  }

  async onLogout() {
    const ok = await this.dialog.confirm({
      title: 'تسجيل الخروج',
      message: 'هل أنت متأكد من رغبتك في تسجيل الخروج من حسابك؟',
      type: 'warning',
      confirmText: 'نعم، تسجيل الخروج',
      cancelText: 'إلغاء'
    });
    if (ok) {
      this.auth.logout().subscribe();
    }
  }
}
