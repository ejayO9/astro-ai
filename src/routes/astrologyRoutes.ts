import { Router } from "express";
import { getD1Chart } from "../controllers/astrologyController";
import { validateD1ChartRequest } from "../middleware/validation";

const router = Router();

/**
 * D1 Chart endpoint
 * POST /api/astrology/d1-chart
 * 
 * Gets planetary positions (D1 chart) for given birth details
 * 
 * Request body:
 * {
 *   date: string (YYYY-MM-DD format)
 *   time: string (HH:MM format)
 *   city: string
 *   latitude: number
 *   longitude: number
 *   timezone: string (e.g., "+05:30")
 * }
 */
router.post("/d1-chart", validateD1ChartRequest, getD1Chart);

export default router; 