# Mathematics 67 · Class Directory

A **professional, private class directory** for Math Batch 67, University of Rajshahi.

## Features

- **Public view**: Name + Blood Group + Facebook link only
- **Secure login**: Student ID + Phone Number
- **Full details** after login (phone, email, district, college, profile picture)
- **Edit own profile** + upload profile picture (via URL)
- **Live search** + Blood Group filter
- **Modern dark UI** with glassmorphism
- **Responsive** (mobile-first)
- **Neon PostgreSQL** database
- **Session-based auth** (JWT cookie, 30 days)

---

## Quick Start (5–10 minutes)

### 1. Create Neon Database (Free)

1. Go to [https://console.neon.tech](https://console.neon.tech) and sign up / login
2. Create a new project (name it `math67`)
3. Copy the **Connection string** (it looks like `postgresql://...@ep-xxxx.neon.tech/neondb?sslmode=require`)

### 2. Setup Project Locally

```bash
# Go into the project folder
cd math67-directory

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env` and paste your Neon connection string + a random JWT secret:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-super-long-random-secret-here-32chars+"
```

### 3. Create Tables + Seed Data

```bash
# Push schema to Neon
npx prisma db push

# Seed all 120 students from the original list
npm run db:seed
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## How to Login (Test)

Use any student from the list. Example:

- **Student ID**: `2112021101`
- **Phone**: `01773824282`

Or the creator:

- **Student ID**: `1911121112`
- **Phone**: `01774085300`

---

## Deploy to Vercel (Free + Professional)

1. Push the project to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import
3. Add the same environment variables (`DATABASE_URL`, `JWT_SECRET`)
4. Deploy

Vercel automatically handles HTTPS, CDN, and serverless functions.

---

## Project Structure

```
math67-directory/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Seed script
│   └── students_data.json     # Original 120 students
├── src/
│   ├── app/
│   │   ├── page.tsx           # Public directory
│   │   ├── login/page.tsx     # Login
│   │   ├── profile/page.tsx   # Edit own profile
│   │   └── api/               # Backend routes
│   ├── components/            # UI components
│   ├── lib/                   # Auth, Prisma, utils
│   └── types/
├── .env.example
└── README.md
```

---

## Security Notes

- Full contact details are **never shown** without login
- Session is HTTP-only cookie (cannot be stolen via JS)
- Phone is used as simple password (convenient for classmates)
- You can later add real password hashing or OTP if needed
- `robots: noindex` prevents search engines from indexing

---

## Future Improvements (Optional)

- Real image upload (Cloudinary / Vercel Blob)
- Password field instead of phone
- Admin panel to add/remove students
- Group chat or notice board
- Dark/Light theme toggle

---

Made for Mathematics Batch 67 · University of Rajshahi
