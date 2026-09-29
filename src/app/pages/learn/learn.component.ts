import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from '../../core/api.service';
import { CourseDetail, LessonDetail, LessonType, SectionResponse } from '../../core/models';

@Component({
  selector: 'app-learn',
  standalone: true,
  template: `
    <div class="learn-page">
      <!-- Sidebar -->
      <aside class="learn-sidebar" [class.open]="sidebarOpen()">
        <div class="sidebar-header">
          <h3>{{ course()?.title }}</h3>
          <button class="sidebar-close" (click)="sidebarOpen.set(false)">✕</button>
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
                  <span class="sl-icon">{{ getLessonIcon(lesson.type) }}</span>
                  <span class="sl-title">{{ lesson.title }}</span>
                  @if (completedLessons().has(lesson.id)) {
                    <span class="sl-check">✓</span>
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
          <button class="btn btn-sm btn-outline" (click)="sidebarOpen.set(true)">
            ☰ المحتوى
          </button>
          <h2>{{ currentLesson()?.title }}</h2>
          <div class="learn-nav-btns">
            <button class="btn btn-sm btn-outline" (click)="prevLesson()" [disabled]="!hasPrev()">السابق</button>
            <button class="btn btn-sm btn-primary" (click)="markComplete()">✓ إكمال</button>
            <button class="btn btn-sm btn-primary" (click)="nextLesson()" [disabled]="!hasNext()">التالي ←</button>
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
                      <span>⏳</span>
                      <h3>الفيديو قيد المعالجة</h3>
                      <p>يرجى المحاولة لاحقاً</p>
                    </div>
                  } @else {
                    <div class="video-pending">
                      <span>❌</span>
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
                        إرسال الإجابات ←
                      </button>
                    } @else {
                      <div class="quiz-result card" [class.passed]="quizPassed()" [class.failed]="!quizPassed()">
                        <div class="result-icon">{{ quizPassed() ? '🎉' : '😔' }}</div>
                        <h3>{{ quizPassed() ? 'أحسنت! لقد اجتزت الاختبار' : 'لم تجتز الاختبار' }}</h3>
                        <p>نتيجتك: {{ quizScore() }}%</p>
                        @if (!quizPassed()) {
                          <button class="btn btn-outline" (click)="retryQuiz()">أعد المحاولة</button>
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
                      <span class="pdf-icon">📄</span>
                      <div class="pdf-info">
                        <h3>{{ currentLesson()!.title }}</h3>
                        <p>حجم الملف: {{ formatBytes(currentLesson()!.pdf!.sizeBytes) }}</p>
                      </div>
                      <a [href]="currentLesson()!.pdf!.downloadUrl" target="_blank" class="btn btn-primary">
                        ⬇ تحميل PDF
                      </a>
                    </div>
                    <iframe [src]="pdfUrl()" class="pdf-frame"></iframe>
                  </div>
                }
              }
            }
          } @else {
            <div class="lesson-empty">
              <span>📖</span>
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

  getLessonIcon(type: LessonType): string {
    const icons: Record<LessonType, string> = { Written: '📝', Video: '🎬', Quiz: '❓', Pdf: '📄' };
    return icons[type];
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

    let correct = 0;
    quiz.questions.forEach((q, qi) => {
      const selected = this.selectedAnswers()[qi];
      if (selected !== undefined && q.answers[selected]?.isCorrect) correct++;
    });

    const score = Math.round((correct / quiz.questions.length) * 100);
    this.quizScore.set(score);
    this.quizPassed.set(score >= quiz.passingScore);
    this.quizSubmitted.set(true);
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
    if (this.hasNext()) this.nextLesson();
  }

  formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }
}
