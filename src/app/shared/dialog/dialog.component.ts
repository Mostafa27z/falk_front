import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService, DialogType } from './dialog.service';
import { IconComponent, IconName } from '../icon/icon.component';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (dialog.state().isOpen) {
      <div class="dialog-overlay animate-fade-in" (click)="onBackdropClick($event)">
        <div class="dialog-card animate-scale-in" (click)="$event.stopPropagation()">
          
          <button type="button" class="dialog-close-btn" (click)="dialog.handleAction(false)" title="إغلاق">
            <app-icon name="x" [size]="16" />
          </button>

          <div class="dialog-icon-wrapper" [class]="dialog.state().type || 'info'">
            <app-icon [name]="getIconName(dialog.state().type)" [size]="28" [strokeWidth]="2" />
          </div>

          <div class="dialog-content">
            <h3 class="dialog-title">{{ dialog.state().title }}</h3>
            <p class="dialog-message">{{ dialog.state().message }}</p>
          </div>

          <div class="dialog-actions">
            @if (dialog.state().isConfirm) {
              <button
                type="button"
                class="btn-dialog-cancel"
                (click)="dialog.handleAction(false)">
                {{ dialog.state().cancelText || 'إلغاء' }}
              </button>
              <button
                type="button"
                class="btn-dialog-confirm"
                [class]="dialog.state().type || 'primary'"
                (click)="dialog.handleAction(true)">
                {{ dialog.state().confirmText || 'تأكيد' }}
              </button>
            } @else {
              <button
                type="button"
                class="btn-dialog-confirm full-width"
                [class]="dialog.state().type || 'primary'"
                (click)="dialog.handleAction(true)">
                {{ dialog.state().confirmText || 'حسناً' }}
              </button>
            }
          </div>

        </div>
      </div>
    }
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-4);
    }

    .dialog-card {
      position: relative;
      width: 100%;
      max-width: 420px;
      background: #ffffff;
      border-radius: var(--radius-3xl);
      padding: var(--space-8);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);
      text-align: center;
      direction: rtl;
    }

    .dialog-close-btn {
      position: absolute;
      top: 18px;
      left: 18px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background: var(--gray-100);
      color: var(--gray-500);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
    }

    .dialog-close-btn:hover {
      background: var(--gray-200);
      color: var(--gray-800);
    }

    .dialog-icon-wrapper {
      width: 64px;
      height: 64px;
      border-radius: 20px;
      margin: 0 auto var(--space-5);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.05);
    }

    .dialog-icon-wrapper.success {
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
    }

    .dialog-icon-wrapper.error,
    .dialog-icon-wrapper.danger {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }

    .dialog-icon-wrapper.warning {
      background: #fffbeb;
      color: #d97706;
      border: 1px solid #fde68a;
    }

    .dialog-icon-wrapper.info {
      background: #eff6ff;
      color: #2563eb;
      border: 1px solid #bfdbfe;
    }

    .dialog-title {
      font-size: var(--font-size-xl);
      font-weight: 800;
      color: var(--gray-900);
      margin-bottom: var(--space-2);
    }

    .dialog-message {
      font-size: var(--font-size-sm);
      color: var(--gray-600);
      line-height: 1.6;
      margin-bottom: var(--space-6);
      white-space: pre-line;
    }

    .dialog-actions {
      display: flex;
      gap: var(--space-3);
      justify-content: center;
    }

    .btn-dialog-cancel {
      flex: 1;
      padding: var(--space-3) var(--space-5);
      border-radius: var(--radius-xl);
      font-weight: 700;
      font-size: var(--font-size-sm);
      background: var(--gray-100);
      color: var(--gray-700);
      border: 1px solid var(--gray-200);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .btn-dialog-cancel:hover {
      background: var(--gray-200);
      color: var(--gray-900);
    }

    .btn-dialog-confirm {
      flex: 1;
      padding: var(--space-3) var(--space-5);
      border-radius: var(--radius-xl);
      font-weight: 700;
      font-size: var(--font-size-sm);
      color: #ffffff;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: all var(--transition-fast);
    }

    .btn-dialog-confirm.full-width {
      width: 100%;
      flex: unset;
    }

    .btn-dialog-confirm.success {
      background: #059669;
    }
    .btn-dialog-confirm.success:hover {
      background: #047857;
    }

    .btn-dialog-confirm.error,
    .btn-dialog-confirm.danger {
      background: #dc2626;
    }
    .btn-dialog-confirm.error:hover,
    .btn-dialog-confirm.danger:hover {
      background: #b91c1c;
    }

    .btn-dialog-confirm.warning {
      background: #d97706;
    }
    .btn-dialog-confirm.warning:hover {
      background: #b45309;
    }

    .btn-dialog-confirm.info,
    .btn-dialog-confirm.primary {
      background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
    }
    .btn-dialog-confirm.info:hover,
    .btn-dialog-confirm.primary:hover {
      box-shadow: 0 6px 18px rgba(124, 58, 237, 0.35);
    }

    @media (max-width: 480px) {
      .dialog-card {
        padding: var(--space-6) var(--space-4);
        border-radius: var(--radius-2xl);
      }
      .dialog-icon-wrapper {
        width: 52px;
        height: 52px;
        border-radius: 16px;
        margin-bottom: var(--space-3);
      }
      .dialog-title {
        font-size: var(--font-size-lg);
      }
      .dialog-message {
        font-size: var(--font-size-xs);
        margin-bottom: var(--space-4);
      }
      .dialog-actions {
        flex-direction: column-reverse;
        gap: var(--space-2);
      }
      .btn-dialog-cancel, .btn-dialog-confirm {
        width: 100%;
        flex: unset;
      }
    }
  `]
})
export class DialogComponent {
  dialog = inject(DialogService);

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.dialog.state().isOpen) {
      this.dialog.handleAction(false);
    }
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.dialog.handleAction(false);
    }
  }

  getIconName(type?: DialogType): IconName {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'danger':
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'alert-triangle';
      case 'info':
      default:
        return 'info';
    }
  }
}
