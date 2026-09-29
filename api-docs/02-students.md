# Students API

> Tag: `students`  
> Base: `/api/v1/students`

## Endpoints

### 1. GET `/api/v1/students/me`
**Get the authenticated student's profile**

**Auth Required:** Yes

**Response** (`200 OK`):
```json
{
  "id": "uuid",
  "firstName": "string",
  "lastName": "string",
  "displayName": "string",
  "email": "string",
  "phoneNumber": "string"
}
```

**Error Responses:** `400`, `401`, `403`, `404`, `409`

---

### 2. PATCH `/api/v1/students/me`
**Update the authenticated student's profile**

**Auth Required:** Yes

**Request Body** (`application/json`):
```json
{
  "firstName": "string | null",
  "lastName": "string | null"
}
```

> **Note:** Only include fields you want to update. `null` means no change.

**Responses:**
| Code | Description |
|---|---|
| `204` | No Content — Profile updated |
| `400` | Bad Request — Validation errors |
| `401` | Unauthorized |

---

## Schema: GetStudentResponse

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `uuid` | ✅ | Student unique ID |
| `firstName` | `string` | ✅ | First name |
| `lastName` | `string` | ✅ | Last name |
| `displayName` | `string` | ✅ | Display name (derived) |
| `email` | `string` | ✅ | Email address |
| `phoneNumber` | `string` | ✅ | Phone number |
