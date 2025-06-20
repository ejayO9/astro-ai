import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from "express";
import { AstrologyService } from "../services/astrologyService";

/**
 * Interface for D1 Chart request body
 */
export interface D1ChartRequest {
  date: string;        // YYYY-MM-DD format
  time: string;        // HH:MM format
  city: string;        // City name
  latitude: number;    // Latitude coordinate
  longitude: number;   // Longitude coordinate
  timezone: string;    // Timezone offset (e.g., "+05:30")
}

/**
 * Controller for D1 Chart (Planetary Positions)
 * 
 * This endpoint calculates and returns the planetary positions
 * for a given birth date, time, and location. The D1 chart is
 * the main birth chart in Vedic astrology.
 * 
 * @param req - Express request object containing birth details
 * @param res - Express response object
 * @param next - Express next function for error handling
 */
export const getD1Chart = async (
  req: ExpressRequest<{}, {}, D1ChartRequest>,
  res: ExpressResponse,
  next: NextFunction
): Promise<void> => {
  try {
    const startTime = Date.now();
    
    // Log the incoming request
    console.log("[astrologyController] D1 Chart request received", {
      date: req.body.date,
      time: req.body.time,
      city: req.body.city
    });

    // Extract validated birth details from request body
    const birthDetails = req.body;

    // Call the astrology service to get planet data
    const planetData = await AstrologyService.getD1ChartData(birthDetails);

    // Calculate response time for monitoring
    const responseTime = Date.now() - startTime;
    
    // Log successful response
    console.log(`[astrologyController] D1 Chart data generated in ${responseTime}ms`, {
      planetCount: planetData.length,
      planets: planetData.map(p => p.name).join(", ")
    });

    // Send the planet data as response
    res.json({
      success: true,
      data: planetData,
      metadata: {
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    // Log the error
    console.error("[astrologyController] Error generating D1 Chart", error);
    
    // Pass error to error handling middleware
    next(error);
  }
}; 