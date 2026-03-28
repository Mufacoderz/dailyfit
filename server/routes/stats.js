const router = require('express').Router()
const db   = require('../db')
const auth = require('../middleware/auth')

router.use(auth)

// GET /api/stats?type=overview|weekly|categories
router.get('/', async (req, res) => {
  const { type = 'overview' } = req.query
  const uid = req.user.id

  try {
    if (type === 'overview') {
      // Total exercises done all time
      const [[totals]] = await db.query(
        `SELECT
          COUNT(*)                            AS totalExercises,
          COUNT(DISTINCT date)                AS totalWorkoutDays,
          ROUND(AVG(is_done) * 100)           AS completionRate
         FROM checklist_items WHERE user_id = ?`,
        [uid]
      )

      // Streak
      const [sessions] = await db.query(
        `SELECT DISTINCT date FROM checklist_items
         WHERE user_id = ? AND is_done = 1
         ORDER BY date DESC`,
        [uid]
      )
      let streak = 0
      const today = new Date()
      for (const row of sessions) {
        const expected = new Date(today)
        expected.setDate(expected.getDate() - streak)
        const rowDate = typeof row.date === 'string' ? row.date : row.date.toISOString().slice(0,10)
        const expStr  = expected.toISOString().slice(0,10)
        if (rowDate === expStr) streak++
        else break
      }

      return res.json({ ...totals, streak })
    }

    if (type === 'weekly') {
      const days = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().slice(0,10)
        const label   = d.toLocaleDateString('en',{ weekday:'short' })
        const fullDate= d.toLocaleDateString('id-ID',{ day:'numeric', month:'short' })

        const [[row]] = await db.query(
          `SELECT
            COUNT(*)       AS total,
            SUM(is_done)   AS completed
           FROM checklist_items WHERE user_id = ? AND date = ?`,
          [uid, dateStr]
        )
        days.push({
          day:       label,
          fullDate,
          date:      dateStr,
          total:     Number(row.total)     || 0,
          completed: Number(row.completed) || 0,
        })
      }
      return res.json(days)
    }

    if (type === 'categories') {
      const [rows] = await db.query(
        `SELECT category, COUNT(*) AS total
         FROM checklist_items
         WHERE user_id = ? AND is_done = 1 AND category != ''
         GROUP BY category ORDER BY total DESC`,
        [uid]
      )
      return res.json(rows)
    }

    res.status(400).json({ message: 'type tidak valid.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal mengambil statistik.' })
  }
})

module.exports = router
