// ================================================================
// فالك التوفيق — TypeScript Models / Interfaces
// ================================================================

// ---- Enums ----
export type CourseStatus = 'Draft' | 'Published' | 'Archived';
export type LessonType = 'Written' | 'Video' | 'Quiz' | 'Pdf';
export type VideoStatus = 'Pending' | 'Ready' | 'Failed';
export type PaymentGateway = 'Paymob';
export type PaymentStatus = 'Pending' | 'Succeeded' | 'Failed' | 'Cancelled' | 'Refunded';

// ---- Auth ----
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface InviteInstructorRequest {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
}

// ---- Auth User & Role ----
export type UserRole = 'student' | 'instructor' | 'admin' | null;

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
}

// ---- Student ----
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phoneNumber: string;
}

export interface UpdateStudentRequest {
  firstName?: string | null;
  lastName?: string | null;
}

// ---- Courses ----
export interface CourseListItem {
  id: string;
  title: string;
  picturePath: string | null;
  price: number;
  createdAt: string;
  instructor: string;
}

export interface AdminCourseListItem extends CourseListItem {
  status: CourseStatus;
}

export interface CourseDetail {
  id: string;
  title: string;
  picturePath: string | null;
  description: string;
  createdAt: string;
  price: number;
  instructorName: string;
  instructorPicture: string | null;
  sections: SectionResponse[];
}

export interface SectionResponse {
  id: string;
  title: string;
  order: number;
  lessons: LessonSummary[];
}

export interface LessonSummary {
  id: string;
  title: string;
  order: number;
  type: LessonType;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  price: number;
  renewalPrice: number;
}

export interface UpdateCourseRequest {
  title?: string | null;
  description?: string | null;
  clearPicturePath?: boolean;
  price?: number | null;
  renewalPrice?: number | null;
}

// ---- Lessons ----
export interface LessonDetail {
  id: string;
  title: string;
  order: number;
  type: LessonType;
  content: string | null;
  video: VideoDTO | null;
  quiz: QuizDto | null;
  pdf: PdfDto | null;
}

export interface VideoDTO {
  externalId: string;
  playbackUrl: string;
  duration: string | null;
  status: VideoStatus;
}

export interface QuizDto {
  passingScore: number;
  questions: QuestionDTO[];
}

export interface QuestionDTO {
  prompt: string;
  answers: AnswerDTO[];
}

export interface AnswerDTO {
  text: string;
  isCorrect: boolean;
}

export interface PdfDto {
  sizeBytes: number;
  downloadUrl: string;
}

export interface VideoInitResult {
  videoId: string;
  libraryId: number;
  expirationTime: number;
  signature: string;
}

export interface CreateLessonRequest {
  sectionId: string;
  title: string;
  type: LessonType;
  content?: string | null;
  quiz?: QuizDto;
}

export interface CreateLessonResponse {
  id: string;
  presigned: VideoInitResult | null;
}

// ---- Instructors ----
export interface InstructorPublic {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  bio: string;
  profilePicturePath: string | null;
}

export interface InstructorOwn extends InstructorPublic {
  email: string | null;
}

export interface InstructorAdmin extends InstructorOwn {
  isDeleted: boolean;
}

export interface UpdateInstructorRequest {
  firstName?: string | null;
  lastName?: string | null;
  bio?: string | null;
  clearProfilePicture?: boolean;
}

// ---- Cart ----
export interface CartItem {
  courseId: string;
  title: string;
  price: number;
  isRenewal: boolean;
  picturePath: string | null;
}

export interface AddCartItemRequest {
  courseId: string;
  isRenewal: boolean;
}

// ---- Payments ----
export interface CreatePaymentRequest {
  gateway: PaymentGateway;
  redirectionUrl?: string | null;
}

export interface CreatePaymentResponse {
  paymentAttemptId: string;
  paymentUrl: string;
}

export interface PaymentStatusResponse {
  paymentAttemptId: string;
  status: PaymentStatus;
  paymentUrl: string;
}

// ---- Pagination ----
export interface PaginatedResponse<T> {
  courses?: T[];
  instructors?: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

// ---- Error ----
export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  requestId: string;
  traceId: string;
  errors?: { code: string; description: string; type: string }[];
}
