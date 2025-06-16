import type { Message } from "ai";
import { MessageStoreService } from "./messageStoreService";
import { AIService } from "./aiService";
import { limitEmojis } from "../../lib/text-splitter";
import { isGreetingOrNonQuestion } from "../../lib/message-analyzer";
import { analyzeTopics, type TopicSegment } from "../../lib/topic-analyzer";
import { getCharacterById, getDefaultCharacter } from "../../data/characters";
import { detectLanguageAndScript } from "../../lib/language-detector";

export interface ChatRequest {
  messages: Message[];
  resetChat?: boolean;
  characterId: string;
}

export interface ChatResponse {
  topicSegments: TopicSegment[];
  fullResponse: string;
  systemPrompt: string;
  character: any;
  logs?: string[];
}

export class ChatService {
  /**
   * Process a chat request
   */
  static async processChat(request: ChatRequest): Promise<ChatResponse> {
    const { messages, resetChat, characterId } = request;
    
    console.log(`[ChatService] Processing request for character ${characterId}`);
    
    // Get the character
    const character = getCharacterById(characterId) || getDefaultCharacter();
    console.log(`[ChatService] Character: ${character.name}`);
    
    // Get the message store for this character
    const messageStore = MessageStoreService.getMessageStore(characterId);
    
    // Handle chat reset if requested
    if (resetChat) {
      console.log(`[ChatService] Resetting chat`);
      MessageStoreService.resetMessageStore(characterId);
      return {
        topicSegments: [],
        fullResponse: "Chat reset successfully",
        systemPrompt: character.systemPrompt,
        character,
      };
    }
    
    // Get the latest user message
    const latestUserMessage = messages.length > 0 ? messages[messages.length - 1] : null;
    console.log(`[ChatService] Latest user message exists: ${!!latestUserMessage}`);
    
    // Detect language and prepare instruction
    let languageInstruction = "";
    if (latestUserMessage && latestUserMessage.role === "user") {
      const { language, script } = detectLanguageAndScript(latestUserMessage.content);
      console.log(`[ChatService] Language detection - language: ${language}, script: ${script}`);
      
      languageInstruction = this.getLanguageInstruction(language, script);
    }
    
    // Initialize response variables
    let response: string;
    let usedSystemPrompt: string = character.systemPrompt;
    let topicSegments: TopicSegment[] = [];
    
    // Check if it's a greeting
    if (latestUserMessage && latestUserMessage.role === "user" && isGreetingOrNonQuestion(latestUserMessage.content)) {
      console.log(`[ChatService] Processing greeting or non-question`);
      response = character.introMessage;
      usedSystemPrompt = "This is an automated introduction response for greetings or non-questions: " + character.systemPrompt;
      
      // Add the user message to store
      MessageStoreService.addMessage(characterId, latestUserMessage);
      
      topicSegments = [{
        topic: "Introduction",
        content: character.introMessage,
      }];
    } else {
      // Process regular message
      console.log(`[ChatService] Processing regular message`);
      
      // Add the new user message to store
      if (latestUserMessage && latestUserMessage.role === "user") {
        MessageStoreService.addMessage(characterId, latestUserMessage);
      }
      
      // Check for custom system prompt
      const customSystemPrompt = messages.find((m) => m.role === "system")?.content;
      if (customSystemPrompt && typeof customSystemPrompt === 'string') {
        console.log(`[ChatService] Custom system prompt found, length: ${customSystemPrompt.length}`);
        usedSystemPrompt = customSystemPrompt;
        MessageStoreService.updateSystemMessage(characterId, customSystemPrompt);
        
        // Log if it's an astrological prompt
        if (characterId === "guruji" && customSystemPrompt.includes("PLANETARY POSITIONS")) {
          console.log(`[ChatService] 🔮 ENHANCED ASTROLOGICAL PROMPT ACTIVATED`);
        }
      }
      
      // Add language instruction to system message
      if (languageInstruction) {
        const currentSystemContent = messageStore.find((msg) => msg.role === "system")?.content || "";
        MessageStoreService.updateSystemMessage(characterId, currentSystemContent + "\n\n" + languageInstruction);
      }
      
      try {
        // Optimize messages for token count
        const optimizedMessages = MessageStoreService.optimizeMessages(messageStore);
        console.log(`[ChatService] Messages optimized: ${messageStore.length} -> ${optimizedMessages.length}`);
        
        // Generate AI response
        const aiResponse = await AIService.generateResponse(optimizedMessages);
        response = aiResponse.text;
        
        console.log(`[ChatService] AI response generated - model: ${aiResponse.modelUsed}, time: ${aiResponse.responseTime}ms`);
        
        // Limit emojis
        response = limitEmojis(response);
        
        // Analyze topics
        try {
          topicSegments = await analyzeTopics(response);
          console.log(`[ChatService] Topics analyzed: ${topicSegments.length} segments`);
        } catch (topicError) {
          console.error(`[ChatService] Error analyzing topics:`, topicError);
          topicSegments = [{
            topic: "Response",
            content: response,
          }];
        }
        
        // Add assistant response to store
        MessageStoreService.addMessage(characterId, {
          id: Date.now().toString(),
          role: "assistant",
          content: response,
        });
        
      } catch (error) {
        console.error(`[ChatService] Error generating response:`, error);
        response = "I'm sorry, I encountered an error while processing your request. Please try again with a simpler question or try again later.";
        topicSegments = [{
          topic: "Error",
          content: response,
        }];
      }
    }
    
    return {
      topicSegments,
      fullResponse: response,
      systemPrompt: usedSystemPrompt,
      character,
    };
  }
  
  /**
   * Get language instruction based on detected language and script
   */
  private static getLanguageInstruction(language: string, script: string): string {
    if (language === "hinglish" && script === "latin") {
      return "The user is writing in Hinglish (Hindi words using Latin/English script). " +
             "Respond in the same way - use Hindi vocabulary but write it using Latin/English script (Hinglish). " +
             "DO NOT use Devanagari script in your response.";
    } else if (language === "hindi" && script === "devanagari") {
      return "The user is writing in Hindi using Devanagari script. " +
             "Respond in Hindi using Devanagari script.";
    } else {
      return "The user is writing in English. Respond in English.";
    }
  }
} 