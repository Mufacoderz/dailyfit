const router = require('express').Router()
const db   = require('../db')
const auth = require('../middleware/auth')

router.use(auth)

const toDate = (d) => (d instanceof Date ? d : new Date(d)).toISOString().slice(0, 10)

// GET /api/checklist?date=YYYY-MM-DD  (default today)
router.get('/', async (req, res) => {
  const date = req.query.date || toDate(new Date())
  try {
    const [rows] = await db.query(
      `SELECT ci.*, e.category as ex_category
       FROM checklist_items ci
       LEFT JOIN exercises e ON ci.exercise_id = e.id
       WHERE ci.user_id = ? AND ci.date = ?
       ORDER BY ci.created_at`,
      [req.user.id, date]
    )
    // Normalise: use exercise category if item category is empty
    const items = rows.map(r => ({
      ...r,
      category: r.category || r.ex_category || '',
    }))
    res.json(items)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal mengambil checklist.' })
  }
})

// GET /api/checklist/today  (alias)
router.get('/today', async (req, res) => {
  const date = toDate(new Date())
  try {
    const [rows] = await db.query(
      'SELECT * FROM checklist_items WHERE user_id = ? AND date = ? ORDER BY created_at',
      [req.user.id, date]
    )
    res.json({ items: rows, date })
  } catch { res.status(500).json({ message: 'Gagal mengambil checklist.' }) }
})

// POST /api/checklist  — tambah satu item
router.post('/', async (req, res) => {
  const { exerciseId, date } = req.body
  const targetDate = date || toDate(new Date())
  if (!exerciseId) return res.status(422).json({ message: 'exerciseId diperlukan.' })

  try {
    // Ambil detail exercise
    const [exRows] = await db.query(
      'SELECT * FROM exercises WHERE id = ? AND user_id = ?',
      [exerciseId, req.user.id]
    )
    if (!exRows.length) return res.status(404).json({ message: 'Exercise tidak ditemukan.' })
    const ex = exRows[0]

    // Cek duplikat
    const [dup] = await db.query(
      'SELECT id FROM checklist_items WHERE user_id = ? AND date = ? AND exercise_id = ?',
      [req.user.id, targetDate, exerciseId]
    )
    if (dup.length) return res.status(409).json({ message: 'Exercise sudah ada di checklist hari ini.' })

    const [result] = await db.query(
      'INSERT INTO checklist_items (user_id, exercise_id, date, name, sets, reps, category) VALUES (?,?,?,?,?,?,?)',
      [req.user.id, exerciseId, targetDate, ex.name, ex.sets, ex.reps, ex.category]
    )
    const [rows] = await db.query('SELECT * FROM checklist_items WHERE id = ?', [result.insertId])
    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal menambah item.' })
  }
})

// POST /api/checklist/from-plan
router.post('/from-plan', async (req, res) => {
  const { planId, date } = req.body
  const targetDate = date || toDate(new Date())
  if (!planId) return res.status(422).json({ message: 'planId diperlukan.' })

  try {
    // Validasi plan milik user
    const [planRows] = await db.query('SELECT id FROM plans WHERE id = ? AND user_id = ?', [planId, req.user.id])
    if (!planRows.length) return res.status(404).json({ message: 'Plan tidak ditemukan.' })

    // Ambil exercises di plan
    const [exercises] = await db.query(
      `SELECT e.* FROM plan_exercises pe
       JOIN exercises e ON pe.exercise_id = e.id
       WHERE pe.plan_id = ? ORDER BY pe.sort_order`,
      [planId]
    )

    let added = 0
    for (const ex of exercises) {
      const [dup] = await db.query(
        'SELECT id FROM checklist_items WHERE user_id = ? AND date = ? AND exercise_id = ?',
        [req.user.id, targetDate, ex.id]
      )
      if (dup.length) continue
      await db.query(
        'INSERT INTO checklist_items (user_id, exercise_id, date, name, sets, reps, category) VALUES (?,?,?,?,?,?,?)',
        [req.user.id, ex.id, targetDate, ex.name, ex.sets, ex.reps, ex.category]
      )
      added++
    }
    res.json({ message: `${added} exercise ditambahkan ke checklist.`, added })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal memuat plan.' })
  }
})

// PATCH /api/checklist/:id  — toggle done
router.patch('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM checklist_items WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    )
    if (!rows.length) return res.status(404).json({ message: 'Item tidak ditemukan.' })

    const isDone = !rows[0].is_done
    const doneAt = isDone ? new Date() : null
    await db.query('UPDATE checklist_items SET is_done=?, done_at=? WHERE id=?', [isDone ? 1 : 0, doneAt, rows[0].id])

    res.json({ ...rows[0], is_done: isDone, done_at: doneAt })
  } catch { res.status(500).json({ message: 'Gagal toggle item.' }) }
})

// DELETE /api/checklist/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM checklist_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id])
    res.json({ message: 'Item dihapus.' })
  } catch { res.status(500).json({ message: 'Gagal menghapus.' }) }
})

module.exports = router
