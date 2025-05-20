import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { limitEmojis } from "@/lib/text-splitter"
import { isGreetingOrNonQuestion } from "@/lib/message-analyzer"
import { analyzeTopics, type TopicSegment } from "@/lib/topic-analyzer"
import type { Message } from "ai"
import { getCharacterById, getDefaultCharacter } from "@/data/characters"
import { detectLanguageAndScript } from "@/lib/language-detector"
import { LoggingService, logInfo, logWarn, logError, logDebug } from "@/lib/logging-service"

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

// Set max duration to 60 seconds (maximum allowed value)
export const maxDuration = 60

export async function POST(req: Request) {
  // Clear logs for this request
  LoggingService.clearLogs()
  logInfo("api/chat", "Request received")

  try {
    // Validate the request body
    let body
    try {
      body = await req.json()
      logDebug("api/chat", "Request body parsed", {
        characterId: body.characterId,
        messageCount: body.messages?.length,
        resetChat: body.resetChat,
      })
    } catch (parseError) {
      logError("api/chat", "Failed to parse request body", parseError)
      return new Response(
        JSON.stringify({
          error: "Invalid request body",
          detail: "Request body must be valid JSON",
          logs: LoggingService.getLogs(),
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    if (!body || typeof body !== "object") {
      logError("api/chat", "Invalid request body", { body })
      return new Response(
        JSON.stringify({
          error: "Invalid request body",
          detail: "Request body must be a valid JSON object",
          logs: LoggingService.getLogs(),
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    const { messages, resetChat, characterId } = body

    // Validate required fields
    if (!Array.isArray(messages)) {
      logError("api/chat", "Invalid messages", { messages })
      return new Response(
        JSON.stringify({
          error: "Invalid messages",
          detail: "Messages must be an array",
          logs: LoggingService.getLogs(),
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    if (!characterId || typeof characterId !== "string") {
      logError("api/chat", "Invalid characterId", { characterId })
      return new Response(
        JSON.stringify({
          error: "Invalid characterId",
          detail: "Character ID is required and must be a string",
          logs: LoggingService.getLogs(),
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    logInfo("api/chat", `Processing request for character ${characterId}`)

    // Get the character
    const character = getCharacterById(characterId) || getDefaultCharacter()
    logDebug("api/chat", "Character retrieved", {
      characterId: character.id,
      name: character.name,
    })

    // Get the message store for this character
    const messageStore = getMessageStore(characterId)
    logDebug("api/chat", "Message store retrieved", {
      messageCount: messageStore.length,
    })

    // Handle chat reset if requested
    if (resetChat) {
      logInfo("api/chat", "Resetting chat")
      // Reset to just the system message
      messageStore.length = 1
      return new Response(
        JSON.stringify({
          success: true,
          message: "Chat reset successfully",
          logs: LoggingService.getLogs(),
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    // Get the latest user message
    const latestUserMessage = messages.length > 0 ? messages[messages.length - 1] : null
    logDebug("api/chat", "Latest user message", {
      exists: !!latestUserMessage,
      content: latestUserMessage?.content?.substring(0, 50) + (latestUserMessage?.content?.length > 50 ? "..." : ""),
    })

    // Detect language and script of the user's message
    let languageInstruction = ""
    if (latestUserMessage && latestUserMessage.role === "user") {
      const { language, script } = detectLanguageAndScript(latestUserMessage.content)
      logInfo("api/chat", "Language detection", { language, script })

      if (language === "hinglish" && script === "latin") {
        languageInstruction =
          "The user is writing in Hinglish (Hindi words using Latin/English script). " +
          "Respond in the same way - use Hindi vocabulary but write it using Latin/English script (Hinglish). " +
          "DO NOT use Devanagari script in your response."
      } else if (language === "hindi" && script === "devanagari") {
        languageInstruction =
          "The user is writing in Hindi using Devanagari script. " + "Respond in Hindi using Devanagari script."
      } else {
        languageInstruction = "The user is writing in English. Respond in English."
      }
      logDebug("api/chat", "Language instruction set", { languageInstruction })
    }

    // Check if it's a greeting or non-question
    let response: string
    let usedSystemPrompt: string = character.systemPrompt
    let topicSegments: TopicSegment[] = []

    // Special handling for Guruji character with birth details
    const birthDetailsPrompt = null
    if (character.id === "guruji") {
      logInfo("api/chat", "Guruji character detected")
    }

    if (latestUserMessage && latestUserMessage.role === "user" && isGreetingOrNonQuestion(latestUserMessage.content)) {
      logInfo("api/chat", "Processing greeting or non-question")
      // Use the introduction for greetings or non-questions
      response = character.introMessage
      logDebug("api/chat", "Using character introduction", {
        introLength: character.introMessage.length,
      })

      // For intro responses, we use a special system prompt
      usedSystemPrompt =
        "This is an automated introduction response for greetings or non-questions: " + character.systemPrompt

      // Add the user message to our store
      messageStore.push(latestUserMessage)
      logDebug("api/chat", "Added user message to store", {
        storeSize: messageStore.length,
      })

      // For introductions, we don't need to analyze topics
      topicSegments = [
        {
          topic: "Introduction",
          content: character.introMessage,
        },
      ]
      logDebug("api/chat", "Created introduction topic segment")
    } else {
      logInfo("api/chat", "Processing regular message")
      // Add the new user message to our store
      if (latestUserMessage && latestUserMessage.role === "user") {
        messageStore.push(latestUserMessage)
        logDebug("api/chat", "Added user message to store", {
          storeSize: messageStore.length,
        })
      }

      // Check if there's a custom system prompt in the messages
      const customSystemPrompt = messages.find((m) => m.role === "system")?.content
      if (customSystemPrompt) {
        logInfo("api/chat", "Custom system prompt found in messages", {
          promptLength: customSystemPrompt.length,
        })

        // Update the system message in our store
        const systemIndex = messageStore.findIndex((msg) => msg.role === "system")
        if (systemIndex >= 0) {
          logDebug("api/chat", "Updating system message in store with custom prompt")
          messageStore[systemIndex] = {
            ...messageStore[systemIndex],
            content: customSystemPrompt,
          }
          usedSystemPrompt = customSystemPrompt
        }
      }

      // Add language instruction to the system message
      const systemIndex = messageStore.findIndex((msg) => msg.role === "system")
      if (systemIndex >= 0 && languageInstruction) {
        logDebug("api/chat", "Adding language instruction to system message")
        messageStore[systemIndex] = {
          ...messageStore[systemIndex],
          content: messageStore[systemIndex].content + "\n\n" + languageInstruction,
        }
      }

      try {
        logInfo("api/chat", "Generating response with OpenAI")

        // Aggressively optimize the message store to reduce token count
        const optimizedMessages = aggressivelyOptimizeMessages(messageStore)
        logDebug("api/chat", "Aggressively optimized messages for API call", {
          originalCount: messageStore.length,
          optimizedCount: optimizedMessages.length,
        })

        // Generate response using OpenAI with fallback strategy
        const startTime = Date.now()

        // Try different models in order of preference
        const models = [
          { name: "gpt-4o", maxTokens: 600, temperature: 0.7 },
          { name: "gpt-3.5-turbo", maxTokens: 800, temperature: 0.7 },
        ]

        let fullResponse: string | null = null
        let modelUsed = ""
        let errorMessage = ""

        // Try each model until we get a response
        for (const model of models) {
          if (fullResponse !== null) break

          logInfo("api/chat", `Trying model: ${model.name}`)

          try {
            // Use generateText instead of streamText since we're having issues with streaming
            const result = await generateText({
              model: openai(model.name),
              messages: optimizedMessages,
              temperature: model.temperature,
              maxTokens: model.maxTokens,
            })

            fullResponse = result.text
            modelUsed = model.name

            const apiTime = Date.now() - startTime
            logInfo("api/chat", `Response generated successfully with ${model.name} in ${apiTime}ms`, {
              responseLength: fullResponse.length,
            })
          } catch (error) {
            const err = error as Error
            logError("api/chat", `Error with model ${model.name}`, err)
            errorMessage = err.message || "Unknown error"

            // Continue to the next model
            continue
          }
        }

        if (fullResponse === null) {
          // All models failed
          throw new Error(`Failed to generate response with any model. Last error: ${errorMessage}`)
        }

        response = fullResponse
        logInfo("api/chat", `Response generated successfully using ${modelUsed}`, {
          responseLength: fullResponse.length,
        })

        // Limit emojis in the response
        const limitedEmojiText = limitEmojis(response)
        logDebug("api/chat", "Emojis limited in response")

        try {
          // Analyze the response to identify unique topics
          logInfo("api/chat", "Analyzing topics")
          topicSegments = await analyzeTopics(limitedEmojiText)
          logInfo("api/chat", "Topics analyzed", {
            segmentCount: topicSegments.length,
          })
        } catch (topicError) {
          logError("api/chat", "Error analyzing topics", topicError)
          // Fallback if topic analysis fails
          topicSegments = [
            {
              topic: "Response",
              content: limitedEmojiText,
            },
          ]
          logWarn("api/chat", "Using fallback single topic segment")
        }

        // Add the assistant's response to our store
        messageStore.push({
          id: Date.now().toString(),
          role: "assistant",
          content: limitedEmojiText,
        })
        logDebug("api/chat", "Added assistant response to message store", {
          storeSize: messageStore.length,
        })
      } catch (generateError) {
        logError("api/chat", "Error generating response", generateError)
        // Provide a fallback response
        response =
          "I'm sorry, I encountered an error while processing your request. Please try again with a simpler question or try again later."
        topicSegments = [
          {
            topic: "Error",
            content: response,
          },
        ]
        logWarn("api/chat", "Using fallback error response")
      }
    }

    logInfo("api/chat", "Sending response")
    // Return the topic segments, system prompt, and logs
    return new Response(
      JSON.stringify({
        topicSegments,
        fullResponse: response,
        systemPrompt: usedSystemPrompt,
        character,
        logs: LoggingService.getLogs(),
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    logError("api/chat", "Error in chat API", error)

    const errorMessage = "Failed to process chat request"
    let errorDetail = "Unknown error"

    if (error instanceof Error) {
      errorDetail = error.message
      logError("api/chat", error.stack || "No stack trace available")
    }

    return new Response(
      JSON.stringify({
        error: errorMessage,
        detail: errorDetail,
        topicSegments: [
          {
            topic: "Error",
            content:
              "I'm sorry, I encountered an error processing your request. Please try again with a simpler question or try again later.",
          },
        ],
        fullResponse:
          "I'm sorry, I encountered an error processing your request. Please try again with a simpler question or try again later.",
        systemPrompt: "Error occurred",
        logs: LoggingService.getLogs(),
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
