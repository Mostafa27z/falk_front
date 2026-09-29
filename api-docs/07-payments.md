# Payments API

> Tag: `payments`  
> Base: `/api/v1/payments`  
> **Auth Required:** Yes (Student role, except webhook)

---

## Endpoints

### 1. POST `/api/v1/payments`
**Create a payment for cart items**

**Request Body** (`application/json`):
```json
{
  "gateway": "Paymob",
  "redirectionUrl": "string | null"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `gateway` | `PaymentGateway` | Yes | Payment gateway: `Paymob` |
| `redirectionUrl` | `string \| null` | No | URL to redirect after payment |

**Response** (`200 OK`):
```json
{
  "paymentAttemptId": "uuid",
  "paymentUrl": "https://paymob.com/checkout/..."
}
```

> Redirect the user to `paymentUrl` to complete payment via Paymob.

---

### 2. GET `/api/v1/payments/{paymentAttemptId}`
**Check payment status**

**Path Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `paymentAttemptId` | `uuid` | Payment attempt ID from create response |

**Response** (`200 OK`):
```json
{
  "paymentAttemptId": "uuid",
  "status": "Pending | Succeeded | Failed | Cancelled | Refunded",
  "paymentUrl": "string"
}
```

---

### 3. POST `/api/v1/payments/cancel`
**Cancel a pending payment**

**Request Body:** None (uses current pending payment context)

**Response:** `204 No Content`

---

### 4. POST `/api/v1/payments/paymob/webhook`
**Paymob payment webhook (server-to-server)**

Called by Paymob when payment status changes. Not called by the frontend.

**Response:** `204 No Content`

---

## Payment Flow

```
1. Student adds courses to cart
2. POST /api/v1/payments → get paymentUrl
3. Redirect student to paymentUrl (Paymob checkout)
4. Student completes payment on Paymob
5. Paymob calls webhook → backend updates status
6. Frontend polls GET /api/v1/payments/{id} for status
7. On "Succeeded" → student gains course enrollment
```

## Enums

### PaymentGateway
| Value | Description |
|---|---|
| `Paymob` | Paymob payment gateway (Egypt) |

### PaymentStatus
| Value | Description |
|---|---|
| `Pending` | Payment initiated, awaiting completion |
| `Succeeded` | Payment completed successfully |
| `Failed` | Payment failed |
| `Cancelled` | Payment cancelled by user |
| `Refunded` | Payment refunded |
