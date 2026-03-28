const router = require('express').Router()
const { body, validationResult } = require('express-validator')
const db   = require('../db')
const auth = require('../middleware/auth')

router.use(auth)

// GET /api/plans
router.get('/', async (req, res) => {
  try {
    const [plans] = await db.query(
      'SELECT * FROM plans WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    )
    for (const plan of plans) {
      const [exRows] = await db.query(
        `SELECT pe.exercise_id, e.name, e.category, e.sets, e.reps
         FROM plan_exercises pe
         JOIN exercises e ON pe.exercise_id = e.id
         WHERE pe.plan_id = ? ORDER BY pe.sort_order`,
        [plan.id]
      )
      plan.exercises = exRows
    }
    res.json(plans)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal mengambil plans.' })
  }
})

// POST /api/plans
router.post('/', [
  body('name').trim().notEmpty().withMessage('Nama plan wajib diisi'),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ message: errors.array()[0].msg })

  const { name, description = '', exerciseIds = [] } = req.body
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()
    const [result] = await conn.query(
      'INSERT INTO plans (user_id, name, description) VALUES (?,?,?)',
      [req.user.id, name, description]
    )
    const planId = result.insertId
    for (let i = 0; i < exerciseIds.length; i++) {
      await conn.query(
        'INSERT INTO plan_exercises (plan_id, exercise_id, sort_order) VALUES (?,?,?)',
        [planId, exerciseIds[i], i]
      )
    }
    await conn.commit()

    const [rows] = await db.query('SELECT * FROM plans WHERE id = ?', [planId])
    const [exRows] = await db.query(
      `SELECT pe.exercise_id, e.name, e.category, e.sets, e.reps
       FROM plan_exercises pe JOIN exercises e ON pe.exercise_id = e.id
       WHERE pe.plan_id = ? ORDER BY pe.sort_order`, [planId]
    )
    rows[0].exercises = exRows
    res.status(201).json(rows[0])
  } catch (err) {
    await conn.rollback()
    console.error(err)
    res.status(500).json({ message: 'Gagal membuat plan.' })
  } finally { conn.release() }
})

// PUT /api/plans/:id
router.put('/:id', [
  body('name').trim().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ message: errors.array()[0].msg })

  const { name, description = '', exerciseIds = [] } = req.body
  const conn = await db.getConnection()
  try {
    const [check] = await conn.query('SELECT id FROM plans WHERE id = ? AND user_id = ?', [req.params.id, req.user.id])
    if (!check.length) return res.status(404).json({ message: 'Plan tidak ditemukan.' })

    await conn.beginTransaction()
    await conn.query('UPDATE plans SET name=?, description=? WHERE id=?', [name, description, req.params.id])
    await conn.query('DELETE FROM plan_exercises WHERE plan_id = ?', [req.params.id])
    for (let i = 0; i < exerciseIds.length; i++) {
      await conn.query('INSERT INTO plan_exercises (plan_id, exercise_id, sort_order) VALUES (?,?,?)', [req.params.id, exerciseIds[i], i])
    }
    await conn.commit()

    const [rows] = await db.query('SELECT * FROM plans WHERE id = ?', [req.params.id])
    const [exRows] = await db.query(
      `SELECT pe.exercise_id, e.name, e.category, e.sets, e.reps
       FROM plan_exercises pe JOIN exercises e ON pe.exercise_id = e.id
       WHERE pe.plan_id = ? ORDER BY pe.sort_order`, [req.params.id]
    )
    rows[0].exercises = exRows
    res.json(rows[0])
  } catch (err) {
    await conn.rollback()
    res.status(500).json({ message: 'Gagal update plan.' })
  } finally { conn.release() }
})

// DELETE /api/plans/:id
router.delete('/:id', async (req, res) => {
  try {
    const [check] = await db.query('SELECT id FROM plans WHERE id = ? AND user_id = ?', [req.params.id, req.user.id])
    if (!check.length) return res.status(404).json({ message: 'Plan tidak ditemukan.' })
    await db.query('DELETE FROM plans WHERE id = ?', [req.params.id])
    res.json({ message: 'Plan dihapus.' })
  } catch { res.status(500).json({ message: 'Gagal menghapus.' }) }
})

module.exports = router
