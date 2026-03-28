const router  = require('express').Router()
const bcrypt  = require('bcryptjs')
const jwt     = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const db      = require('../db')
const auth    = require('../middleware/auth')

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

// POST /api/auth/register
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Nama minimal 2 karakter'),
  body('email').isEmail().normalizeEmail().withMessage('Format email tidak valid'),
  body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ message: errors.array()[0].msg })

  const { name, email, password } = req.body
  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length) return res.status(409).json({ message: 'Email sudah terdaftar.' })

    const hash = await bcrypt.hash(password, 12)
    const [result] = await db.query('INSERT INTO users (name, email, password) VALUES (?,?,?)', [name, email, hash])
    const userId = result.insertId

    // Seed default exercises
    const defaults = [
      ['Push Up','strength','Chest',3,15,'Classic bodyweight chest exercise.'],
      ['Squat','strength','Legs',4,12,'Fundamental lower body movement.'],
      ['Pull Up','strength','Back',3,8,'Upper body pulling exercise.'],
      ['Plank','strength','Core',3,60,'Isometric core stability hold.'],
      ['Lunges','strength','Legs',3,12,'Single-leg lower body exercise.'],
      ['Dips','strength','Triceps',3,10,'Triceps and chest pressing movement.'],
    ]
    for (const [n,cat,mg,s,r,notes] of defaults) {
      await db.query(
        'INSERT INTO exercises (user_id, name, category, muscle_group, sets, reps, notes) VALUES (?,?,?,?,?,?,?)',
        [userId, n, cat, mg, s, r, notes]
      )
    }

    const [rows] = await db.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [userId])
    res.status(201).json({ token: signToken(rows[0]), user: rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Terjadi kesalahan server.' })
  }
})

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ message: errors.array()[0].msg })

  const { email, password } = req.body
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email])
    if (!rows.length) return res.status(401).json({ message: 'Email atau password salah.' })

    const match = await bcrypt.compare(password, rows[0].password)
    if (!match) return res.status(401).json({ message: 'Email atau password salah.' })

    const { password: _, ...user } = rows[0]
    res.json({ token: signToken(user), user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Terjadi kesalahan server.' })
  }
})

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [req.user.id])
    if (!rows.length) return res.status(404).json({ message: 'User tidak ditemukan.' })
    res.json({ user: rows[0] })
  } catch {
    res.status(500).json({ message: 'Terjadi kesalahan server.' })
  }
})

// PATCH /api/auth/profile
router.patch('/profile', auth, async (req, res) => {
  const { name } = req.body
  try {
    await db.query('UPDATE users SET name = COALESCE(?, name) WHERE id = ?', [name || null, req.user.id])
    const [rows] = await db.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [req.user.id])
    res.json({ user: rows[0] })
  } catch {
    res.status(500).json({ message: 'Terjadi kesalahan server.' })
  }
})

// PATCH /api/auth/password
router.patch('/password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword || newPassword.length < 6)
    return res.status(422).json({ message: 'Password baru minimal 6 karakter.' })
  try {
    const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id])
    const match = await bcrypt.compare(currentPassword, rows[0].password)
    if (!match) return res.status(401).json({ message: 'Password lama salah.' })
    const hash = await bcrypt.hash(newPassword, 12)
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hash, req.user.id])
    res.json({ message: 'Password berhasil diubah.' })
  } catch {
    res.status(500).json({ message: 'Terjadi kesalahan server.' })
  }
})

module.exports = router
