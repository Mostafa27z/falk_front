import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  let targetUrl = req.url;

  // If request URL starts with relative /api, point to production backend on SSR or non-localhost deployments
  if (req.url.startsWith('/api')) {
    if (isPlatformServer(platformId) || (typeof window !== 'undefined' && window.location.hostname !== 'localhost')) {
      targetUrl = `https://api.falk-el-tawfiq.com${req.url}`;
    }
  }

  const cloned = req.clone({
    url: targetUrl,
    withCredentials: true
  });

  return next(cloned);
};
