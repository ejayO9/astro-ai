import type { BirthDetails, AstrologyChart } from "@/types/astrology"
import { convertPlanetsToAstrologyChart } from "./chart-converter"
import { calculateVimshottariDashaHierarchy } from "./dasha-calculator"
import { calculateNavamsa, calculateDashamsa, calculateAyanamsa, calculateVedicChart } from "./calculator"
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
  });

  try {
    // Try to use the secure astrology API route first
    logInfo("enhanced-calculator", "Attempting API calculation via secure route");

    // Use the secure API route for planets data
    const response = await fetch('/api/astrology/planets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(birthDetails),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API request failed: ${response.status} ${response.statusText}`);
    }

    const planetsApiResponse = await response.json();
    console.log('=== RAW PLANETS API RESPONSE ===', JSON.stringify(planetsApiResponse, null, 2));
    logInfo("enhanced-calculator", "Planets data fetched from API successfully", {
      planetCount: planetsApiResponse.length,
    });

    // Convert API response to our format
    const partialChart = convertPlanetsToAstrologyChart(planetsApiResponse, birthDetails);
    logInfo("enhanced-calculator", "API response converted to our format");

    // Calculate additional elements that the API doesn't provide
    const enhancedChart = await enhanceChartWithCalculations(partialChart, birthDetails);

    // Attach raw API response for debugging
    (enhancedChart as any)._rawPlanetsApiResponse = planetsApiResponse;

    logInfo("enhanced-calculator", "Chart calculation completed using live API data");
    return enhancedChart;
  } catch (error) {
    logError("enhanced-calculator", "API calculation failed, using internal fallback", error);
    // FALLBACK: Use internal calculation if API fails
    logWarn("enhanced-calculator", "Using internal fallback calculation");
    return await calculateVedicChart(birthDetails);
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

    // Check if dashas were already calculated in the conversion step
    if (partialChart.dashas && partialChart.dashas.length > 0) {
      logInfo("enhanced-calculator", "Using dashas from chart converter", {
        dashaCount: partialChart.dashas.length,
        firstDasha: partialChart.dashas[0]?.planet
      })
      dashas = partialChart.dashas
    } else if (moon) {
      logInfo("enhanced-calculator", "Calculating dashas from moon position")
      // Import the original dasha calculation function
      const { calculateVimshottariDasha } = await import("./calculator")
      dashas = calculateVimshottariDasha(moon.nakshatra, moon.nakshatraPada, partialChart.native!.birthDate)
    }

    if (moon) {
      // Calculate hierarchical dashas with 3 levels
      hierarchicalDashas = calculateVimshottariDashaHierarchy(
        moon.nakshatra,
        moon.nakshatraPada,
        partialChart.native!.birthDate,
        3,
      )
      
      logInfo("enhanced-calculator", "Calculated hierarchical dashas", {
        hierarchicalDashaCount: hierarchicalDashas.length,
        firstMahadasha: hierarchicalDashas[0]?.planet,
        firstAntardashaCount: hierarchicalDashas[0]?.children?.length || 0
      })
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

    console.log('=== FINAL ASTROLOGY CHART ===', JSON.stringify(completeChart, null, 2));
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