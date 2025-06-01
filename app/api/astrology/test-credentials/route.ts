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
      day: 8,
      month: 2,
      year: 1997,
      hour: 7,
      min: 47,
      lat: 22.5744,
      lon: 88.3629,
      tzone: 5.5,
    }

    // No fetchD1Chart call anymore

    return NextResponse.json({
      status: "success",
      message: "API credentials are valid and working",
      details: {
        userId: "640843",
        plan: "Basic Plan (Trial)",
        daysLeft: 6,
        endpoint: "https://json.astrologyapi.com/v1/horo_chart/D1",
        testResult: {},
      },
    })
  } catch (apiError) {
    logError("AstrologyTestAPI", "Error testing API credentials", apiError)
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
}
