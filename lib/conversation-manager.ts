import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import type { Message } from "ai"

export interface ConversationSummary {
  summary: string
  messageCount: number
}

export class ConversationManager {
  private messages: Message[] = []
  private summaries: ConversationSummary[] = []
  private lastSummarizedIndex = 0

  constructor(private initialSystemPrompt: string) {}

  async addMessage(message: Message): Promise<{
    messages: Message[]
    newSummary: ConversationSummary | null
    shouldStartNewChat: boolean
  }> {
    this.messages.push(message)

    // Check if we need to summarize (every 10 messages, counting both user and assistant)
    const shouldSummarize = this.messages.length >= this.lastSummarizedIndex + 10
    let newSummary: ConversationSummary | null = null
    let shouldStartNewChat = false

    if (shouldSummarize) {
      newSummary = await this.summarizeConversation()
      this.summaries.push(newSummary)
      this.lastSummarizedIndex = this.messages.length
      shouldStartNewChat = true
    }

    return {
      messages: this.messages,
      newSummary,
      shouldStartNewChat,
    }
  }

  async summarizeConversation(): Promise<ConversationSummary> {
    // Get messages since last summary
    const messagesToSummarize = this.messages.slice(this.lastSummarizedIndex)

    // Format messages for the summarization prompt
    const conversationText = messagesToSummarize.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n")

    // Generate summary using OpenAI
    const { text: summary } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Summarize the following conversation between a user and Shenaya (a tarot reader). Focus on key insights, questions asked, and readings given:\n\n${conversationText}`,
      temperature: 0.7,
      maxTokens: 250,
    })

    return {
      summary,
      messageCount: messagesToSummarize.length,
    }
  }

  getMessages(): Message[] {
    return this.messages
  }

  getSummaries(): ConversationSummary[] {
    return this.summaries
  }

  getLatestSummary(): ConversationSummary | null {
    if (this.summaries.length === 0) return null
    return this.summaries[this.summaries.length - 1]
  }

  startNewChat(): Message[] {
    // Create a new chat with the latest summary as context
    const latestSummary = this.getLatestSummary()

    if (!latestSummary) return this.messages

    // Clear messages but keep the system message
    const systemMessage = this.messages.find((m) => m.role === "system")

    // Start with system message and add summary context
    this.messages = systemMessage
      ? [
          systemMessage,
          {
            id: Date.now().toString(),
            role: "system",
            content: `Previous conversation summary: ${latestSummary.summary}\n\nContinue the conversation with this context in mind.`,
          },
        ]
      : []

    return this.messages
  }

  getCurrentSystemPrompt(messageCount: number): string {
    // Add "stick to character" reminder every 5 messages
    const shouldRemindCharacter = messageCount > 0 && messageCount % 5 === 0

    if (shouldRemindCharacter) {
      return `${this.initialSystemPrompt}\n\nRemember to stick to character.`
    }

    return this.initialSystemPrompt
  }
}
