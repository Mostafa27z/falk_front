import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import {
  AdminCourseListItem,
  CourseDetail,
  CourseStatus,
  CreateCourseRequest,
  InviteInstructorRequest,
  LessonType,
  QuestionDTO,
  QuizDto,
  SectionResponse,
  UpdateCourseRequest,
  VideoInitResult
} from '../../core/models';
import { extractErrorMessage } from '../../core/error-utils';

type DashboardTab = 'courses' | 'instructors' | 'invite';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="dashboard-page">
      <div class="dashboard-container">

        <!-- Top Hero Header -->
        <header class="dash-hero card-glass animate-fade-in-up">
          <div class="hero-right">
            <div class="avatar-glow">
              <span class="avatar-icon">👑</span>
            </div>
            <div class="hero-info">
              <div class="role-pill">
                <span class="role-dot"></span>
                <span>لوحة تحكم مدير النظام • Admin Dashboard</span>
              </div>
              <h1>مرحباً، {{ auth.displayName() || 'مدير المنصة' }}</h1>
              <p>إدارة شاملة لدورات المنصة، صناعة المناهج والدروس، وإدارة المحاضرين</p>
            </div>
          </div>

          <div class="hero-stats">
            <div class="stat-box">
              <div class="stat-icon-wrapper purple">📚</div>
              <div class="stat-content">
                <span class="stat-num">{{ courses().length }}</span>
                <span class="stat-title">إجمالي الدورات</span>
              </div>
            </div>

            <div class="stat-box">
              <div class="stat-icon-wrapper blue">👨‍🏫</div>
              <div class="stat-content">
                <span class="stat-num">{{ instructors().length }}</span>
                <span class="stat-title">المحاضرون</span>
              </div>
            </div>

            <div class="stat-box">
              <div class="stat-icon-wrapper green">✓</div>
              <div class="stat-content">
                <span class="stat-num">{{ publishedCount() }}</span>
                <span class="stat-title">دورات منشورة</span>
              </div>
            </div>
          </div>
        </header>

        <!-- Segmented Navigation Tabs (hidden when inside Curriculum editor) -->
        @if (!activeCurriculumCourse()) {
          <div class="tabs-nav-bar animate-fade-in-up">
            <button
              type="button"
              class="nav-tab"
              [class.active]="activeTab() === 'courses'"
              (click)="activeTab.set('courses')">
              <span class="tab-icon">📚</span>
              <span>إدارة الدورات</span>
              <span class="tab-badge">{{ courses().length }}</span>
            </button>

            <button
              type="button"
              class="nav-tab"
              [class.active]="activeTab() === 'instructors'"
              (click)="activeTab.set('instructors')">
              <span class="tab-icon">👨‍🏫</span>
              <span>قائمة المحاضرين</span>
              <span class="tab-badge">{{ instructors().length }}</span>
            </button>

            <button
              type="button"
              class="nav-tab"
              [class.active]="activeTab() === 'invite'"
              (click)="activeTab.set('invite')">
              <span class="tab-icon">➕</span>
              <span>دعوة محاضر جديد</span>
            </button>
          </div>
        }

        <!-- Notification Alert -->
        @if (feedback()) {
          <div class="alert-box" [class.success]="feedbackType() === 'success'" [class.error]="feedbackType() === 'error'">
            <span class="alert-icon">{{ feedbackType() === 'success' ? '✓' : '⚠️' }}</span>
            <span>{{ feedback() }}</span>
          </div>
        }

        <!-- ============================================================== -->
        <!-- VIEW: Curriculum Builder for Selected Course                   -->
        <!-- ============================================================== -->
        @if (activeCurriculumCourse()) {
          <section class="section-card card-glass animate-scale-in">
            <div class="card-top-bar">
              <div class="bar-title">
                <button class="btn btn-outline btn-sm" (click)="closeCurriculum()">
                  ← العودة لقائمة الدورات
                </button>
                <h2>المنهج الدراسي: {{ activeCurriculumCourse()!.title }}</h2>
                <span class="count-tag">{{ activeCurriculumCourse()!.price }} ر.س</span>
              </div>
              <div class="actions-cluster">
                <button class="btn btn-primary btn-sm" (click)="openAddSectionModal()">
                  ➕ إضافة فصل جديد
                </button>
              </div>
            </div>

            @if (loadingCurriculum()) {
              <div class="state-loading">
                <div class="spinner-purple"></div>
                <p>جاري تحديث بيانات المنهج...</p>
              </div>
            } @else if (activeCurriculumCourse()!.sections.length === 0) {
              <div class="state-empty">
                <span class="empty-emoji">📂</span>
                <h3>لا توجد فصول بعد في هذه الدورة</h3>
                <p>ابدأ بإضافة أول فصل دراسي ثم أضف الدروس بداخله.</p>
                <button class="btn btn-primary btn-md" (click)="openAddSectionModal()" style="margin-top: 16px">
                  ➕ إضافة أول فصل الآن
                </button>
              </div>
            } @else {
              <div class="curriculum-sections-list">
                @for (sec of activeCurriculumCourse()!.sections; track sec.id; let si = $index) {
                  <div class="section-block card-glass">
                    <div class="section-header">
                      <div class="sec-title-group">
                        <span class="sec-index">الفصل {{ si + 1 }}</span>
                        <h3>{{ sec.title }}</h3>
                        <span class="sec-count">({{ sec.lessons.length }} درس)</span>
                      </div>
                      <div class="sec-actions">
                        <button class="btn-action btn-preview" (click)="openAddLessonModal(sec)">
                          ➕ إضافة درس
                        </button>
                        <button class="btn-action btn-archive" (click)="renameSection(sec)">
                          ✏️ تعديل الاسم
                        </button>
                      </div>
                    </div>

                    <!-- Lessons in Section -->
                    @if (sec.lessons.length === 0) {
                      <div class="no-lessons">
                        <span>لا توجد دروس في هذا الفصل بعد. اضغط "إضافة درس" لإضافة محتوى نصي، فيديو، كويز، أو PDF.</span>
                      </div>
                    } @else {
                      <div class="lessons-table-wrapper">
                        <table class="lessons-sub-table">
                          <thead>
                            <tr>
                              <th>الدرس</th>
                              <th>النوع</th>
                              <th style="text-align: center">الإجراءات</th>
                            </tr>
                          </thead>
                          <tbody>
                            @for (l of sec.lessons; track l.id) {
                              <tr>
                                <td>
                                  <div class="lesson-meta-cell">
                                    <span class="lesson-type-icon">{{ getLessonEmoji(l.type) }}</span>
                                    <strong>{{ l.title }}</strong>
                                  </div>
                                </td>
                                <td>
                                  <span class="lesson-type-tag" [class]="'tag-' + l.type.toLowerCase()">
                                    {{ getLessonTypeLabel(l.type) }}
                                  </span>
                                </td>
                                <td>
                                  <div class="actions-cluster">
                                    @if (l.type === 'Video') {
                                      <button type="button" class="btn-action btn-preview" (click)="openUploadVideoModal(l)" title="رفع أو استبدال ملف الفيديو">
                                        🎥 رفع الفيديو
                                      </button>
                                    }
                                    <button class="btn-action btn-archive" (click)="deleteLesson(l.id)">
                                      🗑️ حذف
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </section>
        }

        <!-- ============================================================== -->
        <!-- TAB 1: Courses Management Table                                -->
        <!-- ============================================================== -->
        @if (activeTab() === 'courses' && !activeCurriculumCourse()) {
          <section class="section-card card-glass animate-scale-in">
            <div class="card-top-bar">
              <div class="bar-title">
                <h2>دليل الدورات التدريبية</h2>
                <span class="count-tag">{{ filteredCourses().length }} دورة</span>
              </div>

              <div class="filter-actions-group">
                <div class="filter-group">
                  <label class="filter-label">تصفية:</label>
                  <select class="custom-select" (change)="onStatusFilterChange($event)">
                    <option value="">جميع الحالات</option>
                    <option value="Published">منشورة (Published)</option>
                    <option value="Draft">مسودة (Draft)</option>
                    <option value="Archived">مؤرشفة (Archived)</option>
                  </select>
                </div>

                <button class="btn btn-primary btn-sm" (click)="openCreateCourseModal()">
                  ➕ إنشاء دورة جديدة
                </button>
              </div>
            </div>

            @if (loadingCourses()) {
              <div class="state-loading">
                <div class="spinner-purple"></div>
                <p>جاري تحميل الدورات...</p>
              </div>
            } @else if (filteredCourses().length === 0) {
              <div class="state-empty">
                <span class="empty-emoji">📂</span>
                <h3>لا توجد دورات مطابقة</h3>
                <p>لم يتم العثور على أي دورات ضمن التصنيف المحدد.</p>
              </div>
            } @else {
              <div class="table-container">
                <table class="modern-table">
                  <thead>
                    <tr>
                      <th>الدورة</th>
                      <th>المحاضر</th>
                      <th>السعر</th>
                      <th>الحالة</th>
                      <th style="text-align: center">إدارة المحتوى والإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (c of filteredCourses(); track c.id) {
                      <tr>
                        <td>
                          <div class="course-meta-cell">
                            <div class="course-icon-tag">
                              @if (c.picturePath) {
                                <img [src]="c.picturePath" [alt]="c.title" class="thumb-img">
                              } @else {
                                📖
                              }
                            </div>
                            <div>
                              <strong class="course-name">{{ c.title }}</strong>
                              <span class="course-date">تاريخ الإضافة: {{ formatDate(c.createdAt) }}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div class="instructor-cell">
                            <span class="user-avatar-tiny">{{ getInitials(c.instructor) }}</span>
                            <span>{{ c.instructor }}</span>
                          </div>
                        </td>
                        <td>
                          <span class="price-text">{{ c.price }} <small>ر.س</small></span>
                        </td>
                        <td>
                          <span
                            class="badge-pill"
                            [class.pill-published]="c.status === 'Published'"
                            [class.pill-draft]="c.status === 'Draft'"
                            [class.pill-archived]="c.status === 'Archived'">
                            <span class="pill-dot"></span>
                            {{ getStatusLabel(c.status) }}
                          </span>
                        </td>
                        <td>
                          <div class="actions-cluster">
                            <button
                              class="btn-action btn-curriculum"
                              (click)="openCurriculum(c.id)"
                              title="إدارة فصول ودروس المنهج الدراسي">
                              🛠️ المنهج والدروس
                            </button>
                            <button
                              class="btn-action btn-preview"
                              (click)="openEditCourseModal(c)"
                              title="تعديل بيانات الدورة وغلافها">
                              ✏️ تعديل
                            </button>
                            @if (c.status !== 'Published') {
                              <button
                                class="btn-action btn-publish"
                                (click)="publish(c.id)"
                                title="نشر الدورة لتكون متاحة للطلاب">
                                ✓ نشر
                              </button>
                            }
                            @if (c.status !== 'Archived') {
                              <button
                                class="btn-action btn-archive"
                                (click)="archive(c.id)"
                                title="أرشفة الدورة">
                                أرشفة
                              </button>
                            }
                            <a
                              [routerLink]="['/courses', c.id]"
                              class="btn-action btn-link-ext"
                              target="_blank"
                              title="معاينة الدورة كما تظهر للطالب">
                              عرض ↗
                            </a>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </section>
        }

        <!-- ============================================================== -->
        <!-- TAB 2: Instructors List                                        -->
        <!-- ============================================================== -->
        @if (activeTab() === 'instructors' && !activeCurriculumCourse()) {
          <section class="section-card card-glass animate-scale-in">
            <div class="card-top-bar">
              <div class="bar-title">
                <h2>قائمة المحاضرين المعتمدين</h2>
                <span class="count-tag">{{ instructors().length }} محاضر</span>
              </div>
              <button class="btn btn-primary btn-sm" (click)="activeTab.set('invite')">
                ➕ دعوة محاضر جديد
              </button>
            </div>

            @if (loadingInstructors()) {
              <div class="state-loading">
                <div class="spinner-purple"></div>
                <p>جاري تحميل المحاضرين...</p>
              </div>
            } @else if (instructors().length === 0) {
              <div class="state-empty">
                <span class="empty-emoji">👨‍🏫</span>
                <h3>لا يوجد محاضرون بعد</h3>
                <p>ابدأ بدعوة محاضرين جدد للانضمام إلى المنصة.</p>
              </div>
            } @else {
              <div class="instructors-grid">
                @for (inst of instructors(); track inst.id) {
                  <div class="instructor-card card-glass">
                    <div class="inst-header">
                      <div class="inst-avatar">
                        {{ getInitials(inst.displayName || inst.firstName) }}
                      </div>
                      <div>
                        <h3>{{ inst.displayName || (inst.firstName + ' ' + inst.lastName) }}</h3>
                        <span class="inst-email" dir="ltr">{{ inst.email || '—' }}</span>
                      </div>
                    </div>

                    <div class="inst-status">
                      <span
                        class="badge-pill"
                        [class.pill-published]="!inst.isDeleted"
                        [class.pill-archived]="inst.isDeleted">
                        <span class="pill-dot"></span>
                        {{ inst.isDeleted ? 'محذوف' : 'نشط' }}
                      </span>

                      @if (!inst.isDeleted) {
                        <button class="btn-action btn-archive" (click)="deleteInst(inst.id)">
                          حذف
                        </button>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </section>
        }

        <!-- ============================================================== -->
        <!-- TAB 3: Invite Instructor                                       -->
        <!-- ============================================================== -->
        @if (activeTab() === 'invite' && !activeCurriculumCourse()) {
          <section class="section-card card-glass animate-scale-in">
            <div class="card-top-bar">
              <div class="bar-title">
                <h2>دعوة محاضر جديد للنظام</h2>
                <span class="count-tag">صلاحيات المحاضر</span>
              </div>
            </div>

            <form class="invite-container" (ngSubmit)="sendInvite()">
              <p class="invite-desc">
                أدخل بيانات المحاضر لإرسال رابط دعوة وتفعيل حسابه مباشرة ليتمكن من رفع وإدارة دوراته.
              </p>

              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">الاسم الأول *</label>
                  <input
                    type="text"
                    class="form-input"
                    placeholder="مثال: أحمد"
                    [(ngModel)]="inviteForm.firstName"
                    name="firstName"
                    required>
                </div>

                <div class="form-group">
                  <label class="form-label">الاسم الأخير *</label>
                  <input
                    type="text"
                    class="form-input"
                    placeholder="مثال: علي"
                    [(ngModel)]="inviteForm.lastName"
                    name="lastName"
                    required>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">البريد الإلكتروني للمحاضر *</label>
                <input
                  type="email"
                  class="form-input"
                  placeholder="instructor@domain.com"
                  [(ngModel)]="inviteForm.email"
                  name="email"
                  required
                  dir="ltr">
              </div>

              <div class="form-group">
                <label class="form-label">نبذة تعريفية (Bio) *</label>
                <textarea
                  class="form-input"
                  rows="4"
                  placeholder="اكتب نبذة مختصرة عن خبرات المحاضر وتخصصه الأكاديمي..."
                  [(ngModel)]="inviteForm.bio"
                  name="bio"
                  required></textarea>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn btn-primary btn-lg" [disabled]="inviting()">
                  {{ inviting() ? 'جاري إرسال الدعوة...' : '🚀 إرسال دعوة المحاضر الآن' }}
                </button>
              </div>
            </form>
          </section>
        }

      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL: Create / Edit Course                                    -->
    <!-- ============================================================== -->
    @if (showCourseModal()) {
      <div class="modal-overlay animate-fade-in" (click)="closeCourseModal()">
        <div class="modal-card card-glass animate-scale-in" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ courseModalMode() === 'create' ? '➕ إنشاء دورة تدريبية جديدة' : '✏️ تعديل بيانات الدورة' }}</h3>
            <button class="modal-close" (click)="closeCourseModal()">✕</button>
          </div>

          <form (ngSubmit)="saveCourse()">
            <div class="form-group">
              <label class="form-label">عنوان الدورة التدريبية *</label>
              <input
                type="text"
                class="form-input"
                placeholder="مثال: دورة احتراف بايثون من الصفر"
                [(ngModel)]="courseForm.title"
                name="title"
                required>
            </div>

            <div class="form-group">
              <label class="form-label">وصف الدورة *</label>
              <textarea
                class="form-input"
                rows="4"
                placeholder="تفاصيل وشرح أهداف الدورة وما سيتعلمه الطالب..."
                [(ngModel)]="courseForm.description"
                name="description"
                required></textarea>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">السعر الأساسي (ر.س) *</label>
                <input
                  type="number"
                  class="form-input"
                  placeholder="مثال: 150"
                  [(ngModel)]="courseForm.price"
                  name="price"
                  required
                  min="0">
              </div>

              <div class="form-group">
                <label class="form-label">سعر التجديد (ر.س) *</label>
                <input
                  type="number"
                  class="form-input"
                  placeholder="مثال: 50"
                  [(ngModel)]="courseForm.renewalPrice"
                  name="renewalPrice"
                  required
                  min="0">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">صورة الغلاف (Cover Picture)</label>
              <input
                type="file"
                class="form-input"
                accept="image/*"
                (change)="onCourseImageSelect($event)">
              <small style="color:var(--gray-500); font-size:0.75rem; display:block; margin-top:4px">
                اختر صورة بدقة عالية تعبر عن محتوى الدورة (PNG, JPG).
              </small>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" (click)="closeCourseModal()">إلغاء</button>
              <button type="submit" class="btn btn-primary" [disabled]="savingCourse()">
                {{ savingCourse() ? 'جاري الحفظ...' : 'حفظ الدورة' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- ============================================================== -->
    <!-- MODAL: Add / Edit Section                                      -->
    <!-- ============================================================== -->
    @if (showSectionModal()) {
      <div class="modal-overlay animate-fade-in" (click)="showSectionModal.set(false)">
        <div class="modal-card card-glass animate-scale-in" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingSectionId() ? '✏️ تعديل اسم الفصل' : '➕ إضافة فصل دراسي جديد' }}</h3>
            <button class="modal-close" (click)="showSectionModal.set(false)">✕</button>
          </div>

          <form (ngSubmit)="saveSection()">
            <div class="form-group">
              <label class="form-label">عنوان الفصل *</label>
              <input
                type="text"
                class="form-input"
                placeholder="مثال: الفصل الأول: مقدمة وإعداد البيئة"
                [(ngModel)]="sectionTitleInput"
                name="secTitle"
                required>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" (click)="showSectionModal.set(false)">إلغاء</button>
              <button type="submit" class="btn btn-primary" [disabled]="savingSection()">
                {{ savingSection() ? 'جاري الحفظ...' : 'حفظ الفصل' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- ============================================================== -->
    <!-- MODAL: Add Lesson to Section (Multi-type: Written/Video/Quiz/PDF)-->
    <!-- ============================================================== -->
    @if (showLessonModal()) {
      <div class="modal-overlay animate-fade-in" (click)="closeLessonModal()">
        <div class="modal-card card-glass modal-lg animate-scale-in" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3>➕ إضافة درس جديد</h3>
              <p style="font-size:0.8rem; color:var(--gray-500)">الفصل: {{ activeSectionForLesson()?.title }}</p>
            </div>
            <button class="modal-close" (click)="closeLessonModal()">✕</button>
          </div>

          <form (ngSubmit)="saveLesson()">
            <div class="form-group">
              <label class="form-label">عنوان الدرس *</label>
              <input
                type="text"
                class="form-input"
                placeholder="مثال: المتغيرات وأنواع البيانات"
                [(ngModel)]="lessonTitleInput"
                name="lessonTitle"
                required>
            </div>

            <!-- Lesson Type Tabs -->
            <div class="form-group">
              <label class="form-label">نوع الدرس *</label>
              <div class="lesson-type-tabs">
                <button
                  type="button"
                  class="type-tab"
                  [class.active]="lessonTypeInput === 'Written'"
                  (click)="lessonTypeInput = 'Written'">
                  📝 درس نصي
                </button>
                <button
                  type="button"
                  class="type-tab"
                  [class.active]="lessonTypeInput === 'Video'"
                  (click)="lessonTypeInput = 'Video'">
                  🎥 درس فيديو
                </button>
                <button
                  type="button"
                  class="type-tab"
                  [class.active]="lessonTypeInput === 'Quiz'"
                  (click)="lessonTypeInput = 'Quiz'">
                  ❓ اختبار تقييمي
                </button>
                <button
                  type="button"
                  class="type-tab"
                  [class.active]="lessonTypeInput === 'Pdf'"
                  (click)="lessonTypeInput = 'Pdf'">
                  📄 ملف PDF
                </button>
              </div>
            </div>

            <!-- TYPE: Written -->
            @if (lessonTypeInput === 'Written') {
              <div class="form-group">
                <label class="form-label">محتوى الدرس النصي *</label>
                <textarea
                  class="form-input"
                  rows="6"
                  placeholder="اكتب محتوى الدرس بالتفصيل..."
                  [(ngModel)]="writtenContentInput"
                  name="writtenContent"
                  required></textarea>
              </div>
            }

            <!-- TYPE: Video -->
            @if (lessonTypeInput === 'Video') {
              <div class="form-group">
                <label class="form-label">ملف الفيديو للمحاضرة *</label>
                <div class="video-upload-dropzone" [class.has-file]="!!videoFile">
                  <input
                    type="file"
                    id="videoFileInput"
                    class="video-file-input"
                    accept="video/mp4,video/quicktime,video/webm,video/x-matroska,video/*"
                    (change)="onVideoFileSelect($event)">
                  <label for="videoFileInput" class="dropzone-label">
                    @if (!videoFile) {
                      <div class="dropzone-empty">
                        <span class="drop-icon">🎥</span>
                        <h4>اضغط هنا لاختيار ملف الفيديو أو اسحبه وأفلته</h4>
                        <p class="drop-hint">يدعم صيغ MP4, MOV, MKV, WebM حتى 2 جيجابايت</p>
                      </div>
                    } @else {
                      <div class="dropzone-selected">
                        <span class="file-icon">🎬</span>
                        <div class="file-info">
                          <strong>{{ videoFile.name }}</strong>
                          <span class="file-size">{{ formatFileSize(videoFile.size) }}</span>
                        </div>
                        <button type="button" class="btn-remove-file" (click)="clearVideoFile($event)">✕ تغيير الملف</button>
                      </div>
                    }
                  </label>
                </div>

                @if (videoUploading()) {
                  <div class="video-progress-wrapper animate-fade-in">
                    <div class="progress-labels">
                      <span>🚀 جاري رفع وتشفير الفيديو على Bunny Stream...</span>
                      <span class="percent-text">{{ videoUploadProgress() }}%</span>
                    </div>
                    <div class="progress-bar-track">
                      <div class="progress-bar-fill" [style.width.%]="videoUploadProgress()"></div>
                    </div>
                    <small class="upload-note">يرجى الانتظار حتى اكتمال النقل (يمكنك متابعة النسبة المئوية أعلاه)</small>
                  </div>
                }
              </div>
            }

            <!-- TYPE: PDF -->
            @if (lessonTypeInput === 'Pdf') {
              <div class="form-group">
                <label class="form-label">ملف الـ PDF *</label>
                <input
                  type="file"
                  class="form-input"
                  accept="application/pdf"
                  (change)="onPdfFileSelect($event)"
                  required>
                <small style="color:var(--gray-500); font-size:0.75rem; display:block; margin-top:4px">
                  اختر ملف PDF للملخص أو المحاضرة.
                </small>
              </div>
            }

            <!-- TYPE: Quiz -->
            @if (lessonTypeInput === 'Quiz') {
              <div class="quiz-builder-section">
                <div class="form-group">
                  <label class="form-label">نسبة النجاح المطلوبة (%):</label>
                  <input
                    type="number"
                    class="form-input"
                    style="max-width: 160px"
                    [(ngModel)]="quizPassingScore"
                    name="passingScore"
                    min="1"
                    max="100"
                    required>
                </div>

                <div class="quiz-questions-wrapper">
                  <div class="questions-header">
                    <h4>أسئلة الاختبار ({{ quizQuestions.length }})</h4>
                    <button type="button" class="btn btn-outline btn-sm" (click)="addQuestion()">
                      ➕ إضافة سؤال جديد
                    </button>
                  </div>

                  @for (q of quizQuestions; track $index; let qi = $index) {
                    <div class="question-builder-card">
                      <div class="q-card-head">
                        <strong>السؤال {{ qi + 1 }}</strong>
                        @if (quizQuestions.length > 1) {
                          <button type="button" class="btn-text-danger" (click)="removeQuestion(qi)">✕ حذف</button>
                        }
                      </div>

                      <input
                        type="text"
                        class="form-input"
                        placeholder="نص السؤال..."
                        [(ngModel)]="q.prompt"
                        [name]="'q_prompt_' + qi"
                        required>

                      <div class="answers-builder-list">
                        <label class="form-label" style="margin-top:8px">خيارات الإجابة (حدد الإجابة الصحيحة):</label>
                        @for (a of q.answers; track $index; let ai = $index) {
                          <div class="answer-row">
                            <input
                              type="radio"
                              [name]="'correct_' + qi"
                              [checked]="a.isCorrect"
                              (change)="setCorrectAnswer(qi, ai)">
                            <input
                              type="text"
                              class="form-input"
                              placeholder="خيار الإجابة..."
                              [(ngModel)]="a.text"
                              [name]="'ans_' + qi + '_' + ai"
                              required>
                            @if (q.answers.length > 2) {
                              <button type="button" class="btn-text-danger" (click)="removeAnswer(qi, ai)">✕</button>
                            }
                          </div>
                        }
                        <button type="button" class="btn btn-link btn-sm" (click)="addAnswer(qi)">
                          + إضافة خيار إضافي
                        </button>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" (click)="closeLessonModal()" [disabled]="videoUploading()">إلغاء</button>
              <button type="submit" class="btn btn-primary" [disabled]="savingLesson() || videoUploading()">
                {{ videoUploading() ? ('جاري رفع الفيديو (' + videoUploadProgress() + '%)...') : (savingLesson() ? 'جاري الحفظ...' : 'حفظ وإضافة الدرس') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- ============================================================== -->
    <!-- MODAL: Upload Video to Existing Lesson                         -->
    <!-- ============================================================== -->
    @if (showUploadVideoModal()) {
      <div class="modal-overlay animate-fade-in" (click)="closeUploadVideoModal()">
        <div class="modal-card card-glass animate-scale-in" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3>🎥 رفع / تحديث فيديو الدرس</h3>
              <p style="font-size:0.8rem; color:var(--gray-500)">{{ targetLessonForVideo()?.title }}</p>
            </div>
            <button class="modal-close" (click)="closeUploadVideoModal()">✕</button>
          </div>

          <form (ngSubmit)="startStandaloneVideoUpload()">
            <div class="form-group">
              <label class="form-label">اختر ملف الفيديو *</label>
              <div class="video-upload-dropzone" [class.has-file]="!!standaloneVideoFile">
                <input
                  type="file"
                  id="standaloneVideoInput"
                  class="video-file-input"
                  accept="video/mp4,video/quicktime,video/webm,video/x-matroska,video/*"
                  (change)="onStandaloneVideoSelect($event)">
                <label for="standaloneVideoInput" class="dropzone-label">
                  @if (!standaloneVideoFile) {
                    <div class="dropzone-empty">
                      <span class="drop-icon">🎥</span>
                      <h4>اضغط هنا لاختيار ملف الفيديو أو اسحبه هنا</h4>
                      <p class="drop-hint">يدعم صيغ MP4, MOV, MKV, WebM حتى 2 جيجابايت</p>
                    </div>
                  } @else {
                    <div class="dropzone-selected">
                      <span class="file-icon">🎬</span>
                      <div class="file-info">
                        <strong>{{ standaloneVideoFile.name }}</strong>
                        <span class="file-size">{{ formatFileSize(standaloneVideoFile.size) }}</span>
                      </div>
                      <button type="button" class="btn-remove-file" (click)="clearStandaloneVideo($event)">✕ تغيير الملف</button>
                    </div>
                  }
                </label>
              </div>

              @if (videoUploading()) {
                <div class="video-progress-wrapper animate-fade-in">
                  <div class="progress-labels">
                    <span>🚀 جاري رفع الفيديو (Bunny Stream)...</span>
                    <span class="percent-text">{{ videoUploadProgress() }}%</span>
                  </div>
                  <div class="progress-bar-track">
                    <div class="progress-bar-fill" [style.width.%]="videoUploadProgress()"></div>
                  </div>
                  <small class="upload-note">يرجى الانتظار حتى اكتمال النقل والمعالجة</small>
                </div>
              }
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" (click)="closeUploadVideoModal()" [disabled]="videoUploading()">إلغاء</button>
              <button type="submit" class="btn btn-primary" [disabled]="!standaloneVideoFile || videoUploading()">
                {{ videoUploading() ? ('جاري الرفع (' + videoUploadProgress() + '%)...') : '🚀 بدء رفع الفيديو الآن' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .dashboard-page {
      padding: var(--space-8) var(--space-4) var(--space-20);
      min-height: calc(100vh - var(--navbar-height));
      background: radial-gradient(ellipse at top right, rgba(139, 92, 246, 0.08) 0%, transparent 70%),
                  radial-gradient(ellipse at bottom left, rgba(59, 130, 246, 0.05) 0%, transparent 60%);
    }

    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    /* Top Hero Header */
    .dash-hero {
      padding: var(--space-8);
      border-radius: var(--radius-3xl);
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 243, 255, 0.85) 100%);
      border: 1px solid rgba(139, 92, 246, 0.2);
      box-shadow: 0 12px 36px rgba(109, 40, 217, 0.07);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-8);
      margin-bottom: var(--space-8);
      flex-wrap: wrap;
    }

    .hero-right {
      display: flex;
      align-items: center;
      gap: var(--space-5);
    }

    .avatar-glow {
      width: 76px;
      height: 76px;
      border-radius: var(--radius-2xl);
      background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(124, 58, 237, 0.35);
      flex-shrink: 0;
    }

    .avatar-icon { font-size: 2.2rem; }

    .hero-info h1 {
      font-size: var(--font-size-2xl);
      font-weight: 900;
      color: var(--gray-900);
      margin-bottom: var(--space-1);
    }

    .hero-info p {
      color: var(--gray-500);
      font-size: var(--font-size-sm);
    }

    .role-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      background: rgba(124, 58, 237, 0.1);
      border-radius: var(--radius-full);
      color: #6d28d9;
      font-size: var(--font-size-xs);
      font-weight: 800;
      margin-bottom: var(--space-2);
    }

    .role-dot {
      width: 6px;
      height: 6px;
      background: #7c3aed;
      border-radius: 50%;
    }

    .hero-stats {
      display: flex;
      gap: var(--space-4);
      flex-wrap: wrap;
    }

    .stat-box {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-5);
      background: white;
      border-radius: var(--radius-2xl);
      border: 1px solid rgba(139, 92, 246, 0.12);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    }

    .stat-icon-wrapper {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-xl);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      font-weight: 900;
    }

    .stat-icon-wrapper.purple { background: #f5f3ff; color: #7c3aed; }
    .stat-icon-wrapper.blue { background: #eff6ff; color: #2563eb; }
    .stat-icon-wrapper.green { background: #ecfdf5; color: #059669; }

    .stat-num {
      display: block;
      font-size: var(--font-size-xl);
      font-weight: 900;
      color: var(--gray-900);
      line-height: 1.1;
    }

    .stat-title {
      font-size: var(--font-size-xs);
      color: var(--gray-500);
      font-weight: 700;
    }

    /* Tabs Bar */
    .tabs-nav-bar {
      display: flex;
      gap: var(--space-3);
      margin-bottom: var(--space-8);
      padding: 6px;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(16px);
      border-radius: var(--radius-2xl);
      border: 1px solid rgba(139, 92, 246, 0.15);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
      overflow-x: auto;
    }

    .nav-tab {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-6);
      border-radius: var(--radius-xl);
      font-size: var(--font-size-sm);
      font-weight: 700;
      color: var(--gray-600);
      background: transparent;
      border: none;
      cursor: pointer;
      transition: all var(--transition-fast);
      white-space: nowrap;
    }

    .nav-tab:hover {
      color: var(--primary-700);
      background: var(--primary-50);
    }

    .nav-tab.active {
      background: linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%) !important;
      color: #ffffff !important;
      box-shadow: 0 6px 20px rgba(109, 40, 217, 0.35);
    }

    .tab-badge {
      font-size: 0.75rem;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: var(--radius-full);
      background: rgba(0, 0, 0, 0.08);
      color: inherit;
    }

    .nav-tab.active .tab-badge {
      background: rgba(255, 255, 255, 0.25);
      color: #ffffff;
    }

    /* Section Card */
    .section-card {
      padding: var(--space-8);
      border-radius: var(--radius-3xl);
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid rgba(139, 92, 246, 0.15);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
    }

    .card-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-6);
      flex-wrap: wrap;
      gap: var(--space-4);
      padding-bottom: var(--space-5);
      border-bottom: 1px solid var(--gray-100);
    }

    .bar-title {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      flex-wrap: wrap;
    }

    .bar-title h2 {
      font-size: var(--font-size-xl);
      font-weight: 800;
      color: var(--gray-900);
    }

    .count-tag {
      background: var(--primary-50);
      color: var(--primary-700);
      font-size: var(--font-size-xs);
      font-weight: 800;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      border: 1px solid var(--primary-100);
    }

    .filter-actions-group {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      flex-wrap: wrap;
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .filter-label {
      font-size: var(--font-size-sm);
      font-weight: 700;
      color: var(--gray-600);
    }

    .custom-select {
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-xl);
      border: 1px solid var(--gray-200);
      background: white;
      font-family: inherit;
      font-size: var(--font-size-sm);
      font-weight: 600;
      color: var(--gray-800);
      outline: none;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .custom-select:focus {
      border-color: var(--primary-500);
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
    }

    /* Table Styles */
    .table-container {
      overflow-x: auto;
    }

    .modern-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0 8px;
      text-align: right;
    }

    .modern-table th {
      padding: var(--space-3) var(--space-5);
      font-size: var(--font-size-xs);
      font-weight: 800;
      color: var(--gray-500);
      text-transform: uppercase;
    }

    .modern-table tbody tr {
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
      border-radius: var(--radius-2xl);
      transition: all var(--transition-fast);
    }

    .modern-table tbody tr:hover {
      box-shadow: 0 6px 18px rgba(124, 58, 237, 0.08);
      background: #faf8ff;
    }

    .modern-table td {
      padding: var(--space-4) var(--space-5);
      font-size: var(--font-size-sm);
      vertical-align: middle;
      border-top: 1px solid var(--gray-100);
      border-bottom: 1px solid var(--gray-100);
    }

    .modern-table td:first-child {
      border-top-right-radius: var(--radius-2xl);
      border-bottom-right-radius: var(--radius-2xl);
      border-right: 1px solid var(--gray-100);
    }

    .modern-table td:last-child {
      border-top-left-radius: var(--radius-2xl);
      border-bottom-left-radius: var(--radius-2xl);
      border-left: 1px solid var(--gray-100);
    }

    .course-meta-cell {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .course-icon-tag {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-lg);
      background: var(--primary-50);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;
      overflow: hidden;
    }

    .thumb-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .course-name {
      display: block;
      font-weight: 800;
      color: var(--gray-900);
      font-size: var(--font-size-base);
    }

    .course-date {
      display: block;
      font-size: var(--font-size-xs);
      color: var(--gray-400);
    }

    .instructor-cell {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-weight: 600;
      color: var(--gray-700);
    }

    .user-avatar-tiny {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #ede9fe;
      color: #6d28d9;
      font-size: 0.75rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .price-text {
      font-size: var(--font-size-base);
      font-weight: 800;
      color: var(--primary-700);
    }

    .price-text small {
      font-size: 0.75rem;
      color: var(--gray-500);
      font-weight: 600;
    }

    /* Badges */
    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: 800;
    }

    .pill-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    .pill-published { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
    .pill-published .pill-dot { background: #10b981; }

    .pill-draft { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
    .pill-draft .pill-dot { background: #f59e0b; }

    .pill-archived { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
    .pill-archived .pill-dot { background: #94a3b8; }

    /* Action Buttons */
    .actions-cluster {
      display: flex;
      justify-content: center;
      gap: var(--space-2);
      flex-wrap: wrap;
    }

    .btn-action {
      padding: 6px 14px;
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: 700;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all var(--transition-fast);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      text-decoration: none;
    }

    .btn-curriculum {
      background: linear-gradient(135deg, #ede9fe 0%, #e0e7ff 100%);
      color: #5b21b6;
      border-color: #c4b5fd;
    }
    .btn-curriculum:hover {
      background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
      color: white;
    }

    .btn-publish {
      background: #10b981;
      color: white;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
    }
    .btn-publish:hover { background: #059669; }

    .btn-archive {
      background: #fff1f2;
      color: #e11d48;
      border-color: #fecdd3;
    }
    .btn-archive:hover { background: #ffe4e6; }

    .btn-preview {
      background: #f5f3ff;
      color: #6d28d9;
      border-color: #ddd6fe;
    }
    .btn-preview:hover { background: #ede9fe; color: #5b21b6; }

    .btn-link-ext {
      background: transparent;
      color: var(--gray-600);
      border-color: var(--gray-200);
    }
    .btn-link-ext:hover { background: var(--gray-50); color: var(--gray-900); }

    /* Curriculum View Sections */
    .curriculum-sections-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .section-block {
      padding: var(--space-6);
      border-radius: var(--radius-2xl);
      border: 1px solid rgba(139, 92, 246, 0.15);
      background: white;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-4);
      flex-wrap: wrap;
      gap: var(--space-3);
    }

    .sec-title-group {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .sec-index {
      font-size: var(--font-size-xs);
      font-weight: 800;
      padding: 3px 8px;
      border-radius: var(--radius-lg);
      background: var(--primary-100);
      color: var(--primary-800);
    }

    .section-header h3 {
      font-size: var(--font-size-lg);
      font-weight: 800;
      color: var(--gray-900);
    }

    .sec-count {
      color: var(--gray-400);
      font-size: var(--font-size-xs);
    }

    .sec-actions {
      display: flex;
      gap: var(--space-2);
    }

    .no-lessons {
      padding: var(--space-4);
      background: var(--gray-50);
      border-radius: var(--radius-xl);
      text-align: center;
      color: var(--gray-500);
      font-size: var(--font-size-sm);
    }

    .lessons-table-wrapper {
      overflow-x: auto;
    }

    .lessons-sub-table {
      width: 100%;
      border-collapse: collapse;
      text-align: right;
    }

    .lessons-sub-table th {
      padding: var(--space-2) var(--space-3);
      font-size: var(--font-size-xs);
      color: var(--gray-400);
      border-bottom: 1px solid var(--gray-100);
    }

    .lessons-sub-table td {
      padding: var(--space-3);
      border-bottom: 1px solid var(--gray-50);
      font-size: var(--font-size-sm);
      vertical-align: middle;
    }

    .lesson-meta-cell {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .lesson-type-icon { font-size: 1.2rem; }

    .lesson-type-tag {
      font-size: var(--font-size-xs);
      font-weight: 700;
      padding: 2px 8px;
      border-radius: var(--radius-md);
    }

    .tag-written { background: #fdf2f8; color: #db2777; }
    .tag-video { background: #eff6ff; color: #2563eb; }
    .tag-quiz { background: #fefce8; color: #ca8a04; }
    .tag-pdf { background: #ecfdf5; color: #059669; }

    /* Instructors Grid */
    .instructors-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: var(--space-4);
    }

    .instructor-card {
      padding: var(--space-5);
      border-radius: var(--radius-2xl);
      border: 1px solid rgba(139, 92, 246, 0.12);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: var(--space-4);
    }

    .inst-header {
      display: flex;
      align-items: center;
      gap: var(--space-4);
    }

    .inst-avatar {
      width: 52px;
      height: 52px;
      border-radius: var(--radius-xl);
      background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
      color: #6d28d9;
      font-size: 1.1rem;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .inst-header h3 {
      font-size: var(--font-size-base);
      font-weight: 800;
      color: var(--gray-900);
      margin-bottom: 2px;
    }

    .inst-email {
      font-size: var(--font-size-xs);
      color: var(--gray-500);
    }

    .inst-status {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: var(--space-3);
      border-top: 1px solid var(--gray-100);
    }

    /* Modals */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(17, 24, 39, 0.6);
      backdrop-filter: blur(8px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-4);
    }

    .modal-card {
      width: 100%;
      max-width: 540px;
      max-height: 90vh;
      overflow-y: auto;
      background: white;
      border-radius: var(--radius-3xl);
      padding: var(--space-8);
      box-shadow: var(--shadow-2xl);
      border: 1px solid rgba(139, 92, 246, 0.2);
    }

    .modal-card.modal-lg {
      max-width: 720px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-6);
      padding-bottom: var(--space-4);
      border-bottom: 1px solid var(--gray-100);
    }

    .modal-header h3 {
      font-size: var(--font-size-xl);
      font-weight: 900;
      color: var(--gray-900);
    }

    .modal-close {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background: var(--gray-100);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      color: var(--gray-600);
    }
    .modal-close:hover { background: #fee2e2; color: #ef4444; }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      margin-top: var(--space-6);
      padding-top: var(--space-4);
      border-top: 1px solid var(--gray-100);
    }

    .lesson-type-tabs {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-2);
      margin-top: var(--space-2);
    }

    .type-tab {
      padding: var(--space-3) var(--space-2);
      border-radius: var(--radius-xl);
      border: 1px solid var(--gray-200);
      background: white;
      font-size: var(--font-size-xs);
      font-weight: 700;
      cursor: pointer;
      transition: all var(--transition-fast);
      text-align: center;
    }

    .type-tab:hover { background: var(--primary-50); border-color: var(--primary-200); }

    .type-tab.active {
      background: var(--primary-gradient);
      color: white;
      border-color: transparent;
      box-shadow: 0 4px 12px rgba(109, 40, 217, 0.25);
    }

    .type-info-box {
      display: flex;
      gap: var(--space-3);
      padding: var(--space-4);
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: var(--radius-xl);
      color: #1e40af;
      font-size: var(--font-size-sm);
    }

    /* Video Upload Dropzone */
    .video-upload-dropzone {
      position: relative;
      border: 2px dashed #c4b5fd;
      border-radius: var(--radius-xl);
      background: #fbfbfe;
      padding: var(--space-6) var(--space-4);
      text-align: center;
      transition: all var(--transition-base);
      cursor: pointer;
    }

    .video-upload-dropzone:hover {
      border-color: #7c3aed;
      background: #f5f3ff;
    }

    .video-upload-dropzone.has-file {
      border-style: solid;
      border-color: #8b5cf6;
      background: #faf5ff;
    }

    .video-file-input {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
      z-index: 2;
    }

    .dropzone-label {
      cursor: pointer;
      display: block;
    }

    .dropzone-empty .drop-icon {
      font-size: 2.75rem;
      display: block;
      margin-bottom: var(--space-2);
    }

    .dropzone-empty h4 {
      font-size: var(--font-size-base);
      font-weight: 700;
      color: var(--gray-800);
      margin-bottom: var(--space-1);
    }

    .dropzone-empty .drop-hint {
      font-size: var(--font-size-xs);
      color: var(--gray-500);
    }

    .dropzone-selected {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
      padding: var(--space-2) var(--space-4);
    }

    .dropzone-selected .file-icon {
      font-size: 2rem;
    }

    .file-info {
      text-align: right;
      flex: 1;
    }

    .file-info strong {
      display: block;
      font-size: var(--font-size-sm);
      color: var(--gray-900);
      word-break: break-all;
    }

    .file-size {
      font-size: var(--font-size-xs);
      color: var(--primary-700);
      font-weight: 700;
    }

    .btn-remove-file {
      position: relative;
      z-index: 3;
      background: white;
      border: 1px solid var(--gray-200);
      padding: 6px 12px;
      border-radius: var(--radius-lg);
      font-size: var(--font-size-xs);
      font-weight: 700;
      color: #dc2626;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .btn-remove-file:hover {
      background: #fef2f2;
      border-color: #fecaca;
    }

    .video-progress-wrapper {
      margin-top: var(--space-4);
      background: #fdf4ff;
      border: 1px solid #f0abfc;
      border-radius: var(--radius-xl);
      padding: var(--space-4);
    }

    .progress-labels {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-2);
      font-size: var(--font-size-xs);
      font-weight: 700;
      color: #86198f;
    }

    .progress-bar-track {
      width: 100%;
      height: 10px;
      background: #fae8ff;
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #9333ea, #c026d3);
      border-radius: var(--radius-full);
      transition: width 0.3s ease;
    }

    .upload-note {
      display: block;
      margin-top: var(--space-2);
      color: #a21caf;
      font-size: 0.75rem;
      text-align: center;
    }

    .quiz-builder-section {
      background: var(--gray-50);
      padding: var(--space-5);
      border-radius: var(--radius-2xl);
      border: 1px solid var(--gray-200);
    }

    .questions-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-4);
    }

    .question-builder-card {
      background: white;
      padding: var(--space-4);
      border-radius: var(--radius-xl);
      border: 1px solid var(--gray-200);
      margin-bottom: var(--space-4);
    }

    .q-card-head {
      display: flex;
      justify-content: space-between;
      margin-bottom: var(--space-2);
      font-size: var(--font-size-sm);
    }

    .btn-text-danger {
      background: transparent;
      border: none;
      color: #dc2626;
      cursor: pointer;
      font-size: var(--font-size-xs);
      font-weight: 700;
    }

    .answer-row {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin-top: var(--space-2);
    }

    .btn-link {
      background: transparent;
      border: none;
      color: var(--primary-700);
      cursor: pointer;
      font-weight: 700;
      margin-top: var(--space-2);
    }

    /* Forms */
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }

    .invite-container { max-width: 640px; }
    .invite-desc { color: var(--gray-500); font-size: var(--font-size-sm); margin-bottom: var(--space-6); }
    .form-actions { margin-top: var(--space-6); }

    /* Alerts and States */
    .alert-box {
      padding: var(--space-4) var(--space-6);
      border-radius: var(--radius-xl);
      font-weight: 700;
      font-size: var(--font-size-sm);
      margin-bottom: var(--space-6);
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .alert-box.success { background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; }
    .alert-box.error { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }

    .state-loading, .state-empty {
      text-align: center;
      padding: var(--space-16) 0;
      color: var(--gray-500);
    }

    .spinner-purple {
      width: 44px;
      height: 44px;
      border: 3px solid #ede9fe;
      border-top-color: #7c3aed;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto var(--space-4);
    }

    .empty-emoji { font-size: 3rem; display: block; margin-bottom: var(--space-2); }

    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 768px) {
      .dash-hero { flex-direction: column; align-items: flex-start; }
      .form-grid { grid-template-columns: 1fr; }
      .lesson-type-tabs { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class AdminComponent implements OnInit {
  auth = inject(AuthService);
  private api = inject(ApiService);

  activeTab = signal<DashboardTab>('courses');
  courses = signal<AdminCourseListItem[]>([]);
  instructors = signal<any[]>([]);
  selectedStatus = signal<CourseStatus | ''>('');

  loadingCourses = signal(false);
  loadingInstructors = signal(false);
  inviting = signal(false);

  feedback = signal('');
  feedbackType = signal<'success' | 'error'>('success');

  // Course Modal (Create / Edit)
  showCourseModal = signal(false);
  courseModalMode = signal<'create' | 'edit'>('create');
  editingCourseId = signal<string | null>(null);
  savingCourse = signal(false);
  courseImageFile: File | null = null;
  courseForm: CreateCourseRequest = {
    title: '',
    description: '',
    price: 0,
    renewalPrice: 0
  };

  // Curriculum Builder (Course Detail with Sections & Lessons)
  activeCurriculumCourse = signal<CourseDetail | null>(null);
  loadingCurriculum = signal(false);

  // Section Modal
  showSectionModal = signal(false);
  editingSectionId = signal<string | null>(null);
  sectionTitleInput = '';
  savingSection = signal(false);

  // Lesson Modal
  showLessonModal = signal(false);
  activeSectionForLesson = signal<SectionResponse | null>(null);
  lessonTitleInput = '';
  lessonTypeInput: LessonType = 'Written';
  writtenContentInput = '';
  pdfFile: File | null = null;
  videoFile: File | null = null;
  videoUploading = signal(false);
  videoUploadProgress = signal(0);
  quizPassingScore = 70;
  quizQuestions: QuestionDTO[] = [];
  savingLesson = signal(false);

  // Standalone video modal
  showUploadVideoModal = signal(false);
  targetLessonForVideo = signal<{ id: string; title: string } | null>(null);
  standaloneVideoFile: File | null = null;

  // Invite Form
  inviteForm: InviteInstructorRequest = {
    firstName: '',
    lastName: '',
    email: '',
    bio: ''
  };

  ngOnInit() {
    this.loadCourses();
    this.loadInstructors();
  }

  publishedCount(): number {
    return this.courses().filter(c => c.status === 'Published').length;
  }

  filteredCourses(): AdminCourseListItem[] {
    const status = this.selectedStatus();
    if (!status) return this.courses();
    return this.courses().filter(c => c.status === status);
  }

  loadCourses(status?: CourseStatus) {
    this.loadingCourses.set(true);
    this.api.getAdminCourses(status, undefined, 50).subscribe({
      next: (res) => {
        this.courses.set(res.courses || []);
        this.loadingCourses.set(false);
      },
      error: (err) => {
        this.loadingCourses.set(false);
        this.showFeedback(extractErrorMessage(err), 'error');
      }
    });
  }

  loadInstructors() {
    this.loadingInstructors.set(true);
    this.api.getAdminInstructors(undefined, undefined, 50).subscribe({
      next: (res) => {
        this.instructors.set(res.instructors || []);
        this.loadingInstructors.set(false);
      },
      error: () => this.loadingInstructors.set(false)
    });
  }

  onStatusFilterChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedStatus.set(val as CourseStatus | '');
  }

  // ==============================================================
  // Course Management (Create / Edit / Publish / Archive)
  // ==============================================================
  openCreateCourseModal() {
    this.courseModalMode.set('create');
    this.editingCourseId.set(null);
    this.courseForm = { title: '', description: '', price: 0, renewalPrice: 0 };
    this.courseImageFile = null;
    this.showCourseModal.set(true);
  }

  openEditCourseModal(c: AdminCourseListItem) {
    this.courseModalMode.set('edit');
    this.editingCourseId.set(c.id);
    this.courseForm = { title: c.title, description: '', price: c.price, renewalPrice: 0 };
    this.courseImageFile = null;
    this.showCourseModal.set(true);

    // Fetch full course details for complete description
    this.api.getCourse(c.id).subscribe({
      next: (detail) => {
        this.courseForm.description = detail.description;
      }
    });
  }

  closeCourseModal() {
    this.showCourseModal.set(false);
    this.courseImageFile = null;
  }

  onCourseImageSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.courseImageFile = input.files[0];
    }
  }

  saveCourse() {
    if (!this.courseForm.title || !this.courseForm.description) {
      this.showFeedback('يرجى ملء جميع بيانات الدورة المطلوبة', 'error');
      return;
    }

    this.savingCourse.set(true);

    if (this.courseModalMode() === 'create') {
      this.api.createCourse(this.courseForm).subscribe({
        next: () => {
          this.savingCourse.set(false);
          this.showFeedback('تم إنشاء الدورة بنجاح كمسودة (Draft)!', 'success');
          this.closeCourseModal();
          this.loadCourses();
        },
        error: (err) => {
          this.savingCourse.set(false);
          this.showFeedback(extractErrorMessage(err), 'error');
        }
      });
    } else {
      const id = this.editingCourseId();
      if (!id) return;

      const updateData: UpdateCourseRequest = {
        title: this.courseForm.title,
        description: this.courseForm.description,
        price: this.courseForm.price,
        renewalPrice: this.courseForm.renewalPrice
      };

      this.api.updateCourse(id, updateData).subscribe({
        next: () => {
          if (this.courseImageFile) {
            this.api.uploadCoursePicture(id, this.courseImageFile).subscribe({
              next: () => {
                this.savingCourse.set(false);
                this.showFeedback('تم تعديل بيانات الدورة وتحديث صورتها بنجاح!', 'success');
                this.closeCourseModal();
                this.loadCourses();
              },
              error: () => {
                this.savingCourse.set(false);
                this.showFeedback('تم تعديل الدورة ولكن تعذر رفع الصورة', 'error');
                this.closeCourseModal();
                this.loadCourses();
              }
            });
          } else {
            this.savingCourse.set(false);
            this.showFeedback('تم تعديل بيانات الدورة بنجاح!', 'success');
            this.closeCourseModal();
            this.loadCourses();
          }
        },
        error: (err) => {
          this.savingCourse.set(false);
          this.showFeedback(extractErrorMessage(err), 'error');
        }
      });
    }
  }

  publish(courseId: string) {
    this.api.publishCourse(courseId).subscribe({
      next: () => {
        this.showFeedback('تم نشر الدورة بنجاح لتكون متاحة للطلاب!', 'success');
        this.loadCourses();
      },
      error: (err) => this.showFeedback(extractErrorMessage(err), 'error')
    });
  }

  archive(courseId: string) {
    this.api.archiveCourse(courseId).subscribe({
      next: () => {
        this.showFeedback('تم أرشفة الدورة بنجاح.', 'success');
        this.loadCourses();
      },
      error: (err) => this.showFeedback(extractErrorMessage(err), 'error')
    });
  }

  // ==============================================================
  // Curriculum Builder (Sections & Lessons)
  // ==============================================================
  openCurriculum(courseId: string) {
    this.loadingCurriculum.set(true);
    this.api.getCourse(courseId).subscribe({
      next: (detail) => {
        this.activeCurriculumCourse.set(detail);
        this.loadingCurriculum.set(false);
      },
      error: (err) => {
        this.loadingCurriculum.set(false);
        this.showFeedback(extractErrorMessage(err), 'error');
      }
    });
  }

  closeCurriculum() {
    this.activeCurriculumCourse.set(null);
    this.loadCourses();
  }

  refreshCurriculum() {
    const cur = this.activeCurriculumCourse();
    if (!cur) return;
    this.openCurriculum(cur.id);
  }

  openAddSectionModal() {
    this.editingSectionId.set(null);
    this.sectionTitleInput = '';
    this.showSectionModal.set(true);
  }

  renameSection(sec: SectionResponse) {
    this.editingSectionId.set(sec.id);
    this.sectionTitleInput = sec.title;
    this.showSectionModal.set(true);
  }

  saveSection() {
    if (!this.sectionTitleInput) return;
    const cur = this.activeCurriculumCourse();
    if (!cur) return;

    this.savingSection.set(true);
    const secId = this.editingSectionId();

    if (secId) {
      this.api.updateSection(secId, this.sectionTitleInput).subscribe({
        next: () => {
          this.savingSection.set(false);
          this.showSectionModal.set(false);
          this.showFeedback('تم تحديث اسم الفصل بنجاح!', 'success');
          this.refreshCurriculum();
        },
        error: (err) => {
          this.savingSection.set(false);
          this.showFeedback(extractErrorMessage(err), 'error');
        }
      });
    } else {
      this.api.createSection(cur.id, this.sectionTitleInput).subscribe({
        next: () => {
          this.savingSection.set(false);
          this.showSectionModal.set(false);
          this.showFeedback('تم إضافة الفصل الدراسي بنجاح!', 'success');
          this.refreshCurriculum();
        },
        error: (err) => {
          this.savingSection.set(false);
          this.showFeedback(extractErrorMessage(err), 'error');
        }
      });
    }
  }

  // ==============================================================
  // Lesson Management (Written / Video / Quiz / PDF)
  // ==============================================================
  openAddLessonModal(sec: SectionResponse) {
    this.activeSectionForLesson.set(sec);
    this.lessonTitleInput = '';
    this.lessonTypeInput = 'Written';
    this.writtenContentInput = '';
    this.pdfFile = null;
    this.quizPassingScore = 70;
    this.quizQuestions = [
      {
        prompt: '',
        answers: [
          { text: '', isCorrect: true },
          { text: '', isCorrect: false }
        ]
      }
    ];
    this.showLessonModal.set(true);
  }

  closeLessonModal() {
    if (this.videoUploading()) {
      if (!confirm('هناك عملية رفع فيديو جارية، هل أنت متأكد من الإلغاء؟')) return;
    }
    this.showLessonModal.set(false);
    this.activeSectionForLesson.set(null);
    this.videoFile = null;
    this.videoUploading.set(false);
    this.videoUploadProgress.set(0);
  }

  onPdfFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.pdfFile = input.files[0];
    }
  }

  onVideoFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.videoFile = input.files[0];
    }
  }

  clearVideoFile(event?: Event) {
    if (event) event.stopPropagation();
    this.videoFile = null;
  }

  // Standalone Video Upload Modal
  openUploadVideoModal(lesson: { id: string; title: string }) {
    this.targetLessonForVideo.set(lesson);
    this.standaloneVideoFile = null;
    this.videoUploading.set(false);
    this.videoUploadProgress.set(0);
    this.showUploadVideoModal.set(true);
  }

  closeUploadVideoModal() {
    if (this.videoUploading()) {
      if (!confirm('هناك عملية رفع فيديو جارية، هل أنت متأكد من الإلغاء؟')) return;
    }
    this.showUploadVideoModal.set(false);
    this.targetLessonForVideo.set(null);
    this.standaloneVideoFile = null;
    this.videoUploading.set(false);
    this.videoUploadProgress.set(0);
  }

  onStandaloneVideoSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.standaloneVideoFile = input.files[0];
    }
  }

  clearStandaloneVideo(event?: Event) {
    if (event) event.stopPropagation();
    this.standaloneVideoFile = null;
  }

  startStandaloneVideoUpload() {
    const target = this.targetLessonForVideo();
    if (!target || !this.standaloneVideoFile) {
      this.showFeedback('يرجى اختيار ملف الفيديو', 'error');
      return;
    }

    this.videoUploading.set(true);
    this.videoUploadProgress.set(0);

    this.api.updateVideoLesson(target.id).subscribe({
      next: (presigned) => {
        this.uploadVideoToBunny(this.standaloneVideoFile!, presigned, target.title)
          .then(() => {
            this.videoUploading.set(false);
            this.showFeedback('تم رفع وتحديث الفيديو بنجاح على سيرفرات البث!', 'success');
            this.closeUploadVideoModal();
            this.refreshCurriculum();
          })
          .catch((err) => {
            this.videoUploading.set(false);
            this.showFeedback('فشل رفع الفيديو: ' + (err.message || 'خطأ أثناء الاتصال بخادم Bunny CDN'), 'error');
          });
      },
      error: (err) => {
        this.videoUploading.set(false);
        this.showFeedback(extractErrorMessage(err), 'error');
      }
    });
  }

  formatFileSize(bytes?: number): string {
    if (!bytes || bytes <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  private async uploadVideoToBunny(file: File, presigned: VideoInitResult, title: string): Promise<void> {
    const tus = await import('tus-js-client');

    return new Promise((resolve, reject) => {
      const upload = new tus.Upload(file, {
        endpoint: 'https://video.bunnycdn.com/tusupload',
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          AuthorizationSignature: presigned.signature,
          AuthorizationExpire: String(presigned.expirationTime),
          VideoId: presigned.videoId,
          LibraryId: String(presigned.libraryId),
        },
        metadata: {
          filename: file.name,
          filetype: file.type || 'video/mp4',
          title: title
        },
        onError: (error) => {
          console.error('Bunny TUS upload error:', error);
          reject(error);
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          if (bytesTotal > 0) {
            const percentage = Math.round((bytesUploaded / bytesTotal) * 100);
            this.videoUploadProgress.set(percentage);
          }
        },
        onSuccess: () => {
          resolve();
        }
      });

      upload.start();
    });
  }

  addQuestion() {
    this.quizQuestions.push({
      prompt: '',
      answers: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false }
      ]
    });
  }

  removeQuestion(qi: number) {
    if (this.quizQuestions.length > 1) {
      this.quizQuestions.splice(qi, 1);
    }
  }

  addAnswer(qi: number) {
    this.quizQuestions[qi].answers.push({ text: '', isCorrect: false });
  }

  removeAnswer(qi: number, ai: number) {
    if (this.quizQuestions[qi].answers.length > 2) {
      this.quizQuestions[qi].answers.splice(ai, 1);
    }
  }

  setCorrectAnswer(qi: number, ai: number) {
    this.quizQuestions[qi].answers.forEach((ans, idx) => {
      ans.isCorrect = idx === ai;
    });
  }

  saveLesson() {
    const sec = this.activeSectionForLesson();
    if (!sec || !this.lessonTitleInput) {
      this.showFeedback('يرجى إدخال عنوان الدرس', 'error');
      return;
    }

    this.savingLesson.set(true);

    if (this.lessonTypeInput === 'Pdf') {
      if (!this.pdfFile) {
        this.savingLesson.set(false);
        this.showFeedback('يرجى اختيار ملف PDF للدرس', 'error');
        return;
      }

      this.api.createPdfLesson(sec.id, this.lessonTitleInput, this.pdfFile).subscribe({
        next: () => {
          this.savingLesson.set(false);
          this.showFeedback('تم إضافة درس الـ PDF بنجاح!', 'success');
          this.closeLessonModal();
          this.refreshCurriculum();
        },
        error: (err) => {
          this.savingLesson.set(false);
          this.showFeedback(extractErrorMessage(err), 'error');
        }
      });
      return;
    }

    // Video lesson creation with optional / required video upload
    if (this.lessonTypeInput === 'Video') {
      if (!this.videoFile) {
        this.savingLesson.set(false);
        this.showFeedback('يرجى اختيار ملف الفيديو للمحاضرة أولاً', 'error');
        return;
      }

      this.api.createLesson({
        sectionId: sec.id,
        title: this.lessonTitleInput,
        type: 'Video'
      }).subscribe({
        next: (res) => {
          if (res.presigned) {
            // Upload immediately using returned presigned credentials
            this.videoUploading.set(true);
            this.videoUploadProgress.set(0);
            this.uploadVideoToBunny(this.videoFile!, res.presigned, this.lessonTitleInput)
              .then(() => {
                this.videoUploading.set(false);
                this.savingLesson.set(false);
                this.showFeedback('تم إنشاء درس الفيديو ورفعه بنجاح!', 'success');
                this.closeLessonModal();
                this.refreshCurriculum();
              })
              .catch((err) => {
                this.videoUploading.set(false);
                this.savingLesson.set(false);
                this.showFeedback('تم إنشاء الدرس لكن فشل رفع الفيديو إلى Bunny CDN: ' + (err.message || ''), 'error');
                this.closeLessonModal();
                this.refreshCurriculum();
              });
          } else {
            // If presigned not in create response, fetch from updateVideoLesson
            this.api.updateVideoLesson(res.id).subscribe({
              next: (presigned) => {
                this.videoUploading.set(true);
                this.videoUploadProgress.set(0);
                this.uploadVideoToBunny(this.videoFile!, presigned, this.lessonTitleInput)
                  .then(() => {
                    this.videoUploading.set(false);
                    this.savingLesson.set(false);
                    this.showFeedback('تم إنشاء درس الفيديو ورفعه بنجاح!', 'success');
                    this.closeLessonModal();
                    this.refreshCurriculum();
                  })
                  .catch((err) => {
                    this.videoUploading.set(false);
                    this.savingLesson.set(false);
                    this.showFeedback('تم إنشاء الدرس لكن تعذر إكمال رفع الفيديو: ' + (err.message || ''), 'error');
                    this.closeLessonModal();
                    this.refreshCurriculum();
                  });
              },
              error: () => {
                this.savingLesson.set(false);
                this.showFeedback('تم إنشاء درس الفيديو في قاعدة البيانات بنجاح!', 'success');
                this.closeLessonModal();
                this.refreshCurriculum();
              }
            });
          }
        },
        error: (err) => {
          this.savingLesson.set(false);
          this.showFeedback(extractErrorMessage(err), 'error');
        }
      });
      return;
    }

    // Written or Quiz
    let quizDto: QuizDto | undefined;
    if (this.lessonTypeInput === 'Quiz') {
      quizDto = {
        passingScore: this.quizPassingScore,
        questions: this.quizQuestions
      };
    }

    this.api.createLesson({
      sectionId: sec.id,
      title: this.lessonTitleInput,
      type: this.lessonTypeInput,
      content: this.lessonTypeInput === 'Written' ? this.writtenContentInput : null,
      quiz: quizDto
    }).subscribe({
      next: () => {
        this.savingLesson.set(false);
        this.showFeedback('تم إضافة الدرس بنجاح!', 'success');
        this.closeLessonModal();
        this.refreshCurriculum();
      },
      error: (err) => {
        this.savingLesson.set(false);
        this.showFeedback(extractErrorMessage(err), 'error');
      }
    });
  }

  deleteLesson(lessonId: string) {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا الدرس نهائياً؟')) return;
    this.api.deleteLesson(lessonId).subscribe({
      next: () => {
        this.showFeedback('تم حذف الدرس بنجاح', 'success');
        this.refreshCurriculum();
      },
      error: (err) => this.showFeedback(extractErrorMessage(err), 'error')
    });
  }

  // ==============================================================
  // Instructors & Invitations
  // ==============================================================
  sendInvite() {
    if (!this.inviteForm.firstName || !this.inviteForm.lastName || !this.inviteForm.email) {
      this.showFeedback('يرجى ملء جميع الحقول المطلوبة', 'error');
      return;
    }
    this.inviting.set(true);
    this.api.inviteInstructor(this.inviteForm).subscribe({
      next: () => {
        this.inviting.set(false);
        this.showFeedback('تم إرسال دعوة المحاضر بنجاح!', 'success');
        this.inviteForm = { firstName: '', lastName: '', email: '', bio: '' };
        this.loadInstructors();
        this.activeTab.set('instructors');
      },
      error: (err) => {
        this.inviting.set(false);
        this.showFeedback(extractErrorMessage(err), 'error');
      }
    });
  }

  deleteInst(id: string) {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا المحاضر؟')) return;
    this.api.deleteInstructor(id).subscribe({
      next: () => {
        this.showFeedback('تم حذف المحاضر بنجاح', 'success');
        this.loadInstructors();
      },
      error: (err) => this.showFeedback(extractErrorMessage(err), 'error')
    });
  }

  // ==============================================================
  // Helper Formatters
  // ==============================================================
  getStatusLabel(status: CourseStatus): string {
    switch (status) {
      case 'Published': return 'منشورة';
      case 'Draft': return 'مسودة';
      case 'Archived': return 'مؤرشفة';
      default: return status;
    }
  }

  getLessonTypeLabel(type: LessonType): string {
    switch (type) {
      case 'Written': return 'درس نصي';
      case 'Video': return 'فيديو';
      case 'Quiz': return 'اختبار';
      case 'Pdf': return 'ملف PDF';
      default: return type;
    }
  }

  getLessonEmoji(type: LessonType): string {
    switch (type) {
      case 'Written': return '📝';
      case 'Video': return '🎥';
      case 'Quiz': return '❓';
      case 'Pdf': return '📄';
      default: return '📖';
    }
  }

  getInitials(name?: string): string {
    if (!name) return '👑';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  private showFeedback(msg: string, type: 'success' | 'error') {
    this.feedback.set(msg);
    this.feedbackType.set(type);
    setTimeout(() => this.feedback.set(''), 4000);
  }
}
