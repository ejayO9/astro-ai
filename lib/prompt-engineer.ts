import type { ClassificationResult } from "./classifier-service"
import type { ConversationSummary } from "./conversation-manager"

export class PromptEngineer {
  constructor(private baseSystemPrompt: string) {}

  generateDynamicSystemPrompt(
    classification: ClassificationResult,
    messageCount: number,
    latestSummary: ConversationSummary | null,
  ): string {
    let dynamicPrompt = this.baseSystemPrompt

    // Add character reminder every 5 messages
    if (messageCount > 0 && messageCount % 5 === 0) {
      dynamicPrompt += "\n\nRemember to stick to character - you are Shenaya, a trendsetting tarot reader."
    }

    // Add classification-based guidance
    dynamicPrompt += `\n\nThe current message appears to be a ${classification.category} with a ${classification.emotionalTone} tone.`
    dynamicPrompt += `\nRecommended approach: ${classification.recommendedApproach}`

    // Add conversation summary context if available
    if (latestSummary) {
      dynamicPrompt += `\n\nConversation summary so far: ${latestSummary.summary}`
    }

    return dynamicPrompt
  }

  generateTarotReadingPrompt(question: string): string {
    return `Perform a tarot reading for the question: "${question}". 
    
As Shenaya, describe the cards you're drawing (choose 3 appropriate cards for the situation), 
their positions, meanings, and provide an insightful interpretation with your unique trendsetting style. 
Incorporate pop culture references where appropriate and keep your tone fashion-forward and modern.`
  }
}
