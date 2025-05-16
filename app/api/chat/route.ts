import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { limitEmojis } from "@/lib/text-splitter"
import { isGreetingOrNonQuestion } from "@/lib/message-analyzer"
import { analyzeTopics, type TopicSegment } from "@/lib/topic-analyzer"
import type { Message } from "ai"

// Base system prompt
const BASE_SYSTEM_PROMPT =
  "You are Shenaya. Shenaya is a 28-year-old trendsetting tarot reader who is fashion-forward and pop-culture savvy. You bring tarot readings with a modern edge and discuss the future with style. Limit yourself to one emoji per response."

// Create a simple message store for this example
const messageStore: Message[] = [
  {
    id: "system-1",
    role: "system",
    content: BASE_SYSTEM_PROMPT,
  },
]

// Shenaya's introduction to use when user sends a greeting or non-question
const SHENAYA_INTRO =
  "Hi there! I'm Shenaya, a 28-year-old tarot reader with a modern twist. I blend traditional tarot wisdom with pop culture and fashion-forward insights. I can provide guidance on your past, present, and future. What would you like to know today? ✨"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages, resetChat }: { messages: Message[]; resetChat?: boolean } = await req.json()

    // Handle chat reset if requested
    if (resetChat) {
      // Reset to just the system message
      messageStore.length = 1
      return new Response(
        JSON.stringify({
          success: true,
          message: "Chat reset successfully",
        }),
      )
    }

    // Get the latest user message
    const latestUserMessage = messages.length > 0 ? messages[messages.length - 1] : null

    // Check if it's a greeting or non-question
    let response: string
    let usedSystemPrompt: string = BASE_SYSTEM_PROMPT
    let topicSegments: TopicSegment[] = []

    if (latestUserMessage && latestUserMessage.role === "user" && isGreetingOrNonQuestion(latestUserMessage.content)) {
      // Use the introduction for greetings or non-questions
      response = SHENAYA_INTRO

      // For intro responses, we use a special system prompt
      usedSystemPrompt =
        "This is an automated introduction response for greetings or non-questions: " + BASE_SYSTEM_PROMPT

      // Add the user message to our store
      messageStore.push(latestUserMessage)

      // For introductions, we don't need to analyze topics
      topicSegments = [
        {
          topic: "Introduction",
          content: SHENAYA_INTRO,
        },
      ]
    } else {
      // Add the new user message to our store
      if (latestUserMessage && latestUserMessage.role === "user") {
        messageStore.push(latestUserMessage)
      }

      // Generate response using OpenAI for questions or other messages
      const { text: fullResponse } = await generateText({
        model: openai("gpt-4o"),
        messages: messageStore,
      })

      response = fullResponse

      // Limit emojis in the response
      const limitedEmojiText = limitEmojis(response)

      // Analyze the response to identify unique topics
      topicSegments = await analyzeTopics(limitedEmojiText)

      // Add the assistant's response to our store
      messageStore.push({
        id: Date.now().toString(),
        role: "assistant",
        content: limitedEmojiText,
      })
    }

    // Return the topic segments and system prompt
    return new Response(
      JSON.stringify({
        topicSegments,
        fullResponse: response,
        systemPrompt: usedSystemPrompt,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    console.error("Error in chat API:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        detail: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}
