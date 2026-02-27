# BiteSpeed Identity Reconciliation Backend

## 📌 Overview

This project implements an Identity Reconciliation service as part of the BiteSpeed backend task.

The service identifies and links multiple contact records belonging to the same customer based on shared email or phone number.

It ensures:
- Exactly one primary contact per identity cluster
- All other related contacts marked as secondary
- Deterministic primary selection (oldest contact wins)

---

## 🛠 Tech Stack

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- Prisma ORM

---

## 🚀 Hosted Endpoint

POST  
