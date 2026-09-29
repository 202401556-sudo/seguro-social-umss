import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from './db.js'

const router = Router()
const MAX_INTENTOS = 5
const BLOQUEO_MINUTOS = 15

router.post('/login', async (req, res) => {
  const { correo, contrasena } = req.body
  const credencialesInvalidas = () =>
    res.status(401).json({ error: 'Correo o contraseña incorrectos' })

  if (!correo || !contrasena) return credencialesInvalidas()

  try {
    const { rows } = await pool.query(
      `SELECT *, (bloqueado_hasta IS NOT NULL AND bloqueado_hasta > CURRENT_TIMESTAMP) AS bloqueado
       FROM users WHERE correo = $1`,
      [correo]
    )
    const user = rows[0]
    if (!user || !user.contrasena_hash) return credencialesInvalidas()

    if (user.bloqueado) {
      return res.status(423).json({
        error: 'Cuenta bloqueada temporalmente. Intenta más tarde.',
      })
    }

    const esValida = await bcrypt.compare(contrasena, user.contrasena_hash)
    if (!esValida) {
      await pool.query(
        `UPDATE users
         SET intentos_fallidos = intentos_fallidos + 1,
             bloqueado_hasta = CASE
               WHEN intentos_fallidos + 1 >= $2
               THEN CURRENT_TIMESTAMP + make_interval(mins => $3)
               ELSE bloqueado_hasta END
         WHERE id = $1`,
        [user.id, MAX_INTENTOS, BLOQUEO_MINUTOS]
      )
      return credencialesInvalidas()
    }

    await pool.query(
      'UPDATE users SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = $1',
      [user.id]
    )

    const token = jwt.sign(
      { sub: user.id, correo: user.correo },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    )

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 2 * 60 * 60 * 1000,
    })

    res.json({ user: { id: user.id, nombre: user.nombre, correo: user.correo } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

router.post('/register', async (req, res) => {
  const { correo, contrasena, nombre } = req.body

  if (!correo || !contrasena || !nombre) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' })
  }
  if (contrasena.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' })
  }

  try {
    const existente = await pool.query('SELECT id FROM users WHERE correo = $1', [correo])
    if (existente.rows.length > 0) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo' })
    }

    const hash = await bcrypt.hash(contrasena, 10)
    const { rows } = await pool.query(
      'INSERT INTO users (correo, contrasena_hash, nombre) VALUES ($1, $2, $3) RETURNING id, correo, nombre',
      [correo, hash, nombre]
    )

    const user = rows[0]
    const token = jwt.sign(
      { sub: user.id, correo: user.correo },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    )

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 2 * 60 * 60 * 1000,
    })

    res.status(201).json({ user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

export default router