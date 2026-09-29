# Lessons API

> Tags: `lessons`, `instructor: lessons`

---

## Public Endpoints

### 1. GET `/api/v1/lessons/{id}`
**Get lesson content (requires course enrollment)**

**Auth Required:** Yes (Student with enrollment)

**Path Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `id` | `uuid` | Lesson ID |

**Response** (`200 OK`):
```json
{
  "id": "uuid",
  "title": "string",
  "order": 0,
  "type": "Written | Video | Quiz | Pdf",
  "content": "string | null",
  "video": {
    "externalId": "string",
    "playbackUrl": "string",
    "duration": "string | null",
    "status": "Pending | Ready | Failed"
  },
  "quiz": {
    "passingScore": 0,
    "questions": [
      {
        "prompt": "string",
        "answers": [
          {
            "text": "string",
            "isCorrect": true
          }
        ]
      }
    ]
  },
  "pdf": {
    "sizeBytes": 0,
    "downloadUrl": "string"
  }
}
```

> **Note:** Only one of `content`, `video`, `quiz`, or `pdf` will be populated based on the `type` field.

---

### 2. POST `/api/v1/lessons/webhooks/bunny`
**Bunny.net video webhook (server-to-server)**

Called by Bunny CDN when video encoding completes.

**Response:** `204 No Content`

---

## Instructor Endpoints

> Tag: `instructor: lessons`  
> **Auth Required:** Yes (Instructor role)

### 3. POST `/api/v1/instructor/lessons`
**Create a new lesson (Written, Video, or Quiz)**

**Request Body** (`application/json`):
```json
{
  "sectionId": "uuid",
  "title": "string",
  "type": "Written | Video | Quiz",
  "content": "string | null",
  "quiz": {
    "passingScore": 0,
    "questions": [
      {
        "prompt": "string",
        "answers": [
          { "text": "string", "isCorrect": true }
        ]
      }
    ]
  }
}
```

> For `Written` type: provide `content`.  
> For `Quiz` type: provide `quiz`.  
> For `Video` type: use the video upload flow after creation.

**Response** (`200 OK`):
```json
{
  "id": "uuid",
  "presigned": {
    "videoId": "string",
    "libraryId": 0,
    "expirationTime": 0,
    "signature": "string"
  }
}
```

> `presigned` is populated only for Video type. Use it for direct video upload to Bunny.net.

---

### 4. POST `/api/v1/instructor/lessons/pdf`
**Create a PDF lesson**

**Request Body** (`multipart/form-data`):
| Field | Type | Description |
|---|---|---|
| `SectionId` | `uuid` | Section to add lesson to |
| `Title` | `string` | Lesson title |
| `File` | `IFormFile` | PDF file upload |

**Response** (`200 OK`):
```json
{
  "id": "uuid",
  "presigned": null
}
```

---

### 5. DELETE `/api/v1/instructor/lessons/{id}`
**Delete a lesson**

**Path Parameters:** `id` (uuid)

**Response:** `204 No Content`

---

### 6. PATCH `/api/v1/instructor/lessons/{lessonId}/move`
**Move/reorder a lesson**

**Path Parameters:** `lessonId` (uuid)

**Query Parameters:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `sectionId` | `uuid` | Yes | Target section ID |
| `newOrder` | `integer` | Yes | New position (0-indexed) |

**Response:** `204 No Content`

---

### 7. PATCH `/api/v1/instructor/lessons/{id}/title`
**Update lesson title**

**Path Parameters:** `id` (uuid)

**Request Body** (`application/json`):
```json
{
  "title": "string"
}
```

**Response:** `204 No Content`

---

### 8. PATCH `/api/v1/instructor/lessons/{id}/written`
**Update written lesson content**

**Path Parameters:** `id` (uuid)

**Request Body** (`application/json`):
```json
{
  "content": "string"
}
```

**Response:** `204 No Content`

---

### 9. PATCH `/api/v1/instructor/lessons/{id}/video`
**Re-initialize video upload (get new presigned URL)**

**Path Parameters:** `id` (uuid)

**Response** (`200 OK`):
```json
{
  "videoId": "string",
  "libraryId": 0,
  "expirationTime": 0,
  "signature": "string"
}
```

---

### 10. PATCH `/api/v1/instructor/lessons/{id}/quiz`
**Update quiz lesson content**

**Path Parameters:** `id` (uuid)

**Request Body** (`application/json`):
```json
{
  "quiz": {
    "passingScore": 70,
    "questions": [
      {
        "prompt": "What is 2+2?",
        "answers": [
          { "text": "3", "isCorrect": false },
          { "text": "4", "isCorrect": true },
          { "text": "5", "isCorrect": false }
        ]
      }
    ]
  }
}
```

**Response:** `204 No Content`

---

### 11. PATCH `/api/v1/instructor/lessons/{id}/pdf`
**Update PDF file for a PDF lesson**

**Path Parameters:** `id` (uuid)

**Request Body** (`multipart/form-data`):
| Field | Type | Description |
|---|---|---|
| `file` | `IFormFile` | New PDF file |

**Response** (`200 OK`):
```json
{
  "storagePath": "string",
  "sizeBytes": 0
}
```

---

## Lesson Type Reference

| Type | Content Source | Upload Method |
|---|---|---|
| `Written` | `content` field (HTML/markdown) | JSON body |
| `Video` | Bunny.net CDN | Presigned upload URL |
| `Quiz` | `quiz` object | JSON body |
| `Pdf` | Binary file | Multipart form upload |
