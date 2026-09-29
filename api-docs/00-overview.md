# فالك التوفيق — API Overview

## General Information

| Key | Value |
|---|---|
| **API Title** | FalkElTawfik.Api v1 |
| **OpenAPI Version** | 3.1.1 |
| **API Version** | 1.0.0 |
| **Base URL** | `https://api.falk-el-tawfiq.com/` |
| **Spec URL** | `https://api.falk-el-tawfiq.com/openapi/v1.json` |
| **Swagger UI** | `https://api.falk-el-tawfiq.com/swagger/index.html` |

## API Tags (Modules)

| # | Tag | Description | Endpoints |
|---|---|---|---|
| 1 | `auth` | Authentication & registration | 7 |
| 2 | `admin: auth` | Admin auth (invite instructors) | 1 |
| 3 | `students` | Student profile management | 2 |
| 4 | `courses` | Public course listing & details | 2 |
| 5 | `instructor: courses` | Instructor course/section management | 6 |
| 6 | `admin: courses` | Admin course publish/archive | 3 |
| 7 | `lessons` | Public lesson access & webhooks | 2 |
| 8 | `instructor: lessons` | Instructor lesson CRUD | 9 |
| 9 | `instructors` | Public instructor profile | 1 |
| 10 | `instructor: instructors` | Instructor self-management | 3 |
| 11 | `admin: instructors` | Admin instructor management | 3 |
| 12 | `cart` | Shopping cart | 3 |
| 13 | `payments` | Payment processing (Paymob) | 4 |

**Total: 42 endpoints across 13 tags**

## Common Error Response (Problem Details)

All error responses follow the **RFC 7807 Problem Details** format:

```json
{
  "type": "string (Problem type URI)",
  "title": "string (Problem code)",
  "status": 0,
  "detail": "string (Human-readable detail)",
  "requestId": "string (TraceIdentifier)",
  "traceId": "string (Activity.TraceId)",
  "errors": [
    {
      "code": "string",
      "description": "string",
      "type": "Problem | NotFound | Conflict | Forbidden"
    }
  ]
}
```

### Standard HTTP Status Codes

| Code | Meaning |
|---|---|
| `200` | Success with response body |
| `204` | Success with no content |
| `400` | Bad Request / Validation Error |
| `401` | Unauthorized — not authenticated |
| `403` | Forbidden — insufficient permissions |
| `404` | Not Found |
| `409` | Conflict — duplicate resource |

## Enums

| Enum | Values |
|---|---|
| **CourseStatus** | `Draft`, `Published`, `Archived` |
| **LessonType** | `Written`, `Video`, `Quiz`, `Pdf` |
| **VideoStatus** | `Pending`, `Ready`, `Failed` |
| **PaymentGateway** | `Paymob` |
| **PaymentStatus** | `Pending`, `Succeeded`, `Failed`, `Cancelled`, `Refunded` |

## Pagination

List endpoints use **cursor-based pagination**:

| Parameter | Type | Description |
|---|---|---|
| `cursor` | `string` (query) | Opaque cursor from previous response |
| `pageSize` | `integer` (query) | Number of items per page |

Response includes:
```json
{
  "items": [...],
  "nextCursor": "string | null",
  "hasMore": true
}
```
