# Cart API

> Tag: `cart`  
> Base: `/api/v1/cart`  
> **Auth Required:** Yes (Student role)

---

## Endpoints

### 1. GET `/api/v1/cart/items`
**Get all items in the shopping cart**

**Response** (`200 OK`):
```json
[
  {
    "courseId": "uuid",
    "title": "string",
    "price": 0.00,
    "isRenewal": false,
    "picturePath": "string | null"
  }
]
```

**Schema: CartItemResponse**

| Field | Type | Required | Description |
|---|---|---|---|
| `courseId` | `uuid` | ✅ | Course ID |
| `title` | `string` | ✅ | Course title |
| `price` | `double` | ✅ | Course price |
| `isRenewal` | `boolean` | ✅ | Whether this is a renewal purchase |
| `picturePath` | `string \| null` | ✅ | Course picture URL |

---

### 2. POST `/api/v1/cart/items`
**Add a course to the cart**

**Request Body** (`application/json`):
```json
{
  "courseId": "uuid",
  "isRenewal": false
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `courseId` | `uuid` | Yes | Course to add |
| `isRenewal` | `boolean` | Yes | `true` if renewing an expired enrollment |

**Responses:**
| Code | Description |
|---|---|
| `204` | No Content — Item added to cart |
| `400` | Bad Request — Already enrolled or invalid course |
| `404` | Not Found — Course doesn't exist |
| `409` | Conflict — Course already in cart |

---

### 3. DELETE `/api/v1/cart/items/{courseId}`
**Remove a course from the cart**

**Path Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `courseId` | `uuid` | Course ID to remove |

**Response:** `204 No Content`
