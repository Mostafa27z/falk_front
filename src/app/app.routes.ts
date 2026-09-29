import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth.guard';

export const routes: Routes = [
  // Public
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'courses', loadComponent: () => import('./pages/courses/courses.component').then(m => m.CoursesComponent) },
  { path: 'courses/:id', loadComponent: () => import('./pages/course-detail/course-detail.component').then(m => m.CourseDetailComponent) },

  // Auth
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', canActivate: [guestGuard], loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
  { path: 'forgot-password', loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },

  // Student (protected)
  { path: 'cart', canActivate: [authGuard], loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent) },
  { path: 'profile', canActivate: [authGuard], loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent) },
  { path: 'learn/:courseId', canActivate: [authGuard], loadComponent: () => import('./pages/learn/learn.component').then(m => m.LearnComponent) },
  { path: 'payment-status', canActivate: [authGuard], loadComponent: () => import('./pages/payment-status/payment-status.component').then(m => m.PaymentStatusComponent) },
  { path: 'payment-status/:id', canActivate: [authGuard], loadComponent: () => import('./pages/payment-status/payment-status.component').then(m => m.PaymentStatusComponent) },

  // Admin & Dashboard
  { path: 'admin', canActivate: [authGuard], loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent) },
  { path: 'dashboard', canActivate: [authGuard], loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent) },

  // Fallback
  { path: '**', redirectTo: '' }
];
