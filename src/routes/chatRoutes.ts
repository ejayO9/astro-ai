import { Router } from "express";
import { createChat } from "../controllers/chatController";
import { validateChatRequest } from "../middleware/validation";

const router = Router();

// Chat endpoint with validation middleware
router.post("/", validateChatRequest, createChat);

export default router; 