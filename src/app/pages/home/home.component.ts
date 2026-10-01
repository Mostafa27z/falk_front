import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { CourseListItem } from '../../core/models';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <!-- ============ HERO ============ -->
    <section class="hero">
      <div class="hero-bg-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
      <div class="container hero-content">
        <div class="hero-text animate-fade-in-up">
          <span class="hero-badge">
            <app-icon name="sparkles" [size]="16" />
            <span>منصة تعليمية متطورة وموثوقة</span>
          </span>
          <h1>
            مستقبلك يبدأ هنا مع
            <span class="gradient-text">فالك التوفيق</span>
          </h1>
          <p class="hero-desc">
            منصة تعليمية تعتمد على أحدث التقنيات لتهيئة الطلاب لاختبارات القدرات
            والتحصيلي وموهبة، بأسلوب عصري ومحفز يضمن التفوق.
          </p>
          <div class="hero-actions">
            <a routerLink="/register" class="btn btn-primary btn-lg">
              <span>ابدأ رحلتك الآن</span>
              <app-icon name="arrow-left" [size]="18" />
            </a>
            <a routerLink="/courses" class="btn btn-outline btn-lg">
              <app-icon name="play-circle" [size]="18" />
              <span>تصفح الدورات</span>
            </a>
          </div>
        </div>
        <div class="hero-visual animate-fade-in-up" style="animation-delay: 0.3s">
          <div class="hero-card-stack">
            <div class="hero-card hero-card-1">
              <div class="hc-stat">
                <span class="hc-num">92%+</span>
                <span class="hc-label">نسبة النجاح</span>
              </div>
              <div class="hc-bar">
                <div class="hc-bar-fill" style="width: 92%"></div>
              </div>
            </div>
            <div class="hero-card hero-card-2">
              <span class="hc-icon-wrap">
                <app-icon name="brain" [size]="20" />
              </span>
              <span class="hc-text">تفكير ذهني</span>
              <span class="hc-badge">مرتفع</span>
            </div>
            <div class="hero-brain-circle">
              <div class="brain-pulse"></div>
              <app-icon name="brain" [size]="64" [strokeWidth]="1.5" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ TRACKS ============ -->
    <section class="tracks section">
      <div class="container">
        <h2 class="section-title">مسارات مصممة للتميز</h2>
        <p class="section-subtitle">اختر المسار الذي يناسب طموحك وابدأ في بناء قدراتك بثقة</p>

        <div class="tracks-grid stagger-children">
          <div class="track-card track-tahsili animate-fade-in-up">
            <div class="track-icon">
              <app-icon name="trending-up" [size]="28" />
            </div>
            <h3>مسار التحصيلي</h3>
            <p>مراجعة شاملة للمقررات العلمية لضمان أعلى الدرجات.</p>
            <a routerLink="/courses" class="track-link">
              <span>استكشف المسار</span>
              <app-icon name="arrow-left" [size]="14" />
            </a>
          </div>

          <div class="track-card track-qudrat animate-fade-in-up">
            <div class="track-icon">
              <app-icon name="calculator" [size]="28" />
            </div>
            <h3>مسار القدرات</h3>
            <p>تأسيس وتدريب مكثف على القسمين الكمي والفظي بأحدث استراتيجيات الحل السريع والذكي.</p>
            <a routerLink="/courses" class="track-link">
              <span>استكشف المسار</span>
              <app-icon name="arrow-left" [size]="14" />
            </a>
          </div>

          <div class="track-card track-mawaheb animate-fade-in-up">
            <div class="track-icon">
              <app-icon name="sparkles" [size]="28" />
            </div>
            <h3>مسار موهبة</h3>
            <p>تنمية القدرات العقلية والإبداعية على أعلى مستوى أكاديمي.</p>
            <a routerLink="/courses" class="track-link">
              <span>استكشف المسار</span>
              <app-icon name="arrow-left" [size]="14" />
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ STATS ============ -->
    <section class="stats-section">
      <div class="container stats-grid">
        <div class="stat-card">
          <div class="stat-num gradient-text">10k+</div>
          <div class="stat-label">طالب مستفيد</div>
        </div>
        <div class="stat-card">
          <div class="stat-num gradient-text">98%</div>
          <div class="stat-label">نسبة الرضا</div>
        </div>
        <div class="stat-card">
          <div class="stat-num gradient-text">50+</div>
          <div class="stat-label">دورة متاحة</div>
        </div>
        <div class="stat-card">
          <div class="stat-num gradient-text">92%</div>
          <div class="stat-label">نسبة النجاح</div>
        </div>
      </div>
    </section>

    <!-- ============ SMART TRACKING ============ -->
    <section class="tracking section">
      <div class="container tracking-content">
        <div class="tracking-info animate-fade-in-up">
          <h2>تتبع أداءك <span class="gradient-text">الذكي</span></h2>
          <p>نظام تحليل متقدم يحدد نقاط قوتك وضعفك لتوجيهك نحو التحسين المستمر.</p>
          <ul class="tracking-features">
            <li>
              <span class="feature-check">
                <app-icon name="check-circle" [size]="18" />
              </span>
              <span>تحليل الأداء في الوقت الحقيقي</span>
            </li>
            <li>
              <span class="feature-check">
                <app-icon name="check-circle" [size]="18" />
              </span>
              <span>توصيات مخصصة لتحسين المستوى</span>
            </li>
            <li>
              <span class="feature-check">
                <app-icon name="check-circle" [size]="18" />
              </span>
              <span>تقارير تفصيلية للتقدم والنتائج</span>
            </li>
          </ul>
        </div>
        <div class="tracking-visual animate-fade-in-up" style="animation-delay: 0.2s">
          <div class="chart-mock">
            <div class="chart-bar" style="height: 40%"></div>
            <div class="chart-bar" style="height: 65%"></div>
            <div class="chart-bar active" style="height: 85%"></div>
            <div class="chart-bar" style="height: 70%"></div>
            <div class="chart-bar" style="height: 90%"></div>
            <div class="chart-bar" style="height: 75%"></div>
            <div class="chart-bar active" style="height: 95%"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ FEATURED COURSES ============ -->
    @if (courses().length > 0) {
      <section class="featured section">
        <div class="container">
          <h2 class="section-title">أحدث الدورات</h2>
          <p class="section-subtitle">اكتشف أحدث الدورات المتاحة وابدأ التعلم اليوم</p>

          <div class="courses-grid stagger-children">
            @for (course of courses(); track course.id) {
              <a [routerLink]="['/courses', course.id]" class="course-card card animate-fade-in-up">
                <div class="course-img">
                  @if (course.picturePath) {
                    <img [src]="course.picturePath" [alt]="course.title">
                  } @else {
                    <div class="course-img-placeholder">
                      <app-icon name="book-open" [size]="36" [strokeWidth]="1.5" />
                    </div>
                  }
                </div>
                <div class="course-info">
                  <h3>{{ course.title }}</h3>
                  <p class="course-instructor">{{ course.instructor }}</p>
                  <div class="course-footer">
                    <span class="course-price">{{ course.price }} ر.س</span>
                  </div>
                </div>
              </a>
            }
          </div>

          <div class="featured-cta">
            <a routerLink="/courses" class="btn btn-outline btn-lg">
              <span>عرض جميع الدورات</span>
              <app-icon name="arrow-left" [size]="16" />
            </a>
          </div>
        </div>
      </section>
    }

    <!-- ============ CTA ============ -->
    <section class="cta-section">
      <div class="container cta-content">
        <h2>جاهز لبدء رحلة التفوق؟</h2>
        <p>انضم لآلاف الطلاب الذين حققوا أحلامهم مع فالك التوفيق</p>
        <a routerLink="/register" class="btn btn-primary btn-lg">
          <span>سجّل الآن مجاناً</span>
          <app-icon name="arrow-left" [size]="18" />
        </a>
      </div>
    </section>
  `,
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private api = inject(ApiService);
  courses = signal<CourseListItem[]>([]);

  ngOnInit() {
    this.api.getCourses(undefined, 6).subscribe({
      next: (res) => this.courses.set(res.courses ?? []),
      error: () => {} // silently fail on homepage
    });
  }
}
