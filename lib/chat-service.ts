import { openai } from "@ai-sdk/openai"
import { streamText, type Message } from "ai"
import { ConversationManager } from "./conversation-manager"
import { ClassifierService } from "./classifier-service"
import { PromptEngineer } from "./prompt-engineer"
import { splitIntoSentences, limitEmojis } from "./text-splitter"

const BASE_SYSTEM_PROMPT =
  "You are Shenaya. Shenaya is a 28-year-old trendsetting tarot reader who is fashion-forward and pop-culture savvy. You bring tarot readings with a modern edge and discuss the future with style. Limit yourself to one emoji per response."

export class ChatService {
  private conversationManager: ConversationManager
  private classifierService: ClassifierService
  private promptEngineer: PromptEngineer

  constructor() {
    this.conversationManager = new ConversationManager(BASE_SYSTEM_PROMPT)
    this.classifierService = new ClassifierService()
    this.promptEngineer = new PromptEngineer(BASE_SYSTEM_PROMPT)
  }

  async processMessage(messages: Message[]) {
    // Add system message if not present
    if (!messages.find((m) => m.role === "system")) {
      messages.unshift({
        id: "system-1",
        role: "system",
        content: BASE_SYSTEM_PROMPT,
      })
    }

    // Track message in conversation manager
    const lastMessage = messages[messages.length - 1]
    await this.conversationManager.addMessage(lastMessage)

    // Get message count for character reminder logic
    const messageCount = this.conversationManager.getMessages().length

    // Classify the message to determine approach
    const classification = await this.classifierService.classifyMessage(messages)

    // Get latest summary if available
    const latestSummary = this.conversationManager.getLatestSummary()

    // Generate dynamic system prompt
    const dynamicSystemPrompt = this.promptEngineer.generateDynamicSystemPrompt(
      classification,
      messageCount,
      latestSummary,
    )

    // Replace the system message with our dynamic one
    const messagesWithDynamicPrompt = messages.map((m) =>
      m.role === "system" ? { ...m, content: dynamicSystemPrompt } : m,
    )

    // Generate response using the dynamic prompt
    const result = streamText({
      model: openai("gpt-4.1"),
      messages: messagesWithDynamicPrompt,
    })

    // Get the full text response
    const fullText = await result.text

    // Limit emojis in the full response
    const limitedEmojiText = limitEmojis(fullText)

    // Split into sentences
    const sentences = splitIntoSentences(limitedEmojiText)

    // Check if we should start a new chat after this message
    const { shouldStartNewChat } = await this.conversationManager.addMessage({
      id: Date.now().toString(),
      role: "assistant",
      content: limitedEmojiText,
    })

    // Return both the sentences and whether we should start a new chat
    return {
      sentences,
      shouldStartNewChat,
      latestSummary: shouldStartNewChat ? this.conversationManager.getLatestSummary() : null,
    }
  }

  startNewChat() {
    return this.conversationManager.startNewChat()
  }
}
