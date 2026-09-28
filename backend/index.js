import express from 'express'
import cors from 'cors'
import authRoutes from './auth.routes.js'

const app = express()

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())

app.get('/api/salud', (req, res) => res.json({ estado: 'ok' }))
app.use('/api/auth', authRoutes)

app.listen(3000, () => console.log('Backend en http://localhost:3000'))