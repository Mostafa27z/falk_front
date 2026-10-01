import { Injectable, signal } from '@angular/core';

export type DialogType = 'success' | 'error' | 'warning' | 'info' | 'danger';

export interface DialogOptions {
  title: string;
  message: string;
  type?: DialogType;
  confirmText?: string;
  cancelText?: string;
  isConfirm?: boolean;
}

interface DialogState extends DialogOptions {
  isOpen: boolean;
  resolve?: (value: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  state = signal<DialogState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    isConfirm: false
  });

  alert(options: { title?: string; message: string; type?: DialogType; okText?: string } | string): Promise<void> {
    return new Promise((resolve) => {
      let opts: DialogOptions;
      if (typeof options === 'string') {
        opts = {
          title: 'تنبيه',
          message: options,
          type: 'info',
          confirmText: 'حسناً',
          isConfirm: false
        };
      } else {
        opts = {
          title: options.title || (options.type === 'error' ? 'خطأ' : options.type === 'success' ? 'نجاح' : 'تنبيه'),
          message: options.message,
          type: options.type || 'info',
          confirmText: options.okText || 'حسناً',
          isConfirm: false
        };
      }

      this.state.set({
        ...opts,
        isOpen: true,
        resolve: () => resolve()
      });
    });
  }

  confirm(options: {
    title: string;
    message: string;
    type?: DialogType;
    confirmText?: string;
    cancelText?: string;
  }): Promise<boolean> {
    return new Promise((resolve) => {
      this.state.set({
        title: options.title,
        message: options.message,
        type: options.type || 'warning',
        confirmText: options.confirmText || 'تأكيد',
        cancelText: options.cancelText || 'إلغاء',
        isConfirm: true,
        isOpen: true,
        resolve
      });
    });
  }

  success(message: string, title: string = 'تم بنجاح'): Promise<void> {
    return this.alert({ title, message, type: 'success', okText: 'حسناً' });
  }

  error(message: string, title: string = 'حدث خطأ'): Promise<void> {
    return this.alert({ title, message, type: 'error', okText: 'فهمت ذلك' });
  }

  warning(message: string, title: string = 'تنبيه'): Promise<void> {
    return this.alert({ title, message, type: 'warning', okText: 'حسناً' });
  }

  info(message: string, title: string = 'معلومات'): Promise<void> {
    return this.alert({ title, message, type: 'info', okText: 'حسناً' });
  }

  handleAction(confirmed: boolean) {
    const current = this.state();
    if (current.resolve) {
      current.resolve(confirmed);
    }
    this.close();
  }

  close() {
    this.state.update(s => ({ ...s, isOpen: false }));
  }
}
