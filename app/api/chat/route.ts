import { type NextRequest, NextResponse } from "next/server"
import { OpenAIStream } from "@/utils/openai"
import { getPineconeClient } from "@/utils/pinecone"
import { PineconeStore } from "langchain/vectorstores/pinecone"
import { OpenAIEmbeddings } from "langchain/embeddings/openai"
import { auth } from "@clerk/nextjs/server"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import type { Message } from "ai"
import { getCharacterById, getDefaultCharacter } from "@/data/characters"
import { logInfo, logDebug } from "@/lib/logging-service"
import { generateEnhancedGurujiPrompt as generateEnhancedGurujiPromptLib } from "@/lib/astrology/enhanced-prompt-generator"

export const runtime = "edge"
export const maxDuration = 60

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

// Create a new ratelimiter, that allows 3 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: "@upstash/ratelimit",
})

// Create a message store for each character
const messageStores: Record<string, Message[]> = {}

// Initialize message stores for each character
function getMessageStore(characterId: string): Message[] {
  logDebug("getMessageStore", `Getting message store for character: ${characterId}`)

  if (!messageStores[characterId]) {
    const character = getCharacterById(characterId) || getDefaultCharacter()
    logInfo("getMessageStore", `Creating new message store for character: ${characterId}`)

    messageStores[characterId] = [
      {
        id: "system-1",
        role: "system",
        content: character.systemPrompt,
      },
    ]
  }
  return messageStores[characterId]
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { messages, selectedCharacter, birthDetails, chartData } = await req.json()
  const lastUserMessage = messages[messages.length - 1]
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const ip = req.headers.get("x-forwarded-for")
  const { success, limit, reset, remaining } = await ratelimit.limit(`guruji_ratelimit_${ip ?? userId}`)

  if (!success) {
    console.log("Rate limit exceeded")
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      },
    )
  }

  console.log("selectedCharacter", selectedCharacter)

  let systemPrompt = selectedCharacter.prompt

  const pinecone = await getPineconeClient()
  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME!)

  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
    { pineconeIndex },
  )

  const results = await vectorStore.similaritySearch(lastUserMessage.content, 3)

  const context = results.map((r) => r.pageContent).join("\n")

  console.log("context", context)

  // Log the hit
  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/hit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      characterName: selectedCharacter.name,
    }),
  })

  const currentLogs = ""

  const responseData: { intentAnalysis?: any } = {}

  if (selectedCharacter.id === "guruji") {
    const { prompt: enhancedPrompt, intentAnalysis } = await generateEnhancedGurujiPromptLib(
      lastUserMessage.content,
      birthDetails,
      chartData,
    )

    systemPrompt = enhancedPrompt

    // Store intent analysis for response
    responseData.intentAnalysis = intentAnalysis
  }

  const { stream, segments, fullResponse: text } = await OpenAIStream(systemPrompt, context, messages)

  return NextResponse.json({
    fullResponse: text,
    topicSegments: segments,
    systemPrompt,
    logs: currentLogs,
    intentAnalysis: responseData.intentAnalysis || null,
  })
}

/**
 * Aggressively optimizes the message array to reduce token count
 * - Keeps the system message
 * - Keeps only the most recent user message and previous assistant response
 * - Summarizes all other history
 */
function aggressivelyOptimizeMessages(messages: Message[]): Message[] {
  if (messages.length <= 3) {
    return [...messages]
  }

  // Always keep the system message
  const systemMessage = messages.find((m) => m.role === "system")

  // Get the most recent user message
  const recentUserMessages = messages.filter((m) => m.role === "user").slice(-1)

  // Get the previous assistant message if it exists
  const previousAssistantMessage = messages.filter((m) => m.role === "assistant").slice(-1)

  // Create the optimized message array
  const optimizedMessages: Message[] = []

  // Add the system message first if it exists
  if (systemMessage) {
    optimizedMessages.push(systemMessage)
  }

  // Add a summary message for context
  optimizedMessages.push({
    id: "summary-" + Date.now(),
    role: "system",
    content:
      "The above was the system instruction. There were previous messages in this conversation that have been summarized to save tokens. Please respond to the user's most recent message below.",
  })

  // Add the previous assistant message if it exists
  if (previousAssistantMessage.length > 0) {
    optimizedMessages.push(previousAssistantMessage[0])
  }

  // Add the most recent user message
  optimizedMessages.push(...recentUserMessages)

  return optimizedMessages
}
