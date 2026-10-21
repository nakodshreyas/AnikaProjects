# Anika Projects — Next.js + Supabase Full-Stack Application

This directory contains the complete Next.js 15 (App Router) conversion of the Anika Projects platform, equipped with backend API route handlers, Supabase PostgreSQL database integration, and Supabase Storage for project image elevations.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js 18.17+ or Node.js 20+
- A free [Supabase](https://supabase.com) account and project.

### 2. Configure Supabase Database & Storage
1. Open your Supabase Dashboard -> **SQL Editor**.
2. Open `/supabase/schema.sql` from this repository.
3. Paste the contents into the SQL Editor and click **Run**.
   - This creates the `projects`, `project_units`, `leads`, and `reviews` tables.
   - It sets up Row Level Security (RLS) policies.
   - It initializes the `project-images` Storage bucket for photos.

### 3. Environment Variables
Create a `.env.local` file in your root folder:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-public-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-secret-key"
```

### 4. Install Dependencies & Run
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🛠️ Backend API Routes Overview

| Route | Method | Description |
|---|---|---|
| `/api/contact` | `POST` | Validates customer inquiries and inserts leads into Supabase `leads` table. |
| `/api/contact` | `GET` | Retrieves all customer leads and site visit requests. |
| `/api/upload` | `POST` | Multi-image file uploader streaming photos directly to Supabase Storage `project-images` bucket. |
| `/api/projects` | `GET` | Fetches all projects joined with their real-time unit inventories. |
| `/api/projects` | `POST` | Upserts project dossiers and specifications into the database. |
| `/api/units` | `PUT` | Updates real-time unit availability (Available / Booked / Sold) in the `project_units` table. |

---

## 📦 Deployment to Vercel
1. Push your code to GitHub.
2. Go to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import the repository.
4. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Click **Deploy**.
