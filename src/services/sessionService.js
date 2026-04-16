// src/services/sessionService.js
import { supabase } from '../config/supabaseClient.js'
import { LLMService } from './llmService.js'

export class SessionService {
  constructor() {
    this.llm = new LLMService()
  }

  async createSession(theme) {
    const start = Date.now()

    const llmResponse = await this.llm.generateGameData(theme)

    const end = Date.now()
    const responseTime = end - start

    // Validação básica
    if (!llmResponse.items || !llmResponse.secret) {
      throw new Error("Invalid LLM response")
    }

    const { data, error } = await supabase
      .from('sessions')
      .insert({
        theme,
        llm_response: llmResponse,
        response_time_ms: responseTime
      })
      .select()
      .single()

    if (error) throw error

    return data
  }
}