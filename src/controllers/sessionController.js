// src/controllers/sessionController.js
import { SessionService } from '../services/sessionService.js'

const sessionService = new SessionService()

export async function createSession(req, res) {
  try {
    const { theme } = req.body

    if (!theme) {
      return res.status(400).json({ error: "Theme is required" })
    }

    const session = await sessionService.createSession(theme)

    res.json({
      sessionId: session.id,
      data: session.llm_response
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}