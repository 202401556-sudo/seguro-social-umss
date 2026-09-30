import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { config } from '../core/config.js'
import authRoutes from './routes/auth.routes.js'
import passport from './passport.js'

const app = express()

app.use(cors({ origin: config.frontendUrl || 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(cookieParser())
app.use(passport.initialize())

app.get('/api/salud', (req, res) => res.json({ estado: 'ok' }))
app.use('/api/auth', authRoutes)

app.listen(3000, () => console.log('Backend en http://localhost:3000'))