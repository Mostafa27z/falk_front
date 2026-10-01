import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { CourseListItem } from '../../core/models';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <section class="courses-page">
      <div class="container">
        <div class="page-header animate-fade-in-up">
          <h1>جميع <span class="gradient-text">الدورات</span></h1>
          <p>اختر الدورة التي تناسب مستواك وابدأ رحلتك نحو التفوق</p>
        </div>

        @if (loading()) {
          <div class="courses-grid">
            @for (i of [1,2,3,4,5,6]; track i) {
              <div class="course-skeleton card">
                <div class="skeleton" style="height: 200px"></div>
                <div style="padding: 20px">
                  <div class="skeleton" style="height: 20px; width: 80%; margin-bottom: 12px"></div>
                  <div class="skeleton" style="height: 16px; width: 50%; margin-bottom: 16px"></div>
                  <div class="skeleton" style="height: 24px; width: 30%"></div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="courses-grid stagger-children">
            @for (course of courses(); track course.id) {
              <a [routerLink]="['/courses', course.id]" class="course-card card animate-fade-in-up">
                <div class="course-img">
                  @if (course.picturePath) {
                    <img [src]="course.picturePath" [alt]="course.title">
                  } @else {
                    <div class="course-img-placeholder">
                      <app-icon name="book-open" [size]="40" [strokeWidth]="1.5" />
                    </div>
                  }
                </div>
                <div class="course-info">
                  <h3>{{ course.title }}</h3>
                  <p class="course-instructor">
                    <app-icon name="user" [size]="14" />
                    <span>{{ course.instructor }}</span>
                  </p>
                  <div class="course-footer">
                    <span class="course-price">{{ course.price }} ر.س</span>
                    <span class="course-date">{{ formatDate(course.createdAt) }}</span>
                  </div>
                </div>
              </a>
            }
          </div>

          @if (courses().length === 0) {
            <div class="empty-state">
              <div class="empty-icon-wrap">
                <app-icon name="book-open" [size]="48" [strokeWidth]="1.5" />
              </div>
              <h3>لا توجد دورات متاحة حالياً</h3>
              <p>سيتم إضافة دورات جديدة قريباً</p>
            </div>
          }

          @if (hasMore()) {
            <div class="load-more">
              <button class="btn btn-outline btn-lg" (click)="loadMore()" [disabled]="loadingMore()">
                <span>{{ loadingMore() ? 'جاري التحميل...' : 'تحميل المزيد' }}</span>
                @if (!loadingMore()) {
                  <app-icon name="arrow-left" [size]="16" />
                }
              </button>
            </div>
          }
        }
      </div>
    </section>
  `,
  styles: [`
    .courses-page { padding: var(--space-12) 0 var(--space-20); }

    .page-header {
      text-align: center;
      margin-bottom: var(--space-12);
    }
    .page-header h1 {
      font-size: var(--font-size-4xl);
      font-weight: 900;
      margin-bottom: var(--space-4);
      color: var(--gray-900);
    }
    .page-header p {
      font-size: var(--font-size-lg);
      color: var(--gray-500);
    }

    .courses-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-6);
    }

    .course-card {
      display: block;
      text-decoration: none;
      color: inherit;
    }

    .course-img {
      height: 200px;
      overflow: hidden;
      background: var(--primary-50);
    }
    .course-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform var(--transition-base);
    }
    .course-card:hover .course-img img {
      transform: scale(1.05);
    }
    .course-img-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--primary-50), var(--secondary-50));
      color: var(--primary-400);
    }

    .course-info { padding: var(--space-5); }
    .course-info h3 {
      font-weight: 700;
      color: var(--gray-900);
      margin-bottom: var(--space-2);
      font-size: var(--font-size-base);
      line-height: 1.5;
    }
    .course-instructor {
      font-size: var(--font-size-sm);
      color: var(--gray-500);
      margin-bottom: var(--space-3);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .course-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .course-price {
      font-weight: 800;
      color: var(--primary-700);
      font-size: var(--font-size-lg);
    }
    .course-date {
      font-size: var(--font-size-xs);
      color: var(--gray-400);
    }

    .empty-state {
      text-align: center;
      padding: var(--space-20) 0;
    }
    .empty-icon-wrap {
      width: 80px;
      height: 80px;
      border-radius: var(--radius-2xl);
      background: var(--primary-50);
      color: var(--primary-600);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--space-4);
    }
    .empty-state h3 { font-weight: 700; color: var(--gray-700); margin-bottom: var(--space-2); }
    .empty-state p { color: var(--gray-500); }

    .load-more { text-align: center; margin-top: var(--space-10); }

    @media (max-width: 1024px) { .courses-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px) {
      .courses-page { padding: var(--space-6) 0 var(--space-12); }
      .page-header { margin-bottom: var(--space-6); }
      .page-header h1 { font-size: var(--font-size-2xl); }
      .courses-grid { grid-template-columns: 1fr; }
      .load-more .btn { width: 100%; max-width: 280px; justify-content: center; }
    }
  `]
})
export class CoursesComponent implements OnInit {
  private api = inject(ApiService);
  courses = signal<CourseListItem[]>([]);
  loading = signal(true);
  loadingMore = signal(false);
  hasMore = signal(false);
  private cursor: string | undefined;

  ngOnInit() {
    this.api.getCourses(undefined, 12).subscribe({
      next: (res) => {
        this.courses.set(res.courses ?? []);
        this.cursor = res.nextCursor ?? undefined;
        this.hasMore.set(res.hasMore);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadMore() {
    this.loadingMore.set(true);
    this.api.getCourses(this.cursor, 12).subscribe({
      next: (res) => {
        this.courses.update(c => [...c, ...(res.courses ?? [])]);
        this.cursor = res.nextCursor ?? undefined;
        this.hasMore.set(res.hasMore);
        this.loadingMore.set(false);
      },
      error: () => this.loadingMore.set(false)
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short' });
  }
}
