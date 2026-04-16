// src/services/llmService.js
export class LLMService {
    async generateGameData(theme) {
      const response = await fetch(process.env.N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ theme })
      })
  
      if (!response.ok) {
        throw new Error("Erro ao chamar n8n")
      }
  
      const data = await response.json()
  
      // validação básica
      if (!data.items || !data.secret) {
        throw new Error("Resposta inválida do n8n")
      }
  
      return data
    }
  }