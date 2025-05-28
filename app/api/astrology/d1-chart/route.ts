import { type NextRequest, NextResponse } from "next/server"
import { createAstrologyApiClient, convertBirthDetailsToApiFormat } from "@/lib/astrology/api-client"
import { logInfo, logError } from "@/lib/logging-service"

export async function POST(request: NextRequest) {
  try {
    logInfo("d1-chart-api", "Received request for planets data")

    const birthDetails = await request.json()
    logInfo("d1-chart-api", "Birth details received", {
      date: birthDetails.date,
      time: birthDetails.time,
      city: birthDetails.city,
    })

    // Create API client
    const apiClient = createAstrologyApiClient()
    if (!apiClient) {
      logError("d1-chart-api", "API client not available - missing credentials")
      return NextResponse.json({ error: "API credentials not configured" }, { status: 500 })
    }

    // Convert birth details to API format
    const apiData = convertBirthDetailsToApiFormat(birthDetails)
    logInfo("d1-chart-api", "Birth details converted to API format", apiData)

    // Fetch planets data from the new API
    const planetsData = await apiClient.fetchPlanets(apiData)
    logInfo("d1-chart-api", "Planets data fetched successfully", {
      planetCount: planetsData.length,
      planets: planetsData.map((p) => p.name).join(", "),
    })

    return NextResponse.json(planetsData)
  } catch (error) {
    logError("d1-chart-api", "Error in planets API route", error)
    return NextResponse.json(
      { error: "Failed to fetch planets data", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
