import bcrypt from 'bcryptjs'
import pool from './db.js'

const [correo, contrasena, nombre] = process.argv.slice(2)

if (!correo || !contrasena || !nombre) {
  console.log('Uso: node crear_usuario.js correo contrasena "Nombre"')
  process.exit(1)
}

const hash = await bcrypt.hash(contrasena, 10)
await pool.query(
  'INSERT INTO users (correo, contrasena_hash, nombre) VALUES ($1, $2, $3)',
  [correo, hash, nombre]
)
console.log('Usuario creado:', correo)
await pool.end()