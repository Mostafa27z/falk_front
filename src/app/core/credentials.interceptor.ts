import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  let targetUrl = req.url;

  // On server-side rendering (SSR Node.js), prepend the absolute domain
  if (isPlatformServer(platformId) && req.url.startsWith('/api')) {
    targetUrl = `https://api.falk-el-tawfiq.com${req.url}`;
  }

  const cloned = req.clone({
    url: targetUrl,
    withCredentials: true
  });

  return next(cloned);
};
