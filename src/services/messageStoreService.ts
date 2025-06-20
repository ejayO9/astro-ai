import type { Message } from "ai";
import { getCharacterById, getDefaultCharacter } from "../../data/characters";

// Message store for each character
const messageStores: Record<string, Message[]> = {};

export class MessageStoreService {
  /**
   * Get or initialize message store for a character
   */
  //DONNO : what exactly being stored in messageStores
  static getMessageStore(characterId: string): Message[] {
    console.log(`[MessageStore] Getting message store for character: ${characterId}`);

    if (!messageStores[characterId]) {
      const character = getCharacterById(characterId) || getDefaultCharacter();
      console.log(`[MessageStore] Creating new message store for character: ${characterId}`);

      //DONO : why is this an array instead of just a single object
      messageStores[characterId] = [
        {
          id: "system-1",
          role: "system",
          content: character.systemPrompt,
        },
      ];
    }
    return messageStores[characterId];
  }

  /**
   * Reset message store for a character
   */
  //DONO : how does the line messageStore.length = 1 reset the chat
  static resetMessageStore(characterId: string): void {
    console.log(`[MessageStore] Resetting chat for character: ${characterId}`);
    const messageStore = this.getMessageStore(characterId);
    messageStore.length = 1; // Keep only system message
  }

  /**
   * Add message to store
   */
  static addMessage(characterId: string, message: Message): void {
    const messageStore = this.getMessageStore(characterId);
    messageStore.push(message);
    console.log(`[MessageStore] Added message to store, size: ${messageStore.length}`);
  }

  /**
   * Update system message in store
   */
  static updateSystemMessage(characterId: string, content: string): void {
    const messageStore = this.getMessageStore(characterId);
    const systemIndex = messageStore.findIndex((msg) => msg.role === "system");
    
    if (systemIndex >= 0) {
      messageStore[systemIndex] = {
        ...messageStore[systemIndex],
        content,
      };
      console.log(`[MessageStore] Updated system message for character: ${characterId}`);
    }
  }

  /**
   * Aggressively optimizes the message array to reduce token count
   * - Keeps the system message
   * - Keeps only the most recent user message and previous assistant response
   * - Summarizes all other history
   */
  static optimizeMessages(messages: Message[]): Message[] {
    if (messages.length <= 3) {
      return [...messages];
    }

    // Always keep the system message (this is crucial for astrological prompts)
    const systemMessage = messages.find((m) => m.role === "system");
    // Get the most recent user message
    const recentUserMessages = messages.filter((m) => m.role === "user").slice(-1);
    // Get the previous assistant message if it exists
    const previousAssistantMessage = messages.filter((m) => m.role === "assistant").slice(-1);

    // Create the optimized message array
    const optimizedMessages: Message[] = [];

    // Add the system message first if it exists (CRITICAL for astrological analysis)
    if (systemMessage) {
      optimizedMessages.push(systemMessage);
    }

    // For astrological prompts, we need more context - only add summary if we have many messages
    if (messages.length > 5) {
      // Add a summary message for context only if we have many messages
      optimizedMessages.push({
        id: "summary-" + Date.now(),
        role: "system",
        content:
          "Note: Previous conversation messages have been summarized to conserve tokens while maintaining the detailed astrological analysis above. Please provide a comprehensive response based on the astrological context provided.",
      });
    }

    // Add the previous assistant message if it exists
    if (previousAssistantMessage.length > 0) {
      optimizedMessages.push(previousAssistantMessage[0]);
    }

    // Add the most recent user message
    optimizedMessages.push(...recentUserMessages);

    console.log(`[MessageStore] Optimized messages from ${messages.length} to ${optimizedMessages.length}`);
    return optimizedMessages;
  }
} 