import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from '../../core/api.service';
import { CourseDetail, LessonDetail, LessonType, SectionResponse } from '../../core/models';
import { IconComponent, IconName } from '../../shared/icon/icon.component';
import { DialogService } from '../../shared/dialog/dialog.service';

@Component({
  selector: 'app-learn',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="learn-page">
      <!-- Sidebar -->
      <aside class="learn-sidebar" [class.open]="sidebarOpen()">
        <div class="sidebar-header">
          <h3>{{ course()?.title }}</h3>
          <button class="sidebar-close" (click)="sidebarOpen.set(false)" title="إغلاق القائمة">
            <app-icon name="x" [size]="18" />
          </button>
        </div>

        <div class="sidebar-sections">
          @for (section of course()?.sections; track section.id; let si = $index) {
            <div class="sidebar-section">
              <div class="sidebar-section-title">{{ section.title }}</div>
              @for (lesson of section.lessons; track lesson.id) {
                <button
                  class="sidebar-lesson"
                  [class.active]="currentLessonId() === lesson.id"
                  [class.completed]="completedLessons().has(lesson.id)"
                  (click)="selectLesson(lesson.id)">
                  <span class="sl-icon">
                    <app-icon [name]="getLessonIcon(lesson.type)" [size]="16" />
                  </span>
                  <span class="sl-title">{{ lesson.title }}</span>
                  @if (completedLessons().has(lesson.id)) {
                    <span class="sl-check">
                      <app-icon name="check" [size]="12" />
                    </span>
                  }
                </button>
              }
            </div>
          }
        </div>
      </aside>

      <!-- Main Content -->
      <main class="learn-main">
        <div class="learn-topbar">
          <button class="btn btn-sm btn-outline content-btn" (click)="sidebarOpen.set(true)" title="المحتوى" aria-label="المحتوى">
            <app-icon name="menu" [size]="16" />
            <span class="btn-text">المحتوى</span>
          </button>
          <h2 [title]="currentLesson()?.title || ''">{{ currentLesson()?.title }}</h2>
          <div class="learn-nav-btns">
            <button class="btn btn-sm btn-outline nav-btn" (click)="prevLesson()" [disabled]="!hasPrev()" title="السابق" aria-label="السابق">
              <app-icon name="arrow-right" [size]="14" />
              <span class="btn-text">السابق</span>
            </button>
            <button class="btn btn-sm btn-outline nav-btn" (click)="markComplete()" title="إكمال" aria-label="إكمال">
              <app-icon name="check" [size]="14" />
              <span class="btn-text">إكمال</span>
            </button>
            <button class="btn btn-sm btn-primary nav-btn" (click)="nextLesson()" [disabled]="!hasNext()" title="التالي" aria-label="التالي">
              <span class="btn-text">التالي</span>
              <app-icon name="arrow-left" [size]="14" />
            </button>
          </div>
        </div>

        <div class="learn-content">
          @if (lessonLoading()) {
            <div class="lesson-loading">
              <div class="spinner"></div>
              <p>جاري تحميل الدرس...</p>
            </div>
          } @else if (currentLesson()) {
            @switch (currentLesson()!.type) {
              @case ('Written') {
                <div class="written-content" [innerHTML]="sanitizedContent()"></div>
              }
              @case ('Video') {
                @if (currentLesson()!.video) {
                  @if (currentLesson()!.video!.status === 'Ready') {
                    <div class="video-wrapper">
                      <iframe
                        [src]="videoUrl()"
                        allowfullscreen
                        loading="lazy"
                        class="video-frame">
                      </iframe>
                    </div>
                  } @else if (currentLesson()!.video!.status === 'Pending') {
                    <div class="video-pending">
                      <app-icon name="clock" [size]="44" />
                      <h3>الفيديو قيد المعالجة</h3>
                      <p>يرجى المحاولة لاحقاً</p>
                    </div>
                  } @else {
                    <div class="video-pending">
                      <app-icon name="alert-circle" [size]="44" />
                      <h3>خطأ في تحميل الفيديو</h3>
                    </div>
                  }
                }
              }
              @case ('Quiz') {
                @if (currentLesson()!.quiz) {
                  <div class="quiz-container">
                    <div class="quiz-header">
                      <h3>اختبار: {{ currentLesson()!.title }}</h3>
                      <p>درجة النجاح: {{ currentLesson()!.quiz!.passingScore }}%</p>
                    </div>

                    @if (!quizSubmitted()) {
                      @for (q of currentLesson()!.quiz!.questions; track $index; let qi = $index) {
                        <div class="quiz-question card">
                          <h4>{{ qi + 1 }}. {{ q.prompt }}</h4>
                          <div class="quiz-answers">
                            @for (a of q.answers; track $index; let ai = $index) {
                              <label class="quiz-answer" [class.selected]="selectedAnswers()[qi] === ai">
                                <input type="radio" [name]="'q-' + qi" (change)="selectAnswer(qi, ai)">
                                <span class="qa-radio"></span>
                                <span>{{ a.text }}</span>
                              </label>
                            }
                          </div>
                        </div>
                      }
                      <button class="btn btn-primary btn-lg" (click)="submitQuiz()">
                        <span>إرسال الإجابات</span>
                        <app-icon name="arrow-left" [size]="16" />
                      </button>
                    } @else {
                      <div class="quiz-result card" [class.passed]="quizPassed()" [class.failed]="!quizPassed()">
                        <div class="result-icon">
                          @if (quizPassed()) {
                            <app-icon name="trophy" [size]="48" />
                          } @else {
                            <app-icon name="alert-circle" [size]="48" />
                          }
                        </div>
                        <h3>{{ quizPassed() ? 'أحسنت! لقد اجتزت الاختبار' : 'لم تجتز الاختبار' }}</h3>
                        <p>نتيجتك: {{ quizScore() }}%</p>
                        @if (!quizPassed()) {
                          <button class="btn btn-outline" (click)="retryQuiz()">
                            <app-icon name="rotate-ccw" [size]="16" />
                            <span>أعد المحاولة</span>
                          </button>
                        }
                      </div>
                    }
                  </div>
                }
              }
              @case ('Pdf') {
                @if (currentLesson()!.pdf) {
                  <div class="pdf-container">
                    <div class="pdf-header card">
                      <span class="pdf-icon">
                        <app-icon name="file-text" [size]="32" />
                      </span>
                      <div class="pdf-info">
                        <h3>{{ currentLesson()!.title }}</h3>
                        <p>حجم الملف: {{ formatBytes(currentLesson()!.pdf!.sizeBytes) }}</p>
                      </div>
                      <a [href]="currentLesson()!.pdf!.downloadUrl" target="_blank" class="btn btn-primary pdf-download-btn" title="تحميل ملف PDF" aria-label="تحميل ملف PDF">
                        <app-icon name="file-down" [size]="16" />
                        <span class="btn-text">تحميل PDF</span>
                      </a>
                    </div>
                    <iframe [src]="pdfUrl()" class="pdf-frame"></iframe>
                  </div>
                }
              }
            }
          } @else {
            <div class="lesson-empty">
              <app-icon name="book-open" [size]="48" [strokeWidth]="1.5" />
              <h3>اختر درساً من القائمة للبدء</h3>
            </div>
          }
        </div>
      </main>
    </div>
  `,
  styleUrl: './learn.component.css'
})
export class LearnComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  private dialog = inject(DialogService);

  course = signal<CourseDetail | null>(null);
  currentLesson = signal<LessonDetail | null>(null);
  currentLessonId = signal<string>('');
  lessonLoading = signal(false);
  sidebarOpen = signal(true);
  completedLessons = signal<Set<string>>(new Set());

  // Quiz state
  selectedAnswers = signal<Record<number, number>>({});
  quizSubmitted = signal(false);
  quizScore = signal(0);
  quizPassed = signal(false);

  private allLessonIds: string[] = [];

  ngOnInit() {
    const courseId = this.route.snapshot.paramMap.get('courseId')!;
    this.api.getCourse(courseId).subscribe({
      next: (c) => {
        this.course.set(c);
        // Flatten lesson IDs
        this.allLessonIds = c.sections.flatMap(s => s.lessons.map(l => l.id));
        // Auto-select first lesson
        if (this.allLessonIds.length > 0) {
          this.selectLesson(this.allLessonIds[0]);
        }
      }
    });
  }

  selectLesson(id: string) {
    this.currentLessonId.set(id);
    this.lessonLoading.set(true);
    this.quizSubmitted.set(false);
    this.selectedAnswers.set({});
    this.sidebarOpen.set(false);

    this.api.getLesson(id).subscribe({
      next: (l) => { this.currentLesson.set(l); this.lessonLoading.set(false); },
      error: () => this.lessonLoading.set(false)
    });
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

  sanitizedContent(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.currentLesson()?.content || '');
  }

  videoUrl(): SafeResourceUrl {
    const url = this.currentLesson()?.video?.playbackUrl || '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  pdfUrl(): SafeResourceUrl {
    const url = this.currentLesson()?.pdf?.downloadUrl || '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // Quiz
  selectAnswer(qi: number, ai: number) {
    this.selectedAnswers.update(a => ({ ...a, [qi]: ai }));
  }

  submitQuiz() {
    const quiz = this.currentLesson()?.quiz;
    if (!quiz) return;

    const totalQuestions = quiz.questions.length;
    const answeredCount = Object.keys(this.selectedAnswers()).length;
    if (answeredCount < totalQuestions) {
      this.dialog.warning(`يرجى الإجابة على جميع الأسئلة قبل إرسال الاختبار (أجبت على ${answeredCount} من ${totalQuestions})`, 'إكمال الإجابات مطلوب');
      return;
    }

    let correct = 0;
    quiz.questions.forEach((q, qi) => {
      const selected = this.selectedAnswers()[qi];
      if (selected !== undefined && q.answers[selected]?.isCorrect) correct++;
    });

    const score = Math.round((correct / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;
    this.quizScore.set(score);
    this.quizPassed.set(passed);
    this.quizSubmitted.set(true);

    if (passed) {
      this.dialog.alert({
        title: 'أحسنت! اجتزت الاختبار بنجاح',
        message: `حصلت على ${score}% (الدرجة المطلوبة: ${quiz.passingScore}%).\nتم تسجيل إتمام هذا الاختبار.`,
        type: 'success',
        okText: 'متابعة'
      });
    } else {
      this.dialog.alert({
        title: 'لم تجتز الاختبار',
        message: `حصلت على ${score}% وهي أقل من النسبة المطلوبة (${quiz.passingScore}%).\nراجع محتوى الدرس وأعد المحاولة.`,
        type: 'warning',
        okText: 'إعادة المحاولة'
      });
    }
  }

  retryQuiz() {
    this.selectedAnswers.set({});
    this.quizSubmitted.set(false);
  }

  // Navigation
  hasPrev(): boolean {
    const idx = this.allLessonIds.indexOf(this.currentLessonId());
    return idx > 0;
  }

  hasNext(): boolean {
    const idx = this.allLessonIds.indexOf(this.currentLessonId());
    return idx < this.allLessonIds.length - 1;
  }

  prevLesson() {
    const idx = this.allLessonIds.indexOf(this.currentLessonId());
    if (idx > 0) this.selectLesson(this.allLessonIds[idx - 1]);
  }

  nextLesson() {
    const idx = this.allLessonIds.indexOf(this.currentLessonId());
    if (idx < this.allLessonIds.length - 1) this.selectLesson(this.allLessonIds[idx + 1]);
  }

  markComplete() {
    this.completedLessons.update(s => {
      const ns = new Set(s);
      ns.add(this.currentLessonId());
      return ns;
    });
    if (this.hasNext()) {
      this.nextLesson();
    } else {
      this.dialog.alert({
        title: 'مبارك! أكملت جميع الدروس',
        message: 'تهانينا الحارة! لقد أنهيت بنجاح دراسة كافة دروس هذا المقرر. فالك التوفيق والنجاح الدائم!',
        type: 'success',
        okText: 'حسناً'
      });
    }
  }

  formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }
}
