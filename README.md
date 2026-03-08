# 🔥 DailyFit 

Web aplikasi pendukung workout + fitness tracker.

## Stack
- **Frontend**: React + Vite, React Router, Recharts, Lucide Icons
- **Backend**: Express.js, MySQL, JWT Auth
- **Font**: Bebas Neue (display) + Barlow (body)



**Isi `.env`:**
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=GANTI_INI
DB_NAME=dailyfit
JWT_SECRET=GANTI_INI_DENGAN_STRING_RANDOM_PANJANG
PORT=5000
```


## 🌐 URL

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000/api |
| Health Check | http://localhost:5000/api/health |

---

## 📁 Struktur Project

```
dailyfit/
├── backend/
│   ├── config/
│   │   ├── db.js          # MySQL pool connection
│   │   └── init.sql       # Database schema
│   ├── middleware/
│   │   └── auth.js        # JWT middleware
│   ├── routes/
│   │   ├── auth.js        # Register, Login, Me
│   │   ├── exercises.js   # CRUD exercises
│   │   ├── plans.js       # Workout plans CRUD
│   │   ├── checklist.js   # Daily checklist
│   │   └── stats.js       # Statistics & charts
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Sidebar.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── ExercisesPage.jsx
    │   │   ├── PlansPage.jsx
    │   │   ├── ChecklistPage.jsx
    │   │   └── StatsPage.jsx
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Fitur

- ✅ **Auth** — Register & Login dengan JWT
- ✅ **Exercises CRUD** — Library latihan (nama, otot, kategori, set/rep)
- ✅ **Workout Plans** — Buat plan custom, assign exercise, jadwal bebas
- ✅ **Daily Checklist** — Centang latihan harian, filter per tanggal, load dari plan
- ✅ **Statistics** — Streak, completion rate, bar chart, line chart, pie chart kategori
