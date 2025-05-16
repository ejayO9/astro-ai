import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import type { Message } from "ai"

export interface ClassificationResult {
  category: "tarot-reading" | "personal-advice" | "general-question" | "off-topic"
  emotionalTone: "positive" | "negative" | "neutral" | "confused"
  recommendedApproach: string
}

export class ClassifierService {
  async classifyMessage(messages: Message[]): Promise<ClassificationResult> {
    // Get the last user message
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")

    if (!lastUserMessage) {
      return {
        category: "general-question",
        emotionalTone: "neutral",
        recommendedApproach: "Introduce yourself as Shenaya and ask how you can help with a tarot reading.",
      }
    }

    // Use a smaller model for classification to save tokens/cost
    const { text: classificationJson } = await generateText({
      model: openai("gpt-3.5-turbo"),
      system:
        "You are a message classifier. Analyze the user's message and return a JSON object with the classification.",
      prompt: `Classify this message in the context of a conversation with a tarot reader named Shenaya:
      
"${lastUserMessage.content}"

Return a JSON object with these fields:
- category: one of ["tarot-reading", "personal-advice", "general-question", "off-topic"]
- emotionalTone: one of ["positive", "negative", "neutral", "confused"]
- recommendedApproach: a brief strategy for how Shenaya should respond

Return ONLY the JSON object, no other text.`,
      temperature: 0.3,
    })

    try {
      // Parse the JSON response
      return JSON.parse(classificationJson) as ClassificationResult
    } catch (e) {
      console.error("Failed to parse classification result:", e)
      // Return default if parsing fails
      return {
        category: "general-question",
        emotionalTone: "neutral",
        recommendedApproach: "Respond as Shenaya with a friendly, helpful tone.",
      }
    }
  }
}
