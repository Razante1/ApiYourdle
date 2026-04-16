// src/app.js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createSession } from './controllers/sessionController.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

// rota principal
app.post('/session', createSession)

// health check (Render)
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`)
})