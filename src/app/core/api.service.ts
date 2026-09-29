import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  LoginRequest, RegisterRequest, ResetPasswordRequest,
  Student, UpdateStudentRequest,
  CourseListItem, CourseDetail, AdminCourseListItem,
  CreateCourseRequest, UpdateCourseRequest,
  LessonDetail, CreateLessonRequest, CreateLessonResponse, VideoInitResult,
  InstructorPublic, InstructorOwn, InstructorAdmin,
  UpdateInstructorRequest, InviteInstructorRequest,
  CartItem, AddCartItemRequest,
  CreatePaymentRequest, CreatePaymentResponse, PaymentStatusResponse,
  PaginatedResponse, CourseStatus
} from './models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  // ======================== AUTH ========================
  login(data: LoginRequest): Observable<void> {
    return this.http.post<void>(`${this.base}/auth/login`, data);
  }

  register(data: RegisterRequest): Observable<void> {
    return this.http.post<void>(`${this.base}/auth/register`, data);
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.base}/auth/logout`, {});
  }

  confirmEmail(userId: string, token: string): Observable<void> {
    const params = new HttpParams().set('userId', userId).set('token', token);
    return this.http.get<void>(`${this.base}/auth/confirm-email`, { params });
  }

  forgotPassword(email: string): Observable<void> {
    const params = new HttpParams().set('email', email);
    return this.http.post<void>(`${this.base}/auth/forgot-password`, {}, { params });
  }

  resetPassword(data: ResetPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.base}/auth/reset-password`, data);
  }

  resendConfirmation(email: string): Observable<void> {
    const params = new HttpParams().set('email', email);
    return this.http.post<void>(`${this.base}/auth/resend-confirmation`, {}, { params });
  }

  // ======================== STUDENTS ========================
  getStudent(): Observable<Student> {
    return this.http.get<Student>(`${this.base}/students/me`);
  }

  updateStudent(data: UpdateStudentRequest): Observable<void> {
    return this.http.patch<void>(`${this.base}/students/me`, data);
  }

  // ======================== COURSES (PUBLIC) ========================
  getCourses(cursor?: string, pageSize = 12): Observable<PaginatedResponse<CourseListItem>> {
    let params = new HttpParams().set('pageSize', pageSize);
    if (cursor) params = params.set('cursor', cursor);
    return this.http.get<PaginatedResponse<CourseListItem>>(`${this.base}/courses`, { params });
  }

  getCourse(id: string): Observable<CourseDetail> {
    return this.http.get<CourseDetail>(`${this.base}/courses/${id}`);
  }

  // ======================== COURSES (INSTRUCTOR) ========================
  createCourse(data: CreateCourseRequest): Observable<void> {
    return this.http.post<void>(`${this.base}/instructor/courses`, data);
  }

  updateCourse(id: string, data: UpdateCourseRequest): Observable<void> {
    return this.http.patch<void>(`${this.base}/instructor/courses/${id}`, data);
  }

  uploadCoursePicture(id: string, file: File): Observable<void> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.patch<void>(`${this.base}/instructor/courses/${id}/picture`, fd);
  }

  createSection(courseId: string, title: string): Observable<void> {
    return this.http.post<void>(`${this.base}/instructor/courses/${courseId}/sections`, { title });
  }

  updateSection(id: string, title: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/instructor/sections/${id}`, { title });
  }

  moveSection(id: string, courseId: string, newOrder: number): Observable<void> {
    const params = new HttpParams().set('courseId', courseId).set('newOrder', newOrder);
    return this.http.patch<void>(`${this.base}/instructor/sections/${id}/move`, {}, { params });
  }

  // ======================== COURSES (ADMIN) ========================
  getAdminCourses(status?: CourseStatus, cursor?: string, pageSize = 20): Observable<PaginatedResponse<AdminCourseListItem>> {
    let params = new HttpParams().set('pageSize', pageSize);
    if (status) params = params.set('status', status);
    if (cursor) params = params.set('cursor', cursor);
    return this.http.get<PaginatedResponse<AdminCourseListItem>>(`${this.base}/admin/courses`, { params });
  }

  publishCourse(id: string): Observable<void> {
    return this.http.post<void>(`${this.base}/admin/courses/${id}/publish`, {});
  }

  archiveCourse(id: string): Observable<void> {
    return this.http.post<void>(`${this.base}/admin/courses/${id}/archive`, {});
  }

  // ======================== LESSONS ========================
  getLesson(id: string): Observable<LessonDetail> {
    return this.http.get<LessonDetail>(`${this.base}/lessons/${id}`);
  }

  createLesson(data: CreateLessonRequest): Observable<CreateLessonResponse> {
    return this.http.post<CreateLessonResponse>(`${this.base}/instructor/lessons`, data);
  }

  createPdfLesson(sectionId: string, title: string, file: File): Observable<CreateLessonResponse> {
    const fd = new FormData();
    fd.append('SectionId', sectionId);
    fd.append('Title', title);
    fd.append('File', file);
    return this.http.post<CreateLessonResponse>(`${this.base}/instructor/lessons/pdf`, fd);
  }

  deleteLesson(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/instructor/lessons/${id}`);
  }

  moveLesson(lessonId: string, sectionId: string, newOrder: number): Observable<void> {
    const params = new HttpParams().set('sectionId', sectionId).set('newOrder', newOrder);
    return this.http.patch<void>(`${this.base}/instructor/lessons/${lessonId}/move`, {}, { params });
  }

  updateLessonTitle(id: string, title: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/instructor/lessons/${id}/title`, { title });
  }

  updateWrittenLesson(id: string, content: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/instructor/lessons/${id}/written`, { content });
  }

  updateVideoLesson(id: string): Observable<VideoInitResult> {
    return this.http.patch<VideoInitResult>(`${this.base}/instructor/lessons/${id}/video`, {});
  }

  updateQuizLesson(id: string, quiz: any): Observable<void> {
    return this.http.patch<void>(`${this.base}/instructor/lessons/${id}/quiz`, { quiz });
  }

  updatePdfLesson(id: string, file: File): Observable<any> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.patch(`${this.base}/instructor/lessons/${id}/pdf`, fd);
  }

  // ======================== INSTRUCTORS ========================
  getInstructor(id: string): Observable<InstructorPublic> {
    return this.http.get<InstructorPublic>(`${this.base}/instructors/${id}`);
  }

  getOwnInstructor(): Observable<InstructorOwn> {
    return this.http.get<InstructorOwn>(`${this.base}/instructor/me`);
  }

  updateOwnInstructor(data: UpdateInstructorRequest): Observable<void> {
    return this.http.patch<void>(`${this.base}/instructor/me`, data);
  }

  uploadInstructorPicture(file: File): Observable<void> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.patch<void>(`${this.base}/instructor/me/picture`, fd);
  }

  // ======================== INSTRUCTORS (ADMIN) ========================
  getAdminInstructors(isDeleted?: boolean, cursor?: string, pageSize = 20): Observable<PaginatedResponse<any>> {
    let params = new HttpParams().set('pageSize', pageSize);
    if (isDeleted !== undefined) params = params.set('isDeleted', isDeleted);
    if (cursor) params = params.set('cursor', cursor);
    return this.http.get<PaginatedResponse<any>>(`${this.base}/admin/instructors`, { params });
  }

  getAdminInstructor(id: string): Observable<InstructorAdmin> {
    return this.http.get<InstructorAdmin>(`${this.base}/admin/instructors/${id}`);
  }

  deleteInstructor(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/admin/instructors/${id}`);
  }

  inviteInstructor(data: InviteInstructorRequest): Observable<void> {
    return this.http.post<void>(`${this.base}/admin/auth/instructors`, data);
  }

  // ======================== CART ========================
  getCartItems(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(`${this.base}/cart/items`);
  }

  addCartItem(data: AddCartItemRequest): Observable<void> {
    return this.http.post<void>(`${this.base}/cart/items`, data);
  }

  removeCartItem(courseId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/cart/items/${courseId}`);
  }

  // ======================== PAYMENTS ========================
  createPayment(data: CreatePaymentRequest): Observable<CreatePaymentResponse> {
    return this.http.post<CreatePaymentResponse>(`${this.base}/payments`, data);
  }

  getPaymentStatus(paymentAttemptId: string): Observable<PaymentStatusResponse> {
    return this.http.get<PaymentStatusResponse>(`${this.base}/payments/${paymentAttemptId}`);
  }

  cancelPayment(): Observable<void> {
    return this.http.post<void>(`${this.base}/payments/cancel`, {});
  }
}
