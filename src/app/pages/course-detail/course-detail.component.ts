import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { CourseDetail, LessonType } from '../../core/models';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (loading()) {
      <div class="detail-page">
        <div class="container">
          <div class="detail-hero">
            <div class="skeleton" style="height: 40px; width: 60%; margin-bottom: 16px"></div>
            <div class="skeleton" style="height: 20px; width: 40%; margin-bottom: 24px"></div>
            <div class="skeleton" style="height: 100px; width: 100%"></div>
          </div>
        </div>
      </div>
    } @else if (course()) {
      <div class="detail-page">
        <!-- Hero -->
        <section class="detail-hero">
          <div class="hero-bg-gradient"></div>
          <div class="container detail-hero-content">
            <div class="detail-info animate-fade-in-up">
              <a routerLink="/courses" class="back-link">← العودة للدورات</a>
              <h1>{{ course()!.title }}</h1>
              <p class="detail-desc">{{ course()!.description }}</p>
              <div class="detail-meta">
                <div class="meta-item">
                  <span class="meta-icon">👤</span>
                  <span>{{ course()!.instructorName }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-icon">📅</span>
                  <span>{{ formatDate(course()!.createdAt) }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-icon">📖</span>
                  <span>{{ getTotalLessons() }} درس</span>
                </div>
              </div>
            </div>

            <div class="detail-sidebar animate-fade-in-up" style="animation-delay: 0.2s">
              <div class="price-card card-glass">
                @if (course()!.picturePath) {
                  <img [src]="course()!.picturePath" [alt]="course()!.title" class="price-card-img">
                } @else {
                  <div class="price-card-img-placeholder">📚</div>
                }
                <div class="price-card-body">
                  <div class="price-amount">{{ course()!.price }} <span>ر.س</span></div>
                  @if (auth.isLoggedIn()) {
                    <button class="btn btn-primary btn-lg full-width" (click)="addToCart()" [disabled]="addingToCart()">
                      {{ addingToCart() ? 'جاري الإضافة...' : '🛒 أضف للسلة' }}
                    </button>
                    <a [routerLink]="['/learn', course()!.id]" class="btn btn-outline full-width" style="margin-top: 12px">
                      ▶ ابدأ التعلم
                    </a>
                  } @else {
                    <a routerLink="/login" class="btn btn-primary btn-lg full-width">
                      سجل دخولك للشراء
                    </a>
                  }
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Syllabus -->
        <section class="syllabus section">
          <div class="container">
            <h2 class="section-title">محتوى الدورة</h2>
            <p class="section-subtitle">{{ course()!.sections.length }} أقسام · {{ getTotalLessons() }} درس</p>

            <div class="sections-list">
              @for (section of course()!.sections; track section.id; let i = $index) {
                <div class="section-item card animate-fade-in-up">
                  <button class="section-header" (click)="toggleSection(i)">
                    <div class="section-title-row">
                      <span class="section-num">{{ i + 1 }}</span>
                      <h3>{{ section.title }}</h3>
                    </div>
                    <div class="section-meta">
                      <span>{{ section.lessons.length }} درس</span>
                      <span class="chevron" [class.open]="openSections().includes(i)">▼</span>
                    </div>
                  </button>

                  @if (openSections().includes(i)) {
                    <div class="section-lessons">
                      @for (lesson of section.lessons; track lesson.id; let j = $index) {
                        <div class="lesson-item">
                          <span class="lesson-icon">{{ getLessonIcon(lesson.type) }}</span>
                          <span class="lesson-title">{{ lesson.title }}</span>
                          <span class="lesson-type badge badge-purple">{{ getLessonTypeAr(lesson.type) }}</span>
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </section>
      </div>
    }

    @if (toastMsg()) {
      <div class="toast" [class.toast-success]="toastType() === 'success'" [class.toast-error]="toastType() === 'error'">
        {{ toastMsg() }}
      </div>
    }
  `,
  styleUrl: './course-detail.component.css'
})
export class CourseDetailComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  auth = inject(AuthService);

  course = signal<CourseDetail | null>(null);
  loading = signal(true);
  openSections = signal<number[]>([0]);
  addingToCart = signal(false);
  toastMsg = signal('');
  toastType = signal<'success' | 'error'>('success');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.getCourse(id).subscribe({
      next: (c) => { this.course.set(c); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  toggleSection(i: number) {
    this.openSections.update(sections =>
      sections.includes(i) ? sections.filter(s => s !== i) : [...sections, i]
    );
  }

  getTotalLessons(): number {
    return this.course()?.sections.reduce((sum, s) => sum + s.lessons.length, 0) ?? 0;
  }

  getLessonIcon(type: LessonType): string {
    const icons: Record<LessonType, string> = { Written: '📝', Video: '🎬', Quiz: '❓', Pdf: '📄' };
    return icons[type];
  }

  getLessonTypeAr(type: LessonType): string {
    const names: Record<LessonType, string> = { Written: 'مكتوب', Video: 'فيديو', Quiz: 'اختبار', Pdf: 'ملف PDF' };
    return names[type];
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  addToCart() {
    this.addingToCart.set(true);
    this.api.addCartItem({ courseId: this.course()!.id, isRenewal: false }).subscribe({
      next: () => {
        this.addingToCart.set(false);
        this.showToast('تمت إضافة الدورة للسلة ✓', 'success');
      },
      error: (err) => {
        this.addingToCart.set(false);
        const msg = err.error?.detail || 'حدث خطأ، حاول مرة أخرى';
        this.showToast(msg, 'error');
      }
    });
  }

  private showToast(msg: string, type: 'success' | 'error') {
    this.toastMsg.set(msg);
    this.toastType.set(type);
    setTimeout(() => this.toastMsg.set(''), 3000);
  }
}
