import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from "express";
import { ChatService, type ChatRequest } from "../services/chatService";

/**
 * Chat controller - handles chat requests
 */
export const createChat = async (
  req: ExpressRequest,
  res: ExpressResponse,
  next: NextFunction
): Promise<void> => {
  try {
    const startTime = Date.now();
    console.log(`[ChatController] POST /api/chat - Request received`);

    // Extract validated data from request body
    const { messages, resetChat, characterId } = req.body;

    // Log request details
    console.log(`[ChatController] Request details:`, {
      characterId,
      messageCount: messages.length,
      resetChat: !!resetChat,
    });

    // Process the chat request
    const chatRequest: ChatRequest = {
      messages,
      resetChat,
      characterId,
    };

    const response = await ChatService.processChat(chatRequest);

    // Log response time
    const responseTime = Date.now() - startTime;
    console.log(`[ChatController] Response generated in ${responseTime}ms`);

    // Send response
    res.json(response);
  } catch (error) {
    // Pass to error handling middleware
    next(error);
  }
} 