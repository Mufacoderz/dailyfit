# DailyFit 🔥 — Full Stack Workout Tracker

**Stack:** Vue 3 + Vite + Pinia · Express.js · MySQL

---

## Struktur Proyek

```
dailyfit-v2/
├── src/                   # Frontend (Vue 3)
│   ├── assets/main.css
│   ├── components/
│   │   ├── AppLayout.vue  # Sidebar + Bottom Nav
│   │   └── AppModal.vue
│   ├── router/index.js    # Vue Router + auth guard
│   ├── services/api.js    # Axios wrapper
│   ├── stores/authStore.js
│   └── views/
│       ├── LoginView.vue
│       ├── RegisterView.vue
│       ├── HomeView.vue
│       ├── ExercisesView.vue
│       ├── PlansView.vue
│       ├── ChecklistView.vue
│       └── StatsView.vue
├── server/                # Backend (Express)
│   ├── middleware/auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── exercises.js
│   │   ├── plans.js
│   │   ├── checklist.js
│   │   └── stats.js
│   ├── db.js
│   ├── index.js
│   ├── schema.sql
│   └── .env.example
├── package.json           # Frontend deps
├── vite.config.js
└── tailwind.config.js
```

---

## Setup

### 1. Database MySQL

```bash
mysql -u root -p < server/schema.sql
```

### 2. Backend

```bash
cd server
cp .env.example .env
# Edit .env: isi DB_PASSWORD dan JWT_SECRET

npm install
npm run dev        # nodemon, port 3001
```

### 3. Frontend

```bash
# Di root folder
npm install
npm run dev        # Vite, port 5173
```

Buka: **http://localhost:5173**

---

## API Endpoints

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| POST | /api/auth/register | Daftar akun baru |
| POST | /api/auth/login | Login |
| GET  | /api/auth/me | Profil user (auth) |
| GET  | /api/exercises | List exercise user |
| POST | /api/exercises | Tambah exercise |
| PUT  | /api/exercises/:id | Edit exercise |
| DELETE | /api/exercises/:id | Hapus exercise |
| GET  | /api/plans | List plan user |
| POST | /api/plans | Buat plan baru |
| PUT  | /api/plans/:id | Edit plan |
| DELETE | /api/plans/:id | Hapus plan |
| GET  | /api/checklist?date= | Checklist by date |
| POST | /api/checklist | Tambah item |
| POST | /api/checklist/from-plan | Load plan ke checklist |
| PATCH | /api/checklist/:id | Toggle done |
| DELETE | /api/checklist/:id | Hapus item |
| GET  | /api/stats?type=overview\|weekly\|categories | Statistik |

---

## Fitur

- 🔐 **Auth** — Register & Login dengan JWT, data per user terpisah
- 🏠 **Dashboard** — Overview harian: streak, XP, progress bar, exercise list
- 💪 **Exercises** — CRUD exercise: nama, kategori, muscle group, sets, reps, notes
- 📋 **Plans** — Workout plan dengan multi-exercise picker, langsung load ke checklist
- ✅ **Daily Checklist** — Date strip 7 hari, tambah manual/dari plan, centang selesai
- 📊 **Stats** — Streak, bar chart 7 hari, category breakdown, completion trend, tabel detail
- 🎨 **Dark fire theme** — Bebas Neue font, merah-oranye gradient, sidebar desktop, floating bottom nav mobile
