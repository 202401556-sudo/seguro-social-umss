import pg from 'pg'
import { config } from '../core/config.js'

const pool = new pg.Pool({
  host: config.dbHost,
  port: config.dbPort,
  user: config.dbUser,
  password: config.dbPassword,
  database: config.dbName,
})

export default pool