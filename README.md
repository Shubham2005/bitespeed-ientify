# Bitespeed Identity Reconciliation Service

This project implements the `/identify` endpoint for Bitespeed's backend task.

It links multiple orders made with different emails or phone numbers to the same customer identity.

The service is built using:

- Node.js
- TypeScript
- Express
- PostgreSQL
- node-postgres (pg)
- Jest (for testing)
- GitHub Actions (CI)
- Render (deployment)

---

## 🔗 Live API

POST endpoint:

https://bitespeed-ientify.onrender.com/identify

---

## 🧠 Problem Summary

Customers may place multiple orders using different:

- Email addresses
- Phone numbers

If two contacts share either:
- Same email  
- Same phone number  

They must be linked together.

The oldest contact becomes the **primary contact**.
All others become **secondary contacts**.

---

## 📦 API Endpoint

### POST `/identify`

### Request Body (JSON)

```json
{
  "email": "string (optional)",
  "phoneNumber": "string (optional)"
}
