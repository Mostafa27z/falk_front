# Courses API

> Tags: `courses`, `instructor: courses`, `admin: courses`

---

## Public Endpoints

### 1. GET `/api/v1/courses`
**List all published courses (public)**

**Auth Required:** No

**Query Parameters:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `cursor` | `string` | No | Pagination cursor |
| `pageSize` | `integer` | No | Items per page |

**Response** (`200 OK`):
```json
{
  "courses": [
    {
      "id": "uuid",
      "title": "string",
      "picturePath": "string | null",
      "price": 0.00,
      "createdAt": "2024-01-01T00:00:00Z",
      "instructor": "string"
    }
  ],
  "nextCursor": "string | null",
  "hasMore": true
}
```

---

### 2. GET `/api/v1/courses/{id}`
**Get course details with sections and lessons**

**Path Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `id` | `uuid` | Course ID |

**Response** (`200 OK`):
```json
{
  "id": "uuid",
  "title": "string",
  "picturePath": "string | null",
  "description": "string",
  "createdAt": "2024-01-01T00:00:00Z",
  "price": 0.00,
  "instructorName": "string",
  "instructorPicture": "string | null",
  "sections": [
    {
      "id": "uuid",
      "title": "string",
      "order": 0,
      "lessons": [
        {
          "id": "uuid",
          "title": "string",
          "order": 0,
          "type": "Written | Video | Quiz | Pdf"
        }
      ]
    }
  ]
}
```

---

## Instructor Endpoints

> Tag: `instructor: courses`  
> **Auth Required:** Yes (Instructor role)

### 3. POST `/api/v1/instructor/courses`
**Create a new course (Draft)**

**Request Body** (`application/json`):
```json
{
  "title": "string",
  "description": "string",
  "price": 0.00,
  "renewalPrice": 0.00
}
```

**Responses:**
| Code | Description |
|---|---|
| `204` | No Content — Course created |
| `400` | Bad Request |
| `401` | Unauthorized |
| `403` | Forbidden |

---

### 4. PATCH `/api/v1/instructor/courses/{id}`
**Update a course**

**Path Parameters:** `id` (uuid)

**Request Body** (`application/json`):
```json
{
  "title": "string | null",
  "description": "string | null",
  "clearPicturePath": false,
  "price": 0.00,
  "renewalPrice": 0.00
}
```

> Only include fields to update. `null` = no change. Set `clearPicturePath: true` to remove picture.

**Response:** `204 No Content`

---

### 5. PATCH `/api/v1/instructor/courses/{id}/picture`
**Upload/update course picture**

**Path Parameters:** `id` (uuid)

**Request Body** (`multipart/form-data`):
| Field | Type | Description |
|---|---|---|
| `file` | `IFormFile` | Image file |

**Response:** `204 No Content`

---

### 6. POST `/api/v1/instructor/courses/{courseId}/sections`
**Create a section within a course**

**Path Parameters:** `courseId` (uuid)

**Request Body** (`application/json`):
```json
{
  "title": "string"
}
```

**Response:** `204 No Content`

---

### 7. PATCH `/api/v1/instructor/sections/{id}`
**Update a section title**

**Path Parameters:** `id` (uuid)

**Request Body** (`application/json`):
```json
{
  "title": "string | null"
}
```

**Response:** `204 No Content`

---

### 8. PATCH `/api/v1/instructor/sections/{id}/move`
**Reorder a section within a course**

**Path Parameters:** `id` (uuid)

**Query Parameters:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `courseId` | `uuid` | Yes | Target course ID |
| `newOrder` | `integer` | Yes | New position (0-indexed) |

**Response:** `204 No Content`

---

## Admin Endpoints

> Tag: `admin: courses`  
> **Auth Required:** Yes (Admin role)

### 9. GET `/api/v1/admin/courses`
**List all courses for admin (all statuses)**

**Query Parameters:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `status` | `CourseStatus` | No | Filter by status: `Draft`, `Published`, `Archived` |
| `cursor` | `string` | No | Pagination cursor |
| `pageSize` | `integer` | No | Items per page |

**Response** (`200 OK`):
```json
{
  "courses": [
    {
      "id": "uuid",
      "title": "string",
      "picturePath": "string | null",
      "price": 0.00,
      "createdAt": "2024-01-01T00:00:00Z",
      "instructor": "string",
      "status": "Draft | Published | Archived"
    }
  ],
  "nextCursor": "string | null",
  "hasMore": true
}
```

---

### 10. POST `/api/v1/admin/courses/{id}/publish`
**Publish a course (Draft → Published)**

**Path Parameters:** `id` (uuid)

**Response:** `204 No Content`

---

### 11. POST `/api/v1/admin/courses/{id}/archive`
**Archive a course (Published → Archived)**

**Path Parameters:** `id` (uuid)

**Response:** `204 No Content`
