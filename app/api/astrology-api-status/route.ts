import { NextResponse } from "next/server"
import { createAstrologyApiClient } from "@/lib/astrology/api-client"
import { logInfo, logError } from "@/lib/logging-service"

export async function GET() {
  try {
    logInfo("AstrologyApiStatus", "Checking API credentials and status")

    // Check if environment variables are set
    const userId = process.env.ASTROLOGY_API_USER_ID
    const apiKey = process.env.ASTROLOGY_API_KEY

    if (!userId || !apiKey) {
      logInfo("AstrologyApiStatus", "API credentials not configured", {
        hasUserId: !!userId,
        hasApiKey: !!apiKey,
      })

      return NextResponse.json({
        status: "unconfigured",
        message: "API credentials not configured",
        hasUserId: !!userId,
        hasApiKey: !!apiKey,
      })
    }

    // Try to create client and validate credentials
    const apiClient = createAstrologyApiClient()

    if (!apiClient) {
      return NextResponse.json({
        status: "error",
        message: "Failed to create API client",
      })
    }

    // Validate credentials with the API
    const isValid = await apiClient.validateCredentials()

    if (isValid) {
      logInfo("AstrologyApiStatus", "API credentials validated successfully")
      return NextResponse.json({
        status: "available",
        message: "API credentials are valid",
      })
    } else {
      logInfo("AstrologyApiStatus", "API credentials validation failed")
      return NextResponse.json({
        status: "invalid",
        message: "API credentials are invalid",
      })
    }
  } catch (error) {
    logError("AstrologyApiStatus", "Error checking API status", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
