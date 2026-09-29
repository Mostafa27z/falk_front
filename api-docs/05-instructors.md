# Instructors API

> Tags: `instructors`, `instructor: instructors`, `admin: instructors`

---

## Public Endpoints

### 1. GET `/api/v1/instructors/{id}`
**Get public instructor profile**

**Auth Required:** No

**Path Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `id` | `uuid` | Instructor ID |

**Response** (`200 OK`):
```json
{
  "id": "uuid",
  "firstName": "string",
  "lastName": "string",
  "displayName": "string",
  "bio": "string",
  "profilePicturePath": "string | null"
}
```

---

## Instructor Self-Management

> Tag: `instructor: instructors`  
> **Auth Required:** Yes (Instructor role)

### 2. GET `/api/v1/instructor/me`
**Get own instructor profile**

**Response** (`200 OK`):
```json
{
  "id": "uuid",
  "firstName": "string",
  "lastName": "string",
  "displayName": "string",
  "bio": "string",
  "profilePicturePath": "string | null",
  "email": "string | null"
}
```

---

### 3. PATCH `/api/v1/instructor/me`
**Update own instructor profile**

**Request Body** (`application/json`):
```json
{
  "firstName": "string | null",
  "lastName": "string | null",
  "bio": "string | null",
  "clearProfilePicture": false
}
```

> Set `clearProfilePicture: true` to remove profile picture.

**Response:** `204 No Content`

---

### 4. PATCH `/api/v1/instructor/me/picture`
**Upload/update instructor profile picture**

**Request Body** (`multipart/form-data`):
| Field | Type | Description |
|---|---|---|
| `file` | `IFormFile` | Profile picture image file |

**Response:** `204 No Content`

---

## Admin Endpoints

> Tag: `admin: instructors`  
> **Auth Required:** Yes (Admin role)

### 5. GET `/api/v1/admin/instructors`
**List all instructors (including deleted)**

**Query Parameters:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `isDeleted` | `boolean` | No | Filter by deletion status |
| `cursor` | `string` | No | Pagination cursor |
| `pageSize` | `integer` | No | Items per page |

**Response** (`200 OK`):
```json
{
  "instructors": [
    {
      "id": "uuid",
      "firstName": "string",
      "lastName": "string",
      "displayName": "string",
      "email": "string | null",
      "isDeleted": false
    }
  ],
  "nextCursor": "string | null",
  "hasMore": true
}
```

---

### 6. GET `/api/v1/admin/instructors/{id}`
**Get full instructor details (admin view)**

**Path Parameters:** `id` (uuid)

**Response** (`200 OK`):
```json
{
  "id": "uuid",
  "firstName": "string",
  "lastName": "string",
  "displayName": "string",
  "bio": "string",
  "profilePicturePath": "string | null",
  "email": "string | null",
  "isDeleted": false
}
```

---

### 7. DELETE `/api/v1/admin/instructors/{id}`
**Soft-delete an instructor**

**Path Parameters:** `id` (uuid)

**Response:** `204 No Content`
