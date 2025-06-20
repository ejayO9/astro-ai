// Using standard console logging for Express.js best practices

/**
 * Interface for planet data returned by the astrology API
 * 
 * This represents the position and characteristics of a single planet
 * in the birth chart at the time of birth.
 */
export interface PlanetData {
  id: number;                  // Unique identifier for the planet
  name: string;                // Name of the planet (e.g., "Sun", "Moon", "Mars")
  fullDegree: number;          // Full degree position (0-360)
  normDegree: number;          // Normalized degree within the sign (0-30)
  speed: number;               // Speed of the planet at birth time
  isRetro: string | boolean;   // Whether the planet is retrograde
  sign: string;                // Zodiac sign the planet is in
  signLord: string;            // Ruling planet of the sign
  nakshatra: string;           // Lunar mansion (Nakshatra) name
  nakshatraLord: string;       // Ruling planet of the Nakshatra
  nakshatra_pad: number;       // Pada (quarter) of the Nakshatra (1-4)
  house: number;               // House number the planet occupies (1-12)
  is_planet_set: boolean;      // Whether the planet is set
  planet_awastha: string;      // State/condition of the planet
}

/**
 * Type for the complete planets response
 */
export type PlanetsResponse = PlanetData[];

/**
 * Interface for birth details in the format expected by the API
 * 
 * The external API expects specific field names and formats
 * for birth data to calculate planetary positions.
 */
export interface BirthDetailsApiFormat {
  day: number;    // Day of birth (1-31)
  month: number;  // Month of birth (1-12)
  year: number;   // Year of birth (4 digits)
  hour: number;   // Hour of birth (0-23)
  min: number;    // Minute of birth (0-59)
  lat: number;    // Latitude of birth place
  lon: number;    // Longitude of birth place
  tzone: number;  // Timezone offset in hours (e.g., 5.5 for IST)
}

/**
 * Interface for the Astrology API client
 * 
 * Defines the methods available for interacting with
 * the external astrology API.
 */
export interface AstrologyApiClient {
  fetchPlanets: (data: BirthDetailsApiFormat) => Promise<PlanetsResponse>;
  validateCredentials: () => Promise<boolean>;
}

/**
 * Convert birth details from request format to API format
 * 
 * This function transforms the birth details received in the request
 * to the format expected by the external astrology API.
 * 
 * @param birthDetails - Birth details from the request
 * @returns BirthDetailsApiFormat - Formatted data for the API
 */
export function convertBirthDetailsToApiFormat(birthDetails: any): BirthDetailsApiFormat {
  // Parse date components from YYYY-MM-DD format
  const [year, month, day] = birthDetails.date.split("-").map(Number);
  
  // Parse time components from HH:MM format
  const [hour, min] = birthDetails.time.split(":").map(Number);

  // Convert timezone string to decimal hours
  // e.g., "+05:30" becomes 5.5, "-08:00" becomes -8
  let timezoneOffset = 0;
  if (birthDetails.timezone) {
    const match = birthDetails.timezone.match(/([+-])(\d{2}):(\d{2})/);
    if (match) {
      const sign = match[1] === "+" ? 1 : -1;
      const hours = Number.parseInt(match[2]);
      const minutes = Number.parseInt(match[3]);
      timezoneOffset = sign * (hours + minutes / 60);
    }
  }

  // Create the API format object
  const apiFormat = {
    day,
    month,
    year,
    hour,
    min,
    lat: birthDetails.latitude,
    lon: birthDetails.longitude,
    tzone: timezoneOffset,
  };
  
  // Log the conversion for debugging
  console.log("[apiClient] Converted birth details to API format", apiFormat);
  
  return apiFormat;
}

/**
 * Create an instance of the Astrology API client
 * 
 * This factory function creates a client configured with
 * credentials from environment variables. Returns null if
 * credentials are not available.
 * 
 * @returns AstrologyApiClient | null - Configured client or null
 */
export function createAstrologyApiClient(): AstrologyApiClient | null {
  // Get credentials from environment variables
  const userId = process.env.ASTROLOGY_API_USER_ID;
  const apiKey = process.env.ASTROLOGY_API_KEY;

  // Check if credentials are available
  if (!userId || !apiKey) {
    console.warn("[apiClient] Astrology API credentials not found in environment variables");
    return null;
  }

  // API configuration
  const baseUrl = "https://json.astrologyapi.com/v1";
  const auth = Buffer.from(`${userId}:${apiKey}`).toString("base64");

  // Return the client implementation
  return {
    /**
     * Fetch planetary positions for given birth details
     * 
     * Makes a POST request to the astrology API to get the
     * positions of all planets at the time of birth.
     * 
     * @param data - Birth details in API format
     * @returns Promise<PlanetsResponse> - Array of planet data
     * @throws Error if the API request fails
     */
    async fetchPlanets(data: BirthDetailsApiFormat): Promise<PlanetsResponse> {
      console.log("[apiClient] Fetching planets data from API", {
        endpoint: "/planets",
        birthData: data,
      });

      try {
        // Make the API request
        const response = await fetch(`${baseUrl}/planets`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${auth}`,
          },
          body: JSON.stringify(data),
        });

        // Check if request was successful
        if (!response.ok) {
          const errorText = await response.text();
          console.error("[apiClient] API request failed", {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
          });
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        // Parse the JSON response
        const planetsData = await response.json();
        
        // Log successful response
        console.log("[apiClient] Planets data fetched successfully", {
          planetCount: planetsData.length,
          planets: planetsData.map((p: PlanetData) => p.name).join(", "),
        });

        return planetsData;
      } catch (error) {
        console.error("[apiClient] Error fetching planets data", error);
        throw error;
      }
    },

    /**
     * Validate API credentials
     * 
     * Tests the API credentials by making a test request.
     * Useful for checking if the API is accessible and
     * credentials are valid.
     * 
     * @returns Promise<boolean> - True if credentials are valid
     */
    async validateCredentials(): Promise<boolean> {
      console.log("[apiClient] Validating API credentials");

      try {
        // Use test birth data for validation
        const testData: BirthDetailsApiFormat = {
          day: 1,
          month: 1,
          year: 2000,
          hour: 12,
          min: 0,
          lat: 28.6139,    // Delhi coordinates
          lon: 77.2090,
          tzone: 5.5,      // IST
        };

        // Make a test request
        const response = await fetch(`${baseUrl}/planets`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${auth}`,
          },
          body: JSON.stringify(testData),
        });

        // Check if request was successful
        const isValid = response.ok;
        
        console.log("[apiClient] Credential validation result", {
          isValid,
          status: response.status,
        });

        return isValid;
      } catch (error) {
        console.error("[apiClient] Error validating credentials", error);
        return false;
      }
    },
  };
} 