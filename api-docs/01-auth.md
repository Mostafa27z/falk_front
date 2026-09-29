# Auth API

> Tag: `auth`  
> Base: `/api/v1/auth`

## Endpoints

### 1. POST `/api/v1/auth/register`
**Register a new student account**

**Request Body** (`application/json`):
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phoneNumber": "string",
  "password": "string"
}
```

**Responses:**
| Code | Description |
|---|---|
| `204` | No Content — Registration successful, confirmation email sent |
| `400` | Bad Request — Validation errors |
| `409` | Conflict — Email already registered |

---

### 2. POST `/api/v1/auth/login`
**Authenticate a user (student/instructor/admin)**

**Request Body** (`application/json`):
```json
{
  "email": "string",
  "password": "string"
}
```

**Responses:**
| Code | Description |
|---|---|
| `204` | No Content — Login successful (auth cookie set) |
| `400` | Bad Request — Invalid credentials |
| `401` | Unauthorized |

> **Note:** Authentication uses HTTP-only cookies. No token is returned in the body.

---

### 3. POST `/api/v1/auth/logout`
**Log out the current user**

**Request Body:** None

**Responses:**
| Code | Description |
|---|---|
| `204` | No Content — Logged out successfully |
| `401` | Unauthorized |

---

### 4. GET `/api/v1/auth/confirm-email`
**Confirm a user's email address**

**Query Parameters:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `userId` | `string` | Yes | User ID from confirmation email |
| `token` | `string` | Yes | Confirmation token from email |

**Responses:**
| Code | Description |
|---|---|
| `204` | No Content — Email confirmed |
| `400` | Bad Request — Invalid token or userId |

---

### 5. POST `/api/v1/auth/forgot-password`
**Request a password reset email**

**Query Parameters:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `email` | `string` | Yes | Email address to send reset link |

**Responses:**
| Code | Description |
|---|---|
| `204` | No Content — Reset email sent (if account exists) |
| `400` | Bad Request |

---

### 6. POST `/api/v1/auth/reset-password`
**Reset password using token from email**

**Request Body** (`application/json`):
```json
{
  "email": "string",
  "token": "string",
  "newPassword": "string"
}
```

**Responses:**
| Code | Description |
|---|---|
| `204` | No Content — Password reset successful |
| `400` | Bad Request — Invalid token or weak password |

---

### 7. POST `/api/v1/auth/resend-confirmation`
**Resend the email confirmation link**

**Query Parameters:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `email` | `string` | Yes | Email to resend confirmation to |

**Responses:**
| Code | Description |
|---|---|
| `204` | No Content — Confirmation email resent |
| `400` | Bad Request |

---

## Admin Auth

> Tag: `admin: auth`  
> Base: `/api/v1/admin/auth`

### POST `/api/v1/admin/auth/instructors`
**Invite a new instructor (Admin only)**

**Request Body** (`application/json`):
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "bio": "string"
}
```

**Responses:**
| Code | Description |
|---|---|
| `204` | No Content — Instructor account created, invitation sent |
| `400` | Bad Request |
| `401` | Unauthorized |
| `403` | Forbidden — Not an admin |
| `409` | Conflict — Email already registered |
