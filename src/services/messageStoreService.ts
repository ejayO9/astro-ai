import type { Message } from "ai";
import { getCharacterById, getDefaultCharacter } from "../../data/characters";

// Message store for each character
const messageStores: Record<string, Message[]> = {};

export class MessageStoreService {
  /**
   * Get or initialize message store for a character
   */
  static getMessageStore(characterId: string): Message[] {
    console.log(`[MessageStore] Getting message store for character: ${characterId}`);

    if (!messageStores[characterId]) {
      const character = getCharacterById(characterId) || getDefaultCharacter();
      console.log(`[MessageStore] Creating new message store for character: ${characterId}`);

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
   * Aggressively optimize messages to reduce token count
   */
  static optimizeMessages(messages: Message[]): Message[] {
    if (messages.length <= 3) {
      return [...messages];
    }

    const systemMessage = messages.find((m) => m.role === "system");
    const recentUserMessages = messages.filter((m) => m.role === "user").slice(-1);
    const previousAssistantMessage = messages.filter((m) => m.role === "assistant").slice(-1);

    const optimizedMessages: Message[] = [];

    if (systemMessage) {
      optimizedMessages.push(systemMessage);
    }

    if (messages.length > 5) {
      optimizedMessages.push({
        id: "summary-" + Date.now(),
        role: "system",
        content:
          "Note: Previous conversation messages have been summarized to conserve tokens while maintaining the detailed astrological analysis above. Please provide a comprehensive response based on the astrological context provided.",
      });
    }

    if (previousAssistantMessage.length > 0) {
      optimizedMessages.push(previousAssistantMessage[0]);
    }

    optimizedMessages.push(...recentUserMessages);

    console.log(`[MessageStore] Optimized messages from ${messages.length} to ${optimizedMessages.length}`);
    return optimizedMessages;
  }
} 