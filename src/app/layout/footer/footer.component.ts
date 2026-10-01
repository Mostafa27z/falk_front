import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="container footer-content">
        <div class="footer-brand">
          <a routerLink="/" class="footer-logo">
            <img src="/logo.jpeg" alt="فالك التوفيق" class="footer-logo-img" />
            <span class="footer-logo-text">فالك التوفيق</span>
          </a>
          <p class="footer-desc">نصنع قادة المستقبل عبر تعليم ذكي، محفز وعصري على أسس علمية متينة.</p>
        </div>

        <div class="footer-links">
          <h4>روابط هامة</h4>
          <ul>
            <li><a routerLink="/courses">الدورات</a></li>
            <li><a routerLink="/">سياسة الخصوصية</a></li>
            <li><a routerLink="/">الشروط والأحكام</a></li>
          </ul>
        </div>

        <div class="footer-links">
          <h4>الدعم</h4>
          <ul>
            <li><a routerLink="/">الأسئلة الشائعة</a></li>
            <li><a routerLink="/">مركز المساعدة</a></li>
            <li><a href="mailto:info@falk-el-tawfiq.com">تواصل معنا</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="container footer-bottom-content">
          <p>© 2024 فالك التوفيق. جميع الحقوق محفوظة.</p>
          <div class="footer-social">
            <a href="#" aria-label="Twitter">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="#" aria-label="Email">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--gray-900);
      color: var(--gray-300);
      margin-top: auto;
    }
    .footer-content {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: var(--space-10);
      padding: var(--space-16) 0 var(--space-10);
    }
    .footer-logo {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      font-size: var(--font-size-xl);
      font-weight: 800;
      color: white;
      margin-bottom: var(--space-4);
    }
    .footer-logo-img {
      height: 38px;
      width: auto;
      object-fit: contain;
      border-radius: var(--radius-md);
      background: white;
      padding: 2px 4px;
    }
    .footer-desc {
      font-size: var(--font-size-sm);
      line-height: 1.8;
      max-width: 320px;
      color: var(--gray-400);
    }
    .footer-links h4 {
      color: white;
      font-size: var(--font-size-base);
      font-weight: 700;
      margin-bottom: var(--space-4);
    }
    .footer-links ul {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }
    .footer-links a {
      font-size: var(--font-size-sm);
      color: var(--gray-400);
      transition: color var(--transition-fast);
    }
    .footer-links a:hover {
      color: var(--primary-300);
    }
    .footer-bottom {
      border-top: 1px solid var(--gray-800);
      padding: var(--space-5) 0;
    }
    .footer-bottom-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-bottom p {
      font-size: var(--font-size-sm);
      color: var(--gray-500);
    }
    .footer-social {
      display: flex;
      gap: var(--space-4);
    }
    .footer-social a {
      color: var(--gray-500);
      transition: color var(--transition-fast);
    }
    .footer-social a:hover { color: var(--primary-400); }

    @media (max-width: 768px) {
      .footer-content {
        grid-template-columns: 1fr;
        gap: var(--space-8);
      }
    }

    @media (max-width: 480px) {
      .footer-content {
        padding: var(--space-10) 0 var(--space-8);
      }
      .footer-bottom-content {
        flex-direction: column;
        gap: var(--space-3);
        text-align: center;
      }
    }
  `]
})
export class FooterComponent {}
