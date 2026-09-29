import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../../core/config.js'
import * as AuthService from '../../services/auth.service.js'

const router = Router()

function setCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 2 * 60 * 60 * 1000,
  })
}

router.post('/login', async (req, res) => {
  const { correo, contrasena } = req.body
  if (!correo || !contrasena) return res.status(401).json({ error: 'Correo o contraseña incorrectos' })
  try {
    const { token, user } = await AuthService.login(correo, contrasena)
    setCookie(res, token)
    res.json({ user })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Error del servidor' })
  }
})

router.post('/register', async (req, res) => {
  const { correo, contrasena, nombre } = req.body
  if (!correo || !contrasena || !nombre) return res.status(400).json({ error: 'Todos los campos son obligatorios' })
  try {
    const { token, user } = await AuthService.register(correo, contrasena, nombre)
    setCookie(res, token)
    res.status(201).json({ user })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Error del servidor' })
  }
})

router.get('/me', (req, res) => {
  const token = req.cookies?.token
  if (!token) return res.status(401).json({ error: 'No autenticado' })
  try {
    const datos = jwt.verify(token, config.jwtSecret)
    res.json({ correo: datos.correo })
  } catch {
    res.status(401).json({ error: 'Token inválido' })
  }
})

export default router