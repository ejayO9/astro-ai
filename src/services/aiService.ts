import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import type { Message } from "ai";

export interface AIModel {
  name: string;
  maxTokens: number;
  temperature: number;
}

export class AIService {
  private static readonly models: AIModel[] = [
    { name: "gpt-4", maxTokens: 1500, temperature: 0.7 },
    { name: "gpt-3.5-turbo", maxTokens: 1200, temperature: 0.7 },
  ];

  /**
   * Generate text response using OpenAI with fallback strategy
   */
  static async generateResponse(messages: Message[]): Promise<{
    text: string;
    modelUsed: string;
    tokensUsed?: number;
    responseTime: number;
  }> {
    const startTime = Date.now();
    let fullResponse: string | null = null;
    let modelUsed = "";
    let tokensUsed: number | undefined;
    let lastError = "";

    // Try each model until we get a response
    for (const model of this.models) {
      if (fullResponse !== null) break;

      console.log(`[AI] Trying model: ${model.name}`);

      try {
        /*
        TODO: Check if all the logs made in the try block are detailed enough.
        */ 

        
        // Log system prompt info for debugging
        const systemPrompt = messages.find(m => m.role === "system")?.content;

        /*
        TODO: in /api/chat the below if condition is different (line 316) . it includes the characterId as well. Check why its there and what is its significance.
        if (systemPrompt && typeof systemPrompt === 'string' && characterId === "guruji") {
        */
        if (systemPrompt && typeof systemPrompt === 'string') {
          console.log(`[AI] System prompt length: ${systemPrompt.length}`);
          if (systemPrompt.includes("PLANETARY POSITIONS")) {
            console.log(`[AI] 🔮 Enhanced astrological prompt detected`);
          }
        }

        /*
        TODO: check why streamText is not used here and generateText is used instead. The comment in /api/chat (line 326) says that there are issues with streaming.
        */
        const result = await generateText({
          model: openai(model.name),
          messages,
          temperature: model.temperature,
          maxTokens: model.maxTokens,
        });

        fullResponse = result.text;
        modelUsed = model.name;
        tokensUsed = result.usage?.totalTokens;

        const responseTime = Date.now() - startTime;
        console.log(`[AI] Response generated with ${model.name} in ${responseTime}ms`);
        console.log(`[AI] Response length: ${fullResponse.length}, tokens used: ${tokensUsed || 'unknown'}`);
      } catch (error) {
        const err = error as Error;
        console.error(`[AI] Error with model ${model.name}:`, err.message);
        lastError = err.message || "Unknown error";
        continue;
      }
    }

    if (fullResponse === null) {
      throw new Error(`Failed to generate response with any model. Last error: ${lastError}`);
    }

    return {
      text: fullResponse,
      modelUsed,
      tokensUsed,
      responseTime: Date.now() - startTime,
    };
  }
} 