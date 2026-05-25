import { GoogleGenerativeAI } from '@google/generative-ai'
import type { LLMAdapter, PlanInput } from './adapter'

type Cfg = {
  apiKey: string
  model: string
  temperature?: number
  maxTokens?: number
}

export function makeGeminiAdapter(cfg: Cfg): LLMAdapter {
  const client = new GoogleGenerativeAI(cfg.apiKey)
  return {
    async *streamPlan(input: PlanInput) {
      const model = client.getGenerativeModel({
        model: cfg.model,
        systemInstruction: input.system,
        generationConfig: {
          temperature: cfg.temperature ?? 0.7,
          maxOutputTokens: cfg.maxTokens ?? 512,
        },
      })
      const result = await model.generateContentStream(input.user)
      for await (const chunk of result.stream) {
        const text = chunk.text()
        if (text) yield text
      }
    },
  }
}
