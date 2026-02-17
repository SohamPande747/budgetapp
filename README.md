# 💰 Spendle – Full-Stack Personal Finance Tracker

A full-stack personal finance tracking application built with **Next.js and Supabase**.

Spendle allows users to securely manage their transactions, monitor budgets, and track spending — with strict database-level user isolation using Row Level Security (RLS).

This project demonstrates production-ready architecture, secure authentication, backend API handling, and scalable database design.

---

## 🚀 Live Demo

🔗 https://spendleapp.vercel.app/

---

## ✨ Features

- Secure email/password authentication  
- Row Level Security (RLS) enforced per user  
- Add / Edit / Delete transactions  
- Account-wise transaction management  
- Budget monitoring and spending summary  
- Server-side API routes (Next.js App Router)  
- Fully responsive UI  
- Production deployment on Vercel  

---

## 🛠 Tech Stack

### Frontend
- Next.js (App Router)
- TypeScript
- CSS Modules

### Backend
- Next.js API Routes
- Supabase Authentication
- PostgreSQL Database

### Security
- Row Level Security (RLS)
- User-based data isolation
- Environment variable protection

### Deployment
- Vercel

---

## 🧱 Architecture Overview

The application follows a full-stack architecture:

1. The client interacts with the Next.js frontend.
2. API routes handle server-side logic.
3. Supabase manages authentication and session handling.
4. PostgreSQL database enforces Row Level Security (RLS) to ensure each user can only access their own data.

All database operations are validated using authenticated user sessions.

---

## 📊 Architecture Diagram

