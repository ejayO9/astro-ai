import { NextResponse } from "next/server"
import { createAstrologyApiClient } from "@/lib/astrology/api-client"
import { logInfo, logError } from "@/lib/logging-service"

export async function GET() {
  try {
    logInfo("AstrologyTestAPI", "Testing API credentials with official format")

    const apiClient = createAstrologyApiClient()

    if (!apiClient) {
      return NextResponse.json({
        status: "error",
        message: "API credentials not configured",
      })
    }

    // Test with the exact sample data from the documentation
    const testData = {
      day: 6,
      month: 1,
      year: 2000,
      hour: 7,
      min: 45,
      lat: 19.132,
      lon: 72.342,
      tzone: 5.5,
    }

    try {
      const result = await apiClient.fetchD1Chart(testData)

      return NextResponse.json({
        status: "success",
        message: "API credentials are valid and working",
        details: {
          userId: "640843",
          plan: "Basic Plan (Trial)",
          daysLeft: 6,
          endpoint: "https://json.astrologyapi.com/v1/horo_chart/D1",
          testResult: {
            ascendant: result.ascendant?.signName,
            planetCount: result.planets?.length,
            houseCount: result.houses?.length,
          },
        },
      })
    } catch (apiError) {
      return NextResponse.json({
        status: "error",
        message: `API test failed: ${apiError instanceof Error ? apiError.message : "Unknown error"}`,
        details: {
          userId: "640843",
          endpoint: "https://json.astrologyapi.com/v1/horo_chart/D1",
          error: apiError instanceof Error ? apiError.message : "Unknown error",
        },
      })
    }
  } catch (error) {
    logError("AstrologyTestAPI", "Error testing API credentials", error)

    return NextResponse.json({
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error occurred",
    })
  }
}
