import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { CourseDetail, LessonType } from '../../core/models';
import { IconComponent, IconName } from '../../shared/icon/icon.component';
import { DialogService } from '../../shared/dialog/dialog.service';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [RouterLink, IconComponent],
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
              <a routerLink="/courses" class="back-link">
                <app-icon name="arrow-right" [size]="16" />
                <span>العودة للدورات</span>
              </a>
              <h1>{{ course()!.title }}</h1>
              <p class="detail-desc">{{ course()!.description }}</p>
              <div class="detail-meta">
                <div class="meta-item">
                  <span class="meta-icon">
                    <app-icon name="user" [size]="16" />
                  </span>
                  <span>{{ course()!.instructorName }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-icon">
                    <app-icon name="clock" [size]="16" />
                  </span>
                  <span>{{ formatDate(course()!.createdAt) }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-icon">
                    <app-icon name="book-open" [size]="16" />
                  </span>
                  <span>{{ getTotalLessons() }} درس</span>
                </div>
              </div>
            </div>

            <div class="detail-sidebar animate-fade-in-up" style="animation-delay: 0.2s">
              <div class="price-card card-glass">
                @if (course()!.picturePath) {
                  <img [src]="course()!.picturePath" [alt]="course()!.title" class="price-card-img">
                } @else {
                  <div class="price-card-img-placeholder">
                    <app-icon name="book-open" [size]="48" [strokeWidth]="1.5" />
                  </div>
                }
                <div class="price-card-body">
                  <div class="price-amount">{{ course()!.price }} <span>ر.س</span></div>
                  @if (auth.isLoggedIn()) {
                    <button class="btn btn-primary btn-lg full-width" (click)="addToCart()" [disabled]="addingToCart()">
                      <app-icon name="shopping-cart" [size]="18" />
                      <span>{{ addingToCart() ? 'جاري الإضافة...' : 'أضف للسلة' }}</span>
                    </button>
                    <a [routerLink]="['/learn', course()!.id]" class="btn btn-outline full-width" style="margin-top: 12px">
                      <app-icon name="play-circle" [size]="18" />
                      <span>ابدأ التعلم</span>
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
                      <span class="chevron" [class.open]="openSections().includes(i)">
                        <app-icon [name]="openSections().includes(i) ? 'chevron-up' : 'chevron-down'" [size]="16" />
                      </span>
                    </div>
                  </button>

                  @if (openSections().includes(i)) {
                    <div class="section-lessons">
                      @for (lesson of section.lessons; track lesson.id; let j = $index) {
                        <div class="lesson-item">
                          <span class="lesson-icon">
                            <app-icon [name]="getLessonIcon(lesson.type)" [size]="16" />
                          </span>
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
  `,
  styleUrl: './course-detail.component.css'
})
export class CourseDetailComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private dialog = inject(DialogService);
  auth = inject(AuthService);

  course = signal<CourseDetail | null>(null);
  loading = signal(true);
  openSections = signal<number[]>([0]);
  addingToCart = signal(false);

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

  getLessonIcon(type: LessonType): IconName {
    const icons: Record<LessonType, IconName> = {
      Written: 'file-text',
      Video: 'video',
      Quiz: 'help-circle',
      Pdf: 'file'
    };
    return icons[type] || 'file-text';
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
        this.dialog.alert({
          title: 'تمت الإضافة للسلة',
          message: 'تمت إضافة الدورة بنجاح إلى سلة مشترياتك!',
          type: 'success',
          okText: 'متابعة التصفح'
        });
      },
      error: (err) => {
        this.addingToCart.set(false);
        const msg = err.error?.detail || 'حدث خطأ، أو أن الدورة مضافة مسبقاً إلى السلة';
        this.dialog.alert({
          title: 'تنبيه السلة',
          message: msg,
          type: 'info',
          okText: 'حسناً'
        });
      }
    });
  }
}
