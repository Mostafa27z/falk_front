# Data Schemas Reference

> All schemas from the FalkElTawfik OpenAPI v1 specification

---

## Domain Enums

### CourseStatus
```
Draft | Published | Archived
```

### LessonType
```
Written | Video | Quiz | Pdf
```

### VideoStatus
```
Pending | Ready | Failed
```

### PaymentGateway
```
Paymob
```

### PaymentStatus
```
Pending | Succeeded | Failed | Cancelled | Refunded
```

---

## Request Schemas

### Auth.Login.Request
```json
{
  "email": "string",        // required
  "password": "string"      // required
}
```

### Auth.Register.Request
```json
{
  "firstName": "string",    // required
  "lastName": "string",     // required
  "email": "string",        // required
  "phoneNumber": "string",  // required
  "password": "string"      // required
}
```

### Auth.ResetPassword.Request
```json
{
  "email": "string",        // required
  "token": "string",        // required
  "newPassword": "string"   // required
}
```

### Auth.InviteInstructor.Request
```json
{
  "firstName": "string",    // required
  "lastName": "string",     // required
  "email": "string",        // required
  "bio": "string"           // required
}
```

### Students.Update.Request
```json
{
  "firstName": "string | null",
  "lastName": "string | null"
}
```

### Cart.AddItem.Request
```json
{
  "courseId": "uuid",        // required
  "isRenewal": false         // required
}
```

### Courses.Instructor.Create.Request
```json
{
  "title": "string",              // required
  "description": "string",        // required
  "price": 0.00,                  // required
  "renewalPrice": 0.00            // required
}
```

### Courses.Instructor.Update.Request
```json
{
  "title": "string | null",
  "description": "string | null",
  "clearPicturePath": false,
  "price": 0.00,
  "renewalPrice": 0.00
}
```

### Courses.Instructor.CreateSection.Request
```json
{
  "title": "string"               // required
}
```

### Courses.Instructor.UpdateSection.Request
```json
{
  "title": "string | null"
}
```

### Instructors.Update.Request
```json
{
  "firstName": "string | null",
  "lastName": "string | null",
  "bio": "string | null",
  "clearProfilePicture": false
}
```

### Lessons.Instructor.Create.Request
```json
{
  "sectionId": "uuid",            // required
  "title": "string",              // required
  "type": "Written | Video | Quiz", // required
  "content": "string | null",     // for Written type
  "quiz": { ... }                 // for Quiz type (see QuizDto)
}
```

### Lessons.Instructor.UpdateTitle.Request
```json
{
  "title": "string"               // required
}
```

### Lessons.Instructor.UpdateWritten.Request
```json
{
  "content": "string"             // required
}
```

### Lessons.Instructor.UpdateQuiz.Request
```json
{
  "quiz": { ... }                 // required (see QuizDto)
}
```

### Payments.Create.Request
```json
{
  "gateway": "Paymob",            // required
  "redirectionUrl": "string | null"
}
```

---

## Response Schemas

### GetStudentResponse
| Field | Type | Required |
|---|---|---|
| `id` | `uuid` | ✅ |
| `firstName` | `string` | ✅ |
| `lastName` | `string` | ✅ |
| `displayName` | `string` | ✅ |
| `email` | `string` | ✅ |
| `phoneNumber` | `string` | ✅ |

### GetAllCoursesResponse
| Field | Type | Required |
|---|---|---|
| `courses` | `CourseResponse[]` | ✅ |
| `nextCursor` | `string \| null` | ✅ |
| `hasMore` | `boolean` | ✅ |

### CourseResponse (Public)
| Field | Type | Required |
|---|---|---|
| `id` | `uuid` | ✅ |
| `title` | `string` | ✅ |
| `picturePath` | `string \| null` | ✅ |
| `price` | `double` | ✅ |
| `createdAt` | `date-time` | ✅ |
| `instructor` | `string` | ✅ |

### GetCourseResponse (Detail)
| Field | Type | Required |
|---|---|---|
| `id` | `uuid` | ✅ |
| `title` | `string` | ✅ |
| `picturePath` | `string \| null` | ✅ |
| `description` | `string` | ✅ |
| `createdAt` | `date-time` | ✅ |
| `price` | `double` | ✅ |
| `instructorName` | `string` | ✅ |
| `instructorPicture` | `string \| null` | ✅ |
| `sections` | `SectionResponse[]` | ✅ |

### SectionResponse
| Field | Type | Required |
|---|---|---|
| `id` | `uuid` | ✅ |
| `title` | `string` | ✅ |
| `order` | `int32` | ✅ |
| `lessons` | `LessonResponse[]` | ✅ |

