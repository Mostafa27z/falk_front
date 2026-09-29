import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { AuthUser, UserRole } from './models';
import { catchError, tap, of, Observable, switchMap, map } from 'rxjs';

const AUTH_STORAGE_KEY = 'falk_auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private _user = signal<AuthUser | null>(null);
  private _loading = signal<boolean>(false);

  user = this._user.asReadonly();
  role = computed<UserRole>(() => this._user()?.role ?? null);
  loading = this._loading.asReadonly();
  isLoggedIn = computed(() => this._user() !== null);
  isAdmin = computed(() => this._user()?.role === 'admin');
  isInstructor = computed(() => this._user()?.role === 'instructor');
  isStudent = computed(() => this._user()?.role === 'student');
  displayName = computed(() => this._user()?.displayName || this._user()?.firstName || '');

  constructor() {
    this.initFromStorage();
  }

  /** Read existing session from localStorage synchronously on boot */
  private initFromStorage() {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed: AuthUser = JSON.parse(stored);
        if (parsed && parsed.role) {
          this._user.set(parsed);
        }
      }
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }

  /**
   * Silently restore and verify existing session in background.
   * If user is a Guest (no session in storage), ZERO HTTP requests are made!
   */
  restoreSession(): Observable<AuthUser | null> {
    if (!isPlatformBrowser(this.platformId)) return of(null);

    const currentUser = this._user();
    if (!currentUser) {
      // Guest visitor: Do NOT make any probing HTTP requests!
      return of(null);
    }

    this._loading.set(true);

    if (currentUser.role === 'admin') {
      return this.api.getAdminCourses(undefined, undefined, 1).pipe(
        map(() => this._user()),
        tap(() => this._loading.set(false)),
        catchError(() => {
          this.clearSession();
          this._loading.set(false);
          return of(null);
        })
      );
    }

    if (currentUser.role === 'instructor') {
      return this.api.getOwnInstructor().pipe(
        tap(inst => {
          const updated: AuthUser = {
            id: inst.id,
            firstName: inst.firstName,
            lastName: inst.lastName,
            displayName: inst.displayName || `${inst.firstName} ${inst.lastName}`,
            email: inst.email || currentUser.email,
            phoneNumber: '',
            role: 'instructor'
          };
          this.saveSession(updated);
          this._loading.set(false);
        }),
        map(() => this._user()),
        catchError(() => {
          this.clearSession();
          this._loading.set(false);
          return of(null);
        })
      );
    }

    // Default: Student
    return this.api.getStudent().pipe(
      tap(student => {
        const updated: AuthUser = {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          displayName: student.displayName || `${student.firstName} ${student.lastName}`,
          email: student.email,
          phoneNumber: student.phoneNumber,
          role: 'student'
        };
        this.saveSession(updated);
        this._loading.set(false);
      }),
      map(() => this._user()),
      catchError(() => {
        this.clearSession();
        this._loading.set(false);
        return of(null);
      })
    );
  }

  /**
   * Login with user credentials and target role
   */
  login(email: string, password: string, targetRole: UserRole = 'student'): Observable<AuthUser> {
    this._loading.set(true);

    return this.api.login({ email, password }).pipe(
      switchMap(() => {
        if (targetRole === 'admin') {
          return this.api.getAdminCourses(undefined, undefined, 1).pipe(
            map(() => {
              const adminUser: AuthUser = {
                id: 'admin',
                firstName: 'مدير',
                lastName: 'النظام',
                displayName: 'مدير النظام (Admin)',
                email,
                role: 'admin'
              };
              this.saveSession(adminUser);
              this._loading.set(false);
              return adminUser;
            })
          );
        }

        if (targetRole === 'instructor') {
          return this.api.getOwnInstructor().pipe(
            map(inst => {
              const instUser: AuthUser = {
                id: inst.id,
                firstName: inst.firstName,
                lastName: inst.lastName,
                displayName: inst.displayName || `${inst.firstName} ${inst.lastName}`,
                email: inst.email || email,
                role: 'instructor'
              };
              this.saveSession(instUser);
              this._loading.set(false);
              return instUser;
            })
          );
        }

        // Student role
        return this.api.getStudent().pipe(
          map(student => {
            const studentUser: AuthUser = {
              id: student.id,
              firstName: student.firstName,
              lastName: student.lastName,
              displayName: student.displayName || `${student.firstName} ${student.lastName}`,
              email: student.email,
              phoneNumber: student.phoneNumber,
              role: 'student'
            };
            this.saveSession(studentUser);
            this._loading.set(false);
            return studentUser;
          }),
          // Fallback if student returns 403 (e.g. user selected student but is actually admin)
          catchError(err => {
            if (err.status === 403) {
              return this.api.getAdminCourses(undefined, undefined, 1).pipe(
                map(() => {
                  const fallbackAdmin: AuthUser = {
                    id: 'admin',
                    firstName: 'مدير',
                    lastName: 'النظام',
                    displayName: 'مدير النظام (Admin)',
                    email,
                    role: 'admin'
                  };
                  this.saveSession(fallbackAdmin);
                  this._loading.set(false);
                  return fallbackAdmin;
                })
              );
            }
            throw err;
          })
        );
      }),
      tap(user => {
        this._loading.set(false);
        if (user.role === 'admin' || user.role === 'instructor') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }
      }),
      catchError(err => {
        this._loading.set(false);
        throw err;
      })
    );
  }

  register(data: any) {
    return this.api.register(data);
  }

  logout(): Observable<void> {
    this.clearSession();
    return this.api.logout().pipe(
      tap(() => {
        this.router.navigate(['/login']);
      }),
      catchError(() => {
        this.router.navigate(['/login']);
        return of(void 0);
      })
    );
  }

  private saveSession(user: AuthUser) {
    this._user.set(user);
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } catch {}
    }
  }

  private clearSession() {
    this._user.set(null);
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch {}
    }
  }
}
