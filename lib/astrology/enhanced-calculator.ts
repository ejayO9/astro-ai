import type { BirthDetails, AstrologyChart } from "@/types/astrology"
import { convertBirthDetailsToApiFormat, createAstrologyApiClient } from "./api-client"
import { convertPlanetsToAstrologyChart } from "./chart-converter"
import { calculateVimshottariDashaHierarchy } from "./dasha-calculator"
import { calculateNavamsa, calculateDashamsa, calculateAyanamsa } from "./calculator"
import { logInfo, logError, logWarn, logDebug } from "@/lib/logging-service"

/**
 * Enhanced chart calculation that uses the astrology API for planetary data
 * and falls back to our internal calculations if API is not available
 */
export async function calculateEnhancedVedicChart(birthDetails: BirthDetails): Promise<AstrologyChart> {
  logInfo("enhanced-calculator", "Starting enhanced Vedic chart calculation", {
    name: birthDetails.name,
    date: birthDetails.date,
    time: birthDetails.time,
    location: `${birthDetails.city}, ${birthDetails.country}`,
  })

  try {
    // Try to use the astrology API first
    const apiClient = createAstrologyApiClient()

    if (apiClient) {
      logInfo("enhanced-calculator", "Astrology API client available, attempting API calculation")

      try {
        // Convert birth details to API format
        const apiData = convertBirthDetailsToApiFormat(birthDetails)
        logDebug("enhanced-calculator", "Birth details converted to API format", apiData)

        // Fetch planets data from new API
        const planetsResponse = await apiClient.fetchPlanets(apiData)
        logInfo("enhanced-calculator", "Planets data fetched from API successfully", {
          planetCount: planetsResponse.length,
        })

        // Convert API response to our format
        const partialChart = convertPlanetsToAstrologyChart(planetsResponse, birthDetails)
        logInfo("enhanced-calculator", "API response converted to our format")

        // Calculate additional elements that the API doesn't provide
        const enhancedChart = await enhanceChartWithCalculations(partialChart, birthDetails)
        logInfo("enhanced-calculator", "Chart enhanced with additional calculations")

        return enhancedChart
      } catch (apiError) {
        logError("enhanced-calculator", "API calculation failed, falling back to internal calculations", apiError)
        // Fall through to internal calculations
      }
    } else {
      logWarn("enhanced-calculator", "Astrology API not available, using internal calculations")
    }

    // Fallback to internal calculations
    logInfo("enhanced-calculator", "Using internal calculation methods")
    const { calculateVedicChart } = await import("./calculator")
    return await calculateVedicChart(birthDetails)
  } catch (error) {
    logError("enhanced-calculator", "Error in enhanced chart calculation", error)
    throw new Error(
      `Failed to calculate enhanced Vedic chart: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

/**
 * Enhances a partial chart with additional calculations
 */
async function enhanceChartWithCalculations(
  partialChart: Partial<AstrologyChart>,
  birthDetails: BirthDetails,
): Promise<AstrologyChart> {
  logInfo("enhanced-calculator", "Enhancing chart with additional calculations")

  try {
    // Ensure we have the required data
    if (!partialChart.ascendant || !partialChart.planets || !partialChart.rashiChart) {
      throw new Error("Partial chart missing required data (ascendant, planets, or rashiChart)")
    }

    // Calculate navamsa chart
    logDebug("enhanced-calculator", "Calculating navamsa chart")
    const navamsaChart = calculateNavamsa(partialChart.planets, partialChart.ascendant)

    // Calculate dashamsa chart
    logDebug("enhanced-calculator", "Calculating dashamsa chart")
    const dashamsa = calculateDashamsa(partialChart.planets, partialChart.ascendant)

    // Calculate ayanamsa
    logDebug("enhanced-calculator", "Calculating ayanamsa")
    const ayanamsa = calculateAyanamsa(partialChart.native!.birthDate)

    // Calculate dashas
    logDebug("enhanced-calculator", "Calculating dasha periods")
    const moon = partialChart.planets.find((p) => p.name === "Moon")
    let dashas: any[] = []
    let hierarchicalDashas: any[] = []

    if (moon) {
      // Import the original dasha calculation function
      const { calculateVimshottariDasha } = await import("./calculator")
      dashas = calculateVimshottariDasha(moon.nakshatra, moon.nakshatraPada, partialChart.native!.birthDate)

      // Calculate hierarchical dashas with 3 levels
      hierarchicalDashas = calculateVimshottariDashaHierarchy(
        moon.nakshatra,
        moon.nakshatraPada,
        partialChart.native!.birthDate,
        3,
      )
    }

    // Combine everything into a complete chart
    const completeChart: AstrologyChart = {
      native: partialChart.native!,
      ascendant: partialChart.ascendant,
      planets: partialChart.planets,
      rashiChart: partialChart.rashiChart,
      navamsaChart,
      dashamsa,
      dashas,
      hierarchicalDashas,
      ayanamsa,
    }

    logInfo("enhanced-calculator", "Chart enhancement completed successfully", {
      hasNavamsa: !!navamsaChart,
      hasDashamsa: !!dashamsa,
      dashaCount: dashas.length,
      hierarchicalDashaCount: hierarchicalDashas.length,
      ayanamsa: ayanamsa.toFixed(2),
    })

    return completeChart
  } catch (error) {
    logError("enhanced-calculator", "Error enhancing chart", error)
    throw new Error(`Failed to enhance chart: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Validates that the astrology API is working
 */
export async function validateAstrologyApi(): Promise<boolean> {
  logInfo("enhanced-calculator", "Validating astrology API")

  const apiClient = createAstrologyApiClient()

  if (!apiClient) {
    logWarn("enhanced-calculator", "No API credentials available")
    return false
  }

  try {
    const isValid = await apiClient.validateCredentials()
    logInfo("enhanced-calculator", "API validation result", { isValid })
    return isValid
  } catch (error) {
    logError("enhanced-calculator", "API validation failed", error)
    return false
  }
}
