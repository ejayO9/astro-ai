import { D1ChartRequest } from "../controllers/astrologyController";
import { 
  createAstrologyApiClient, 
  convertBirthDetailsToApiFormat,
  PlanetsResponse,
  BirthDetailsApiFormat 
} from "./astro-engine/apiClient";

/**
 * Astrology Service
 * 
 * This service handles all astrology-related business logic,
 * including interactions with external astrology APIs and
 * data transformations.
 */
export class AstrologyService {
  /**
   * Get D1 Chart (planetary positions) data
   * 
   * This method:
   * 1. Creates an API client with credentials
   * 2. Converts birth details to the API format
   * 3. Fetches planetary data from the external API
   * 4. Returns the processed planet data
   * 
   * @param birthDetails - Birth details from the request
   * @returns Promise<PlanetsResponse> - Array of planet data
   * @throws Error if API credentials are missing or API call fails
   */
  static async getD1ChartData(birthDetails: D1ChartRequest): Promise<PlanetsResponse> {
    try {
      // Log the start of the process
      console.log("[astrologyService] Starting D1 Chart calculation", {
        birthDetails: {
          date: birthDetails.date,
          time: birthDetails.time,
          location: birthDetails.city
        }
      });

      // Create API client with credentials from environment
      const apiClient = createAstrologyApiClient();
      
      // Check if API client was created successfully
      if (!apiClient) {
        const error = new Error("Astrology API credentials not configured");
        console.error("[astrologyService] Failed to create API client", error);
        throw error;
      }

      // Convert birth details to the format expected by the API
      const apiData = convertBirthDetailsToApiFormat(birthDetails);
      
      // Log the converted data for debugging
      console.log("[astrologyService] Birth details converted to API format", {
        apiData
      });

      // Fetch planets data from the external API
      const planetsData = await apiClient.fetchPlanets(apiData);
      
      // Log successful data retrieval
      console.log("[astrologyService] Successfully fetched planets data", {
        planetCount: planetsData.length,
        planetNames: planetsData.map(p => p.name)
      });

      // Return the planets data
      return planetsData;

    } catch (error) {
      // Log and re-throw the error
      console.error("[astrologyService] Error in getD1ChartData", error);
      
      // Enhance error message for better debugging
      if (error instanceof Error) {
        throw new Error(`Failed to get D1 Chart data: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Validate API credentials
   * 
   * This method can be used to check if the astrology API
   * credentials are valid before making actual requests.
   * 
   * @returns Promise<boolean> - True if credentials are valid
   */
  static async validateApiCredentials(): Promise<boolean> {
    try {
      const apiClient = createAstrologyApiClient();
      
      if (!apiClient) {
        console.warn("[astrologyService] No API client available for validation");
        return false;
      }

      const isValid = await apiClient.validateCredentials();
      
      console.log("[astrologyService] API credentials validation result", {
        isValid
      });

      return isValid;

    } catch (error) {
      console.error("[astrologyService] Error validating API credentials", error);
      return false;
    }
  }
} 