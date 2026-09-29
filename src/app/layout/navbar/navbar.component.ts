import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar" [class.scrolled]="scrolled()">
      <div class="container nav-content">
        <a routerLink="/" class="logo">
          <span class="logo-icon">🎓</span>
          <span class="logo-text">فالك <span class="gradient-text">التوفيق</span></span>
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
              <a routerLink="/admin" class="btn btn-primary btn-sm">📊 لوحة الإدارة</a>
              <span class="role-badge admin">👑 أدمن</span>
            } @else if (auth.isInstructor()) {
              <a routerLink="/admin" class="btn btn-primary btn-sm">📊 لوحة التحكم</a>
              <span class="role-badge instructor">👨‍🏫 محاضر</span>
            } @else {
              <a routerLink="/cart" class="cart-btn" title="السلة">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              </a>
              <a routerLink="/profile" class="btn btn-outline btn-sm">حسابي</a>
            }
            <button class="btn btn-sm logout-btn" (click)="onLogout()" title="تسجيل الخروج">خروج</button>
          } @else {
            <a routerLink="/login" class="btn btn-outline btn-sm">تسجيل الدخول</a>
            <a routerLink="/register" class="btn btn-primary btn-sm">تسجيل جديد</a>
          }
        </div>

        <button class="hamburger" (click)="menuOpen.set(!menuOpen())">
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
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid transparent;
      transition: all var(--transition-base);
    }
    .navbar.scrolled {
      border-bottom-color: rgba(139, 92, 246, 0.1);
      box-shadow: 0 2px 20px rgba(0,0,0,0.04);
    }
    .nav-content {
      display: flex;
      align-items: center;
      gap: var(--space-8);
    }
    .logo {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-xl);
      font-weight: 800;
      color: var(--gray-900);
      flex-shrink: 0;
    }
    .logo-icon { font-size: 1.5rem; }
    .nav-links {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      flex: 1;
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
      gap: var(--space-3);
      flex-shrink: 0;
    }
    .role-badge {
      font-size: var(--font-size-xs);
      font-weight: 800;
      padding: 6px 12px;
      border-radius: var(--radius-full);
      display: inline-flex;
      align-items: center;
      gap: 4px;
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
      width: 40px;
      height: 40px;
      border-radius: var(--radius-full);
      color: var(--gray-600);
      transition: all var(--transition-fast);
    }
    .cart-btn:hover {
      background: var(--primary-50);
      color: var(--primary-600);
    }
    .logout-btn {
      color: var(--gray-500);
      background: var(--gray-100);
      transition: all var(--transition-fast);
    }
    .logout-btn:hover {
      background: #fef2f2;
      color: var(--error);
    }
    .hamburger {
      display: none;
      flex-direction: column;
      gap: 5px;
      padding: var(--space-2);
    }
    .hamburger span {
      width: 22px;
      height: 2px;
      background: var(--gray-700);
      border-radius: 2px;
      transition: all var(--transition-fast);
    }

    @media (max-width: 768px) {
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
      .nav-actions { gap: var(--space-2); }
    }
  `]
})
export class NavbarComponent {
  auth = inject(AuthService);
  scrolled = signal(false);
  menuOpen = signal(false);

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.scrolled.set(window.scrollY > 20);
      });
    }
  }

  onLogout() {
    this.auth.logout().subscribe();
  }
}
