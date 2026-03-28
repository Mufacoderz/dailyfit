require('dotenv').config()
const express = require('express')
const cors    = require('cors')

const app = express()

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

app.use('/api/auth',      require('./routes/auth'))
app.use('/api/exercises', require('./routes/exercises'))
app.use('/api/plans',     require('./routes/plans'))
app.use('/api/checklist', require('./routes/checklist'))
app.use('/api/stats',     require('./routes/stats'))

app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date() }))

app.use((_req, res) => res.status(404).json({ message: 'Route tidak ditemukan.' }))
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ message: 'Internal server error.' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`✅  DailyFit server → http://localhost:${PORT}`))
