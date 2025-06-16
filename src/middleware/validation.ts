import { Request, Response, NextFunction } from "express";

/**
 * Validates chat request body
 */
export const validateChatRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { messages, characterId } = req.body;

  // Validate messages
  if (!messages) {
    res.status(400).json({
      error: "Validation Error",
      detail: "Messages field is required",
    });
    return;
  }

  if (!Array.isArray(messages)) {
    res.status(400).json({
      error: "Validation Error",
      detail: "Messages must be an array",
    });
    return;
  }

  // Validate each message
  for (const message of messages) {
    if (!message.role || !["user", "assistant", "system"].includes(message.role)) {
      res.status(400).json({
        error: "Validation Error",
        detail: "Each message must have a valid role (user, assistant, or system)",
      });
      return;
    }

    if (!message.content || typeof message.content !== "string") {
      res.status(400).json({
        error: "Validation Error",
        detail: "Each message must have content as a string",
      });
      return;
    }
  }

  // Validate characterId
  if (!characterId) {
    res.status(400).json({
      error: "Validation Error",
      detail: "Character ID is required",
    });
    return;
  }

  if (typeof characterId !== "string") {
    res.status(400).json({
      error: "Validation Error",
      detail: "Character ID must be a string",
    });
    return;
  }

  // All validations passed
  next();
}; 