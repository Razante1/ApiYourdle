// src/services/llmService.js
import { GoogleGenerativeAI } from "@google/generative-ai"
import dotenv from "dotenv"
import { GAME_SYSTEM_PROMPT } from "../prompts/gamePrompt.js"

dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export class LLMService {
  constructor() {
    this.model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: GAME_SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    })
  }

  async generateGameData(theme) {
    const userPrompt = `O tema escolhido é: "${theme}". Gere a estrutura completa de personagens.`

    let text
    try {
      const result = await this.model.generateContent(userPrompt)
      text = result.response.text()
    } catch (err) {
      console.error("[LLMService] Erro ao chamar a API Gemini:", err.message)
      throw new Error("Falha na chamada à API da IA.")
    }

    console.log("[LLMService] Resposta bruta:\n", text)

    return this.#parseAndValidate(this.#normalizeModelJsonText(text))
  }

  /** Remove cercas ```json ...``` que o modelo às vezes envia apesar do mimeType. */
  #normalizeModelJsonText(text) {
    const trimmed = String(text).trim()
    const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i)
    if (fenced) return fenced[1].trim()
    return trimmed
  }

  #parseAndValidate(text) {
    let parsed

    try {
      parsed = JSON.parse(text)
    } catch {
      const match = text.match(/\{[\s\S]*\}/)
      if (!match) {
        console.error("[LLMService] Não foi possível extrair JSON do texto:", text)
        throw new Error("A IA não retornou um JSON válido.")
      }
      try {
        parsed = JSON.parse(match[0])
      } catch (err) {
        console.error("[LLMService] JSON extraído ainda inválido:", match[0])
        throw new Error("A IA retornou um JSON malformado.")
      }
    }

    const errors = []

    if (!parsed.theme)
      errors.push("Campo 'theme' ausente.")
    if (!Array.isArray(parsed.columns) || parsed.columns.length < 5)
      errors.push(`Campo 'columns' inválido (recebido: ${JSON.stringify(parsed.columns)}).`)
    if (!Array.isArray(parsed.characters) || parsed.characters.length < 8)
      errors.push(`Campo 'characters' inválido (recebido ${parsed.characters?.length ?? 0} personagens).`)
    if (!parsed.secret)
      errors.push("Campo 'secret' ausente.")

    if (errors.length > 0) {
      console.error("[LLMService] Erros de validação:", errors)
      console.error("[LLMService] Objeto recebido:", JSON.stringify(parsed, null, 2))
      throw new Error(`Formato inválido da IA: ${errors.join(" ")}`)
    }

    if (!parsed.characters.some((c) => c.nome === parsed.secret)) {
      console.warn("[LLMService] 'secret' não encontrado na lista — corrigindo automaticamente.")
      const idx = Math.floor(Math.random() * parsed.characters.length)
      parsed.secret = parsed.characters[idx].nome
    }

    return parsed
  }
}