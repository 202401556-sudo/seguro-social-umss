import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { config } from '../core/config.js'
import pool from '../database/db.js'

passport.use(new GoogleStrategy({
  clientID: config.googleClientId,
  clientSecret: config.googleClientSecret,
  callbackURL: config.googleCallbackUrl,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const correo = profile.emails[0].value
    const nombre = profile.displayName

    if (!correo.endsWith('@gmail.com')) {
      return done(null, false, { message: 'Debes usar una cuenta de Gmail' })
    }

    let { rows } = await pool.query('SELECT * FROM users WHERE google_id = $1', [profile.id])
    let user = rows[0]

    if (!user) {
      const existente = await pool.query('SELECT * FROM users WHERE correo = $1', [correo])
      if (existente.rows[0]) {
        await pool.query('UPDATE users SET google_id = $1 WHERE id = $2', [profile.id, existente.rows[0].id])
        user = existente.rows[0]
      } else {
        const nuevo = await pool.query(
          'INSERT INTO users (correo, nombre, google_id) VALUES ($1, $2, $3) RETURNING *',
          [correo, nombre, profile.id]
        )
        user = nuevo.rows[0]
      }
    }

    done(null, user)
  } catch (err) {
    done(err, null)
  }
}))

export default passport