export function extractErrorMessage(err: any): string {
  if (!err) return 'حدث خطأ غير متوقع';

  const body = err.error || err;

  if (typeof body === 'string') return body;

  // ASP.NET Core ValidationProblemDetails
  if (body.errors) {
    if (Array.isArray(body.errors)) {
      const msgs = body.errors.map((e: any) =>
        typeof e === 'string' ? e : e.description || e.message || e.code || JSON.stringify(e)
      );
      if (msgs.length > 0) return msgs.join(' • ');
    } else if (typeof body.errors === 'object') {
      const messages: string[] = [];
      for (const key of Object.keys(body.errors)) {
        const fieldErrors = body.errors[key];
        if (Array.isArray(fieldErrors)) {
          messages.push(...fieldErrors);
        } else if (typeof fieldErrors === 'string') {
          messages.push(fieldErrors);
        }
      }
      if (messages.length > 0) {
        return messages.join(' • ');
      }
    }
  }

  if (body.detail) return body.detail;
  if (body.title && body.title !== 'One or more validation errors occurred.') return body.title;
  if (body.message) return body.message;

  return 'بيانات غير صحيحة، يرجى التأكد من الحقول وشروط كلمة المرور';
}
