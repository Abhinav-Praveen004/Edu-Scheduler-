<h1 align="center">
  <br>
  🎓 EduScheduler — University Portal
  <br>
</h1>

<h4 align="center">A smart, AI-powered timetable scheduling platform for students and faculty.</h4>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase" />
  <img src="https://img.shields.io/badge/TypeScript-blue?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css" />
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-project-structure">Project Structure</a> •
  <a href="#-environment-variables">Environment Variables</a> •
  <a href="#-deployment">Deployment</a>
</p>

---

## ✨ Features

### 👨‍🎓 For Students
- **Registration & Login** — Sign up as a student, enroll in available courses
- **Personalized Dashboard** — View CGPA, attendance, cultural activity scores, and achievements
- **Smart Timetable Generator** — Generate a personalized weekly timetable based on your preferences (time slot, teaching pace, style, and learning approach)
- **Course Management** — Edit your enrolled courses anytime from the dashboard
- **Export Options** — Download your timetable as a **PDF**, sync it to your **calendar (.ics)**, or export as **CSV**

### 👨‍🏫 For Faculty
- **Registration & Login** — Sign up as faculty and set your teaching preferences
- **Faculty Dashboard** — View total students, active courses, weekly hours, and average ratings
- **Teaching Preferences** — Update available time slots and teaching styles at any time
- **Schedule View** — Generate and view your own weekly teaching schedule

### 🌐 General
- **Demo Credentials** — Try the app instantly with pre-loaded student/faculty accounts
- **Dark / Light Mode** — Full theme support
- **Responsive Design** — Works across all screen sizes

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Database & Backend** | [Supabase](https://supabase.com/) (PostgreSQL) |
| **PDF Export** | jsPDF + jspdf-autotable |
| **Calendar Export** | iCal format (.ics) |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- A [Supabase](https://supabase.com/) account and project

### 1. Clone the repository

```bash
git clone https://github.com/Abhinav-Praveen004/Edu-Scheduler-.git
cd Edu-Scheduler-
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> You can find these values in your Supabase project under **Settings → API**.

### 4. Set up the database

Run the SQL script in your Supabase **SQL Editor** to create all tables and seed demo data:

```
supabase-schema.sql
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
EduScheduler/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Login page
│   │   ├── register/             # Registration page
│   │   └── dashboard/            # Main dashboard (student & faculty)
│   │       ├── timetable/        # Timetable generator (students)
│   │       └── faculty-schedule/ # Schedule viewer (faculty)
│   ├── components/
│   │   ├── ui/                   # shadcn/ui base components
│   │   ├── timetable-generator.tsx
│   │   ├── timetable-display.tsx
│   │   └── export-buttons.tsx
│   └── lib/
│       ├── supabase.ts           # Supabase client
│       ├── demo-data.ts          # All DB queries & auth logic
│       ├── export.ts             # PDF / CSV / iCal export logic
│       └── types.ts              # Shared TypeScript types
├── supabase-schema.sql           # Database schema + seed data
└── .env.local                    # Environment variables (not committed)
```

---

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase public anonymous key |

> ⚠️ **Never commit your `.env.local` file.** It is already included in `.gitignore`.

---

## ☁️ Deployment

This project is optimized for deployment on **Vercel**.

1. Push your code to GitHub (done ✅)
2. Go to [vercel.com](https://vercel.com/) and import your repository
3. Under **Environment Variables**, add your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy** 🚀

---

## 🧪 Demo Accounts

Once the database is seeded, you can log in with these credentials:

| Role | Email | Password |
|---|---|---|
| Student | alice@university.edu | password123 |
| Student | bob@university.edu | password123 |
| Faculty | smith@university.edu | faculty123 |
| Faculty | doe@university.edu | faculty123 |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">Built with ❤️ for smarter university scheduling</p>