### LessonResponse (Summary)
| Field | Type | Required |
|---|---|---|
| `id` | `uuid` | ✅ |
| `title` | `string` | ✅ |
| `order` | `int32` | ✅ |
| `type` | `LessonType` | ✅ |

### GetLessonResponse (Full)
| Field | Type | Required |
|---|---|---|
| `id` | `uuid` | ✅ |
| `title` | `string` | ✅ |
| `order` | `int32` | ✅ |
| `type` | `LessonType` | ✅ |
| `content` | `string \| null` | ✅ |
| `video` | `VideoDTO \| null` | ✅ |
| `quiz` | `QuizDto \| null` | ✅ |
| `pdf` | `PdfDto \| null` | ✅ |

### VideoDTO
| Field | Type | Required |
|---|---|---|
| `externalId` | `string` | ✅ |
| `playbackUrl` | `string` | ✅ |
| `duration` | `string \| null` | ✅ |
| `status` | `VideoStatus` | ✅ |

### QuizDto
| Field | Type | Required |
|---|---|---|
| `passingScore` | `int32` | ✅ |
| `questions` | `QuestionDTO[]` | ✅ |

### QuestionDTO
| Field | Type | Required |
|---|---|---|
| `prompt` | `string` | ✅ |
| `answers` | `AnswerDTO[]` | ✅ |

### AnswerDTO
| Field | Type | Required |
|---|---|---|
| `text` | `string` | ✅ |
| `isCorrect` | `boolean` | ✅ |

### PdfDto
| Field | Type | Required |
|---|---|---|
| `sizeBytes` | `int64` | ✅ |
| `downloadUrl` | `string` | ✅ |

### CartItemResponse
| Field | Type | Required |
|---|---|---|
| `courseId` | `uuid` | ✅ |
| `title` | `string` | ✅ |
| `price` | `double` | ✅ |
| `isRenewal` | `boolean` | ✅ |
| `picturePath` | `string \| null` | ✅ |

### CreatePaymentResponse
| Field | Type | Required |
|---|---|---|
| `paymentAttemptId` | `uuid` | ✅ |
| `paymentUrl` | `string` | ✅ |

### GetPaymentStatusResponse
| Field | Type | Required |
|---|---|---|
| `paymentAttemptId` | `uuid` | ✅ |
| `status` | `PaymentStatus` | ✅ |
| `paymentUrl` | `string` | ✅ |

### VideoInitResult
| Field | Type | Required |
|---|---|---|
| `videoId` | `string` | ✅ |
| `libraryId` | `int32` | ✅ |
| `expirationTime` | `int64` | ✅ |
| `signature` | `string` | ✅ |

### GetInstructorResponse (Public)
| Field | Type | Required |
|---|---|---|
| `id` | `uuid` | ✅ |
| `firstName` | `string` | ✅ |
| `lastName` | `string` | ✅ |
| `displayName` | `string` | ✅ |
| `bio` | `string` | ✅ |
| `profilePicturePath` | `string \| null` | ✅ |

### GetOwnInstructorResponse
| Field | Type | Required |
|---|---|---|
| `id` | `uuid` | ✅ |
| `firstName` | `string` | ✅ |
| `lastName` | `string` | ✅ |
| `displayName` | `string` | ✅ |
| `bio` | `string` | ✅ |
| `profilePicturePath` | `string \| null` | ✅ |
| `email` | `string \| null` | ✅ |

### GetCoursesForAdminResponse
| Field | Type | Required |
|---|---|---|
| `courses` | `AdminCourseResponse[]` | ✅ |
| `nextCursor` | `string \| null` | ✅ |
| `hasMore` | `boolean` | ✅ |

### AdminCourseResponse
| Field | Type | Required |
|---|---|---|
| `id` | `uuid` | ✅ |
| `title` | `string` | ✅ |
| `picturePath` | `string \| null` | ✅ |
| `price` | `double` | ✅ |
| `createdAt` | `date-time` | ✅ |
| `instructor` | `string` | ✅ |
| `status` | `CourseStatus` | ✅ |

### GetInstructorForAdminResponse
| Field | Type | Required |
|---|---|---|
| `id` | `uuid` | ✅ |
| `firstName` | `string` | ✅ |
| `lastName` | `string` | ✅ |
| `displayName` | `string` | ✅ |
| `bio` | `string` | ✅ |
| `profilePicturePath` | `string \| null` | ✅ |
| `email` | `string \| null` | ✅ |
| `isDeleted` | `boolean` | ✅ |

### CreateLessonResponse
| Field | Type | Required |
|---|---|---|
| `id` | `uuid` | ✅ |
| `presigned` | `VideoInitResult \| null` | ✅ |

### PdfLessonResponse (Instructor)
| Field | Type | Required |
|---|---|---|
| `storagePath` | `string` | ✅ |
| `sizeBytes` | `int64` | ✅ |
