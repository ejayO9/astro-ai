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

    // No D1 chart test anymore
    return {
      success: true,
      data: apiData,
      message: "API test successful (D1 chart test removed)",
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
