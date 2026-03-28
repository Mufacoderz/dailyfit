const router = require('express').Router()
const { body, validationResult } = require('express-validator')
const db   = require('../db')
const auth = require('../middleware/auth')

router.use(auth)

// GET /api/exercises
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM exercises WHERE user_id = ? ORDER BY category, name',
      [req.user.id]
    )
    res.json(rows)
  } catch { res.status(500).json({ message: 'Gagal mengambil data.' }) }
})

// POST /api/exercises
router.post('/', [
  body('name').trim().notEmpty().withMessage('Nama wajib diisi'),
  body('sets').isInt({ min: 1 }),
  body('reps').isInt({ min: 1 }),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ message: errors.array()[0].msg })

  const { name, category = 'strength', muscle_group = '', sets, reps, notes = '' } = req.body
  try {
    const [result] = await db.query(
      'INSERT INTO exercises (user_id, name, category, muscle_group, sets, reps, notes) VALUES (?,?,?,?,?,?,?)',
      [req.user.id, name, category, muscle_group, sets, reps, notes]
    )
    const [rows] = await db.query('SELECT * FROM exercises WHERE id = ?', [result.insertId])
    res.status(201).json(rows[0])
  } catch { res.status(500).json({ message: 'Gagal menambah exercise.' }) }
})

// PUT /api/exercises/:id
router.put('/:id', [
  body('name').trim().notEmpty(),
  body('sets').isInt({ min: 1 }),
  body('reps').isInt({ min: 1 }),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ message: errors.array()[0].msg })

  const { name, category = 'strength', muscle_group = '', sets, reps, notes = '' } = req.body
  try {
    const [check] = await db.query('SELECT id FROM exercises WHERE id = ? AND user_id = ?', [req.params.id, req.user.id])
    if (!check.length) return res.status(404).json({ message: 'Exercise tidak ditemukan.' })

    await db.query(
      'UPDATE exercises SET name=?, category=?, muscle_group=?, sets=?, reps=?, notes=? WHERE id=?',
      [name, category, muscle_group, sets, reps, notes, req.params.id]
    )
    const [rows] = await db.query('SELECT * FROM exercises WHERE id = ?', [req.params.id])
    res.json(rows[0])
  } catch { res.status(500).json({ message: 'Gagal update exercise.' }) }
})

// DELETE /api/exercises/:id
router.delete('/:id', async (req, res) => {
  try {
    const [check] = await db.query('SELECT id FROM exercises WHERE id = ? AND user_id = ?', [req.params.id, req.user.id])
    if (!check.length) return res.status(404).json({ message: 'Exercise tidak ditemukan.' })
    await db.query('DELETE FROM exercises WHERE id = ?', [req.params.id])
    res.json({ message: 'Exercise dihapus.' })
  } catch { res.status(500).json({ message: 'Gagal menghapus.' }) }
})

module.exports = router
