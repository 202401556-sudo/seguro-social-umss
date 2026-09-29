import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from '../core/config.js'
import * as UserModel from '../database/user.model.js'

const MAX_INTENTOS = 5
const BLOQUEO_MINUTOS = 15

function firmarToken(user) {
  return jwt.sign({ sub: user.id, correo: user.correo }, config.jwtSecret, { expiresIn: '2h' })
}

export async function login(correo, contrasena) {
  const user = await UserModel.findByEmail(correo)
  if (!user || !user.contrasena_hash) throw { status: 401, message: 'Correo o contraseña incorrectos' }
  if (user.bloqueado) throw { status: 423, message: 'Cuenta bloqueada temporalmente. Intenta más tarde.' }

  const esValida = await bcrypt.compare(contrasena, user.contrasena_hash)
  if (!esValida) {
    await UserModel.registerFailedAttempt(user.id, MAX_INTENTOS, BLOQUEO_MINUTOS)
    throw { status: 401, message: 'Correo o contraseña incorrectos' }
  }

  await UserModel.resetFailedAttempts(user.id)
  const token = firmarToken(user)
  return { token, user: { id: user.id, nombre: user.nombre, correo: user.correo } }
}

export async function register(correo, contrasena, nombre) {
  if (!correo.endsWith('@gmail.com')) {
    throw { status: 400, message: 'Debes registrarte con un correo de Gmail' }
  }
  if (contrasena.length < 8) {
    throw { status: 400, message: 'La contraseña debe tener al menos 8 caracteres' }
  }
  if (await UserModel.existsByEmail(correo)) {
    throw { status: 409, message: 'Ya existe una cuenta con ese correo' }
  }

  const hash = await bcrypt.hash(contrasena, 10)
  const user = await UserModel.createUser({ correo, hash, nombre })
  const token = firmarToken(user)
  return { token, user }
}