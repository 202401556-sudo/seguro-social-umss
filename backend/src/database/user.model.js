import pool from './db.js'

export async function findByEmail(correo) {
  const { rows } = await pool.query(
    `SELECT *, (bloqueado_hasta IS NOT NULL AND bloqueado_hasta > CURRENT_TIMESTAMP) AS bloqueado
     FROM users WHERE correo = $1`,
    [correo]
  )
  return rows[0]
}

export async function existsByEmail(correo) {
  const { rows } = await pool.query('SELECT id FROM users WHERE correo = $1', [correo])
  return rows.length > 0
}

export async function createUser({ correo, hash, nombre }) {
  const { rows } = await pool.query(
    'INSERT INTO users (correo, contrasena_hash, nombre) VALUES ($1, $2, $3) RETURNING id, correo, nombre',
    [correo, hash, nombre]
  )
  return rows[0]
}

export async function registerFailedAttempt(id, maxIntentos, bloqueoMinutos) {
  await pool.query(
    `UPDATE users
     SET intentos_fallidos = intentos_fallidos + 1,
         bloqueado_hasta = CASE
           WHEN intentos_fallidos + 1 >= $2
           THEN CURRENT_TIMESTAMP + make_interval(mins => $3)
           ELSE bloqueado_hasta END
     WHERE id = $1`,
    [id, maxIntentos, bloqueoMinutos]
  )
}

export async function resetFailedAttempts(id) {
  await pool.query('UPDATE users SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = $1', [id])
}