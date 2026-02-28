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
```
At least one of email or phoneNumber must be provided.
---
### Response Format
```json
{
  "contact": {
    "primaryContactId": number,
    "emails": ["primary email", "..."],
    "phoneNumbers": ["primary phone", "..."],
    "secondaryContactIds": [number]
  }
}
```
---
## ⚙️ How It Works

1. Checks existing contacts matching email or phone.
2. If none found → creates new primary contact.
3. If found:
   - Determines oldest primary.
   - Converts other primaries to secondary.
   - Adds new secondary if new info provided.
4. Returns consolidated identity.



---

## 🛠 Local Setup

### 1. Clone the repository
```
git clone https://github.com/Shubham2005/bitespeed-ientify.git
cd bitespeed-ientify
```
### 2. Install dependencies
```
npm install
```
### 3. Create `.env`
```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/bitespeed
```
### 4. Start PostgreSQL (Docker)
```
docker compose up -d
```
### 5. Run the server
Development mode:
```
npm run dev
```
Production mode:
```
npm run build
npm start
```
---
## Run Tests
```
npm test
```
Tests include:
  - Validation checks
  - New primary creation
  - Duplicate prevention
  - Secondary creation
  - Primary merging

---

## Deployment

The project is deployed on Render.

---

## 📂 Project Structure
```
src/
  controllers/
  services/
  routes/
  db.ts
  app.ts
schema.sql
```
---

## 🔐 Database Schema

**Table:** `Contact`

### Columns

- id (Primary Key)
- email
- phoneNumber
- linkedId
- linkPrecedence (primary | secondary)
- createdAt
- updatedAt
- deletedAt

### Indexes

Indexes are created on:

- email
- phoneNumber
- linkedId

---

## ✅ Features Implemented

- Identity reconciliation logic
- Transaction-safe database operations
- Automated test coverage
- Continuous Integration using GitHub Actions
- Production deployment on Render
- SSL-secured PostgreSQL connection

