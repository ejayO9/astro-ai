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

/**
 * Validation middleware for D1 Chart requests
 * 
 * Validates birth details required for astrology calculations:
 * - date: Must be in YYYY-MM-DD format
 * - time: Must be in HH:MM format
 * - city: Must be a non-empty string
 * - latitude: Must be a valid latitude (-90 to 90)
 * - longitude: Must be a valid longitude (-180 to 180)
 * - timezone: Must be in format like "+05:30" or "-08:00"
 */
export const validateD1ChartRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors: string[] = [];
  const { date, time, city, latitude, longitude, timezone } = req.body;

  // Validate date format (YYYY-MM-DD)
  if (!date || typeof date !== "string") {
    errors.push("Date is required and must be a string");
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    errors.push("Date must be in YYYY-MM-DD format");
  } else {
    // Validate date is valid
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      errors.push("Invalid date provided");
    }
  }

  // Validate time format (HH:MM)
  if (!time || typeof time !== "string") {
    errors.push("Time is required and must be a string");
  } else if (!/^\d{2}:\d{2}$/.test(time)) {
    errors.push("Time must be in HH:MM format");
  } else {
    // Validate time values
    const [hours, minutes] = time.split(":").map(Number);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      errors.push("Invalid time values");
    }
  }

  // Validate city
  if (!city || typeof city !== "string" || city.trim().length === 0) {
    errors.push("City is required and must be a non-empty string");
  }

  // Validate latitude
  if (latitude === undefined || typeof latitude !== "number") {
    errors.push("Latitude is required and must be a number");
  } else if (latitude < -90 || latitude > 90) {
    errors.push("Latitude must be between -90 and 90");
  }

  // Validate longitude
  if (longitude === undefined || typeof longitude !== "number") {
    errors.push("Longitude is required and must be a number");
  } else if (longitude < -180 || longitude > 180) {
    errors.push("Longitude must be between -180 and 180");
  }

  // Validate timezone format
  if (!timezone || typeof timezone !== "string") {
    errors.push("Timezone is required and must be a string");
  } else if (!/^[+-]\d{2}:\d{2}$/.test(timezone)) {
    errors.push("Timezone must be in format +HH:MM or -HH:MM (e.g., +05:30)");
  }

  // If there are errors, respond with 400
  if (errors.length > 0) {
    res.status(400).json({
      error: "Validation failed",
      details: errors,
    });
    return;
  }

  // Validation passed, continue to next middleware
  next();
}; 