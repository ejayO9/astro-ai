import { createAstrologyApiClient, convertBirthDetailsToApiFormat } from "./api-client"
import { logInfo, logError, logDebug } from "@/lib/logging-service"

/**
 * Test function to verify API connectivity and data fetching
 */
export async function testAstrologyApi() {
  logInfo("api-test", "Starting astrology API test")

  try {
    const apiClient = createAstrologyApiClient()

    if (!apiClient) {
      throw new Error("API client could not be created - missing credentials")
    }

    // Test with default birth details
    const testBirthDetails = {
      date: "1997-02-08",
      time: "07:47",
      latitude: 22.5726,
      longitude: 88.3639,
      timezone: "+05:30",
    }

    logInfo("api-test", "Converting birth details to API format")
    const apiData = convertBirthDetailsToApiFormat(testBirthDetails)

    logDebug("api-test", "API data format", apiData)

    logInfo("api-test", "Fetching D1 chart from API")
    const d1Response = await apiClient.fetchD1Chart(apiData)

    logInfo("api-test", "API response received", {
      hasAscendant: !!d1Response.ascendant,
      planetCount: d1Response.planets?.length || 0,
      houseCount: d1Response.houses?.length || 0,
    })

    return {
      success: true,
      data: d1Response,
      message: "API test successful",
    }
  } catch (error) {
    logError("api-test", "API test failed", error)
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
