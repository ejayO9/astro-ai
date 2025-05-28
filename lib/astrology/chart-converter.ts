import type { D1ChartResponse, AstrologyApiHouseData, PlanetsResponse } from "./api-client"
import type { AstrologyChart, PlanetPosition, HouseData, AscendantData, BirthDetails } from "@/types/astrology"
import { longitudeToNakshatra } from "./calculator"
import { logInfo, logDebug, logError } from "@/lib/logging-service"

// Mapping from API sign numbers to sign names
const SIGN_ID_MAP: Record<number, string> = {
  1: "Aries",
  2: "Taurus",
  3: "Gemini",
  4: "Cancer",
  5: "Leo",
  6: "Virgo",
  7: "Libra",
  8: "Scorpio",
  9: "Sagittarius",
  10: "Capricorn",
  11: "Aquarius",
  12: "Pisces",
}

// Mapping from API planet names to standardized names
const PLANET_NAME_MAP: Record<string, string> = {
  SUN: "Sun",
  MOON: "Moon",
  MARS: "Mars",
  MERCURY: "Mercury",
  JUPITER: "Jupiter",
  VENUS: "Venus",
  SATURN: "Saturn",
  RAHU: "Rahu",
  KETU: "Ketu",
  // Short forms (with spaces trimmed)
  Su: "Sun",
  Mo: "Moon",
  Ma: "Mars",
  Me: "Mercury",
  Ju: "Jupiter",
  Ve: "Venus",
  Sa: "Saturn",
  Ra: "Rahu",
  Ke: "Ketu",
}

/**
 * Converts sign number to house number based on ascendant
 * In Vedic astrology, the ascendant sign becomes the 1st house
 */
function getHouseNumberFromSign(signNumber: number, ascendantSign: number): number {
  // Calculate house number: (sign - ascendant + 12) % 12, but 1-indexed
  const houseNumber = (signNumber - ascendantSign + 12) % 12
  return houseNumber === 0 ? 12 : houseNumber
}

/**
 * Determines the ascendant sign from the API response
 * The ascendant is typically the sign that appears first or has specific indicators
 */
function determineAscendantSign(apiResponse: AstrologyApiHouseData[]): number {
  // For now, we'll use a simple heuristic: the first sign in the response
  // In a real implementation, this would be determined by the birth time and location

  // Look for the first sign that has planets (often indicates importance)
  for (const signData of apiResponse) {
    if (signData.planet && signData.planet.length > 0) {
      logDebug("chart-converter", "Determined ascendant from first sign with planets", {
        ascendantSign: signData.sign,
        signName: signData.sign_name,
        planets: signData.planet,
      })
      return signData.sign
    }
  }

  // Fallback: use the first sign in the response
  const firstSign = apiResponse[0]?.sign || 1
  logDebug("chart-converter", "Using first sign as ascendant fallback", {
    ascendantSign: firstSign,
  })
  return firstSign
}

/**
 * Converts API response to our internal format
 */
function convertApiResponseToInternalFormat(apiResponse: AstrologyApiHouseData[]): {
  planets: PlanetPosition[]
  houses: Record<number, HouseData>
  ascendant: AscendantData
} {
  const planets: PlanetPosition[] = []
  const houses: Record<number, HouseData> = {}

  // Determine ascendant sign
  const ascendantSign = determineAscendantSign(apiResponse)
  const ascendantSignName = SIGN_ID_MAP[ascendantSign] || "Aries"

  logDebug("chart-converter", "Converting API response", {
    signCount: apiResponse.length,
    ascendantSign,
    ascendantSignName,
  })

  // Initialize all 12 houses
  for (let i = 1; i <= 12; i++) {
    houses[i] = {
      number: i,
      startLongitude: (i - 1) * 30,
      sign: SIGN_ID_MAP[i] || "Unknown",
      planets: [],
    }
  }

  // Process each sign from the API response
  for (const signData of apiResponse) {
    if (!signData || typeof signData.sign !== "number") continue

    const signNumber = signData.sign
    const signName = SIGN_ID_MAP[signNumber] || signData.sign_name || "Unknown"

    // Calculate which house this sign corresponds to
    const houseNumber = getHouseNumberFromSign(signNumber, ascendantSign)

    // Update house with correct sign
    if (houses[houseNumber]) {
      houses[houseNumber].sign = signName
      houses[houseNumber].startLongitude = (signNumber - 1) * 30
    }

    // Process planets in this sign
    if (signData.planet && Array.isArray(signData.planet)) {
      for (let planetIndex = 0; planetIndex < signData.planet.length; planetIndex++) {
        const planetName = signData.planet[planetIndex]
        if (!planetName) continue

        // Get standardized planet name
        const standardPlanetName = PLANET_NAME_MAP[planetName.toUpperCase().trim()] || planetName

        // Since planet_degree is empty, use middle of the sign as default
        const degreeInSign = 15 // Middle of the 30-degree sign
        const longitude = (signNumber - 1) * 30 + degreeInSign

        // Get nakshatra information
        let nakshatra = "Unknown"
        let pada = 1
        try {
          const nakshatraInfo = longitudeToNakshatra(longitude)
          nakshatra = nakshatraInfo.nakshatra
          pada = nakshatraInfo.pada
        } catch (error) {
          logDebug("chart-converter", "Error calculating nakshatra", { longitude, error })
        }

        const planet: PlanetPosition = {
          name: standardPlanetName,
          longitude: longitude,
          sign: signName,
          nakshatra,
          nakshatraPada: pada,
          isRetrograde: false, // API doesn't provide retrograde info
          house: houseNumber,
        }

        planets.push(planet)
        if (houses[houseNumber]) {
          houses[houseNumber].planets.push(planet)
        }

        logDebug("chart-converter", "Converted planet", {
          planetName: standardPlanetName,
          signNumber,
          signName,
          houseNumber,
          longitude,
          nakshatra,
        })
      }
    }
  }

  // Create ascendant data
  const ascendantLongitude = (ascendantSign - 1) * 30 + 15 // Middle of ascendant sign
  let ascendant: AscendantData

  try {
    const nakshatraInfo = longitudeToNakshatra(ascendantLongitude)
    ascendant = {
      longitude: ascendantLongitude,
      sign: ascendantSignName,
      nakshatra: nakshatraInfo.nakshatra,
      nakshatraPada: nakshatraInfo.pada,
    }
  } catch (error) {
    logDebug("chart-converter", "Error calculating ascendant nakshatra", { error })
    ascendant = {
      longitude: ascendantLongitude,
      sign: ascendantSignName,
      nakshatra: "Ashwini",
      nakshatraPada: 1,
    }
  }

  logInfo("chart-converter", "API response converted successfully", {
    planetCount: planets.length,
    houseCount: Object.keys(houses).length,
    ascendantSign: ascendantSignName,
    planetsPerHouse: Object.fromEntries(Object.entries(houses).map(([house, data]) => [house, data.planets.length])),
  })

  return { planets, houses, ascendant }
}

/**
 * Validates the D1 chart API response (exact format from your example)
 */
function validateD1ChartResponse(d1Response: D1ChartResponse | undefined | null): boolean {
  if (!d1Response) {
    logError("chart-converter", "D1 chart response is null or undefined")
    return false
  }

  // Check if it's an array
  if (!Array.isArray(d1Response)) {
    logError("chart-converter", "D1 chart response is not an array", {
      responseType: typeof d1Response,
    })
    return false
  }

  // Check if we have 12 signs (houses)
  if (d1Response.length !== 12) {
    logError("chart-converter", "D1 chart response doesn't have 12 signs", {
      signCount: d1Response.length,
    })
    return false
  }

  // Check if each sign has required structure
  for (let i = 0; i < d1Response.length; i++) {
    const signData = d1Response[i]
    if (!signData) {
      logError("chart-converter", `Sign data at index ${i} is null/undefined`)
      return false
    }

    const hasRequiredFields =
      typeof signData.sign === "number" &&
      typeof signData.sign_name === "string" &&
      Array.isArray(signData.planet) &&
      Array.isArray(signData.planet_small) &&
      Array.isArray(signData.planet_degree)

    if (!hasRequiredFields) {
      logError("chart-converter", `Sign data at index ${i} missing required fields`, {
        signData: JSON.stringify(signData),
      })
      return false
    }
  }

  logInfo("chart-converter", "D1 chart response validation successful", {
    signCount: d1Response.length,
    totalPlanets: d1Response.reduce((sum, sign) => sum + (sign.planet?.length || 0), 0),
  })

  return true
}

/**
 * Converts the new planets API response to our internal format
 */
function convertPlanetsResponseToInternalFormat(planetsData: PlanetsResponse): {
  planets: PlanetPosition[]
  houses: Record<number, HouseData>
  ascendant: AscendantData
} {
  const planets: PlanetPosition[] = []
  const houses: Record<number, HouseData> = {}
  let ascendant: AscendantData = {
    longitude: 0,
    sign: "Aquarius",
    nakshatra: "Purva Bhadrapad",
    nakshatraPada: 1,
  }

  logDebug("chart-converter", "Converting planets API response", {
    planetCount: planetsData.length,
  })

  // Initialize all 12 houses
  for (let i = 1; i <= 12; i++) {
    houses[i] = {
      number: i,
      startLongitude: (i - 1) * 30,
      sign: "Unknown",
      planets: [],
    }
  }

  // Process each planet from the API response
  for (const planetData of planetsData) {
    if (!planetData || !planetData.name) continue

    // Handle Ascendant separately
    if (planetData.name === "Ascendant") {
      ascendant = {
        longitude: planetData.fullDegree,
        sign: planetData.sign,
        nakshatra: planetData.nakshatra,
        nakshatraPada: planetData.nakshatra_pad,
      }

      // Update house 1 with ascendant sign
      if (houses[1]) {
        houses[1].sign = planetData.sign
        houses[1].startLongitude = planetData.fullDegree
      }

      logDebug("chart-converter", "Processed Ascendant", {
        sign: planetData.sign,
        degree: planetData.fullDegree,
        nakshatra: planetData.nakshatra,
      })
      continue
    }

    // Convert planet data to our internal format
    const planet: PlanetPosition = {
      name: planetData.name,
      longitude: planetData.fullDegree,
      sign: planetData.sign,
      nakshatra: planetData.nakshatra,
      nakshatraPada: planetData.nakshatra_pad,
      isRetrograde: planetData.isRetro === "true" || planetData.isRetro === true,
      house: planetData.house,
    }

    planets.push(planet)

    // Add planet to the appropriate house
    if (houses[planetData.house]) {
      houses[planetData.house].planets.push(planet)
      // Update house sign if not already set
      if (houses[planetData.house].sign === "Unknown") {
        houses[planetData.house].sign = planetData.sign
      }
    }

    logDebug("chart-converter", "Converted planet", {
      planetName: planetData.name,
      house: planetData.house,
      sign: planetData.sign,
      degree: planetData.fullDegree,
      nakshatra: planetData.nakshatra,
      isRetrograde: planet.isRetrograde,
    })
  }

  // Calculate house signs based on ascendant
  const ascendantHouse = planetsData.find((p) => p.name === "Ascendant")
  if (ascendantHouse) {
    const ascendantSignIndex = getSignIndex(ascendantHouse.sign)

    for (let houseNum = 1; houseNum <= 12; houseNum++) {
      const signIndex = (ascendantSignIndex + houseNum - 2) % 12
      const signName = getSignName(signIndex + 1)

      if (houses[houseNum]) {
        houses[houseNum].sign = signName
        houses[houseNum].startLongitude = signIndex * 30
      }
    }
  }

  logInfo("chart-converter", "Planets API response converted successfully", {
    planetCount: planets.length,
    houseCount: Object.keys(houses).length,
    ascendantSign: ascendant.sign,
    planetsPerHouse: Object.fromEntries(Object.entries(houses).map(([house, data]) => [house, data.planets.length])),
  })

  return { planets, houses, ascendant }
}

/**
 * Helper function to get sign index (0-11) from sign name
 */
function getSignIndex(signName: string): number {
  const signs = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
  ]
  return signs.indexOf(signName)
}

/**
 * Helper function to get sign name from index (1-12)
 */
function getSignName(signNumber: number): string {
  const signs = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
  ]
  return signs[(signNumber - 1) % 12] || "Unknown"
}

/**
 * Validates the planets API response
 */
function validatePlanetsResponse(planetsResponse: PlanetsResponse | undefined | null): boolean {
  if (!planetsResponse) {
    logError("chart-converter", "Planets response is null or undefined")
    return false
  }

  // Check if it's an array
  if (!Array.isArray(planetsResponse)) {
    logError("chart-converter", "Planets response is not an array", {
      responseType: typeof planetsResponse,
    })
    return false
  }

  // Check if we have planets (should be at least 9 planets + ascendant)
  if (planetsResponse.length < 9) {
    logError("chart-converter", "Planets response doesn't have enough planets", {
      planetCount: planetsResponse.length,
    })
    return false
  }

  // Check if each planet has required structure
  for (let i = 0; i < planetsResponse.length; i++) {
    const planetData = planetsResponse[i]
    if (!planetData) {
      logError("chart-converter", `Planet data at index ${i} is null/undefined`)
      return false
    }

    const hasRequiredFields =
      typeof planetData.id === "number" &&
      typeof planetData.name === "string" &&
      typeof planetData.fullDegree === "number" &&
      typeof planetData.sign === "string" &&
      typeof planetData.house === "number"

    if (!hasRequiredFields) {
      logError("chart-converter", `Planet data at index ${i} missing required fields`, {
        planetData: JSON.stringify(planetData),
      })
      return false
    }
  }

  logInfo("chart-converter", "Planets response validation successful", {
    planetCount: planetsResponse.length,
    planets: planetsResponse.map((p) => p.name).join(", "),
  })

  return true
}

/**
 * Converts the D1 chart API response to our AstrologyChart format
 */
export function convertD1ChartToAstrologyChart(
  d1Response: D1ChartResponse | undefined | null,
  birthDetails: BirthDetails,
): Partial<AstrologyChart> {
  logInfo("chart-converter", "Converting D1 chart response", {
    hasResponse: !!d1Response,
    responseType: Array.isArray(d1Response) ? "array" : typeof d1Response,
    signCount: Array.isArray(d1Response) ? d1Response.length : 0,
  })

  try {
    // Validate response
    if (!validateD1ChartResponse(d1Response)) {
      throw new Error("Invalid D1 chart response format")
    }

    // Convert the API response to our internal format
    const {
      planets,
      houses: rashiChart,
      ascendant,
    } = convertApiResponseToInternalFormat(d1Response as AstrologyApiHouseData[])

    // Create birth date object
    const [year, month, day] = birthDetails.date.split("-").map(Number)
    const [hour, minute] = birthDetails.time.split(":").map(Number)
    const birthDate = new Date(year, month - 1, day, hour, minute)

    const partialChart: Partial<AstrologyChart> = {
      native: {
        birthDate,
        location: {
          latitude: birthDetails.latitude,
          longitude: birthDetails.longitude,
          timezone: birthDetails.timezone,
          city: birthDetails.city,
          country: birthDetails.country,
        },
        name: birthDetails.name,
      },
      ascendant,
      planets,
      rashiChart,
      // Note: navamsaChart, dashamsa, dashas, and ayanamsa will be added in subsequent steps
    }

    logInfo("chart-converter", "D1 chart converted successfully", {
      ascendantSign: ascendant.sign,
      planetCount: planets.length,
      houseCount: Object.keys(rashiChart).length,
      planetDistribution: planets.reduce(
        (acc, planet) => {
          acc[planet.sign] = (acc[planet.sign] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),
    })

    return partialChart
  } catch (error) {
    logError("chart-converter", "Error converting D1 chart", error)
    throw new Error(`Failed to convert D1 chart: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Converts the planets API response to our AstrologyChart format
 */
export function convertPlanetsToAstrologyChart(
  planetsResponse: PlanetsResponse | undefined | null,
  birthDetails: BirthDetails,
): Partial<AstrologyChart> {
  logInfo("chart-converter", "Converting planets response", {
    hasResponse: !!planetsResponse,
    responseType: Array.isArray(planetsResponse) ? "array" : typeof planetsResponse,
    planetCount: Array.isArray(planetsResponse) ? planetsResponse.length : 0,
  })

  try {
    // Validate response
    if (!validatePlanetsResponse(planetsResponse)) {
      throw new Error("Invalid planets response format")
    }

    // Convert the API response to our internal format
    const {
      planets,
      houses: rashiChart,
      ascendant,
    } = convertPlanetsResponseToInternalFormat(planetsResponse as PlanetsResponse)

    // Create birth date object
    const [year, month, day] = birthDetails.date.split("-").map(Number)
    const [hour, minute] = birthDetails.time.split(":").map(Number)
    const birthDate = new Date(year, month - 1, day, hour, minute)

    const partialChart: Partial<AstrologyChart> = {
      native: {
        birthDate,
        location: {
          latitude: birthDetails.latitude,
          longitude: birthDetails.longitude,
          timezone: birthDetails.timezone,
          city: birthDetails.city,
          country: birthDetails.country,
        },
        name: birthDetails.name,
      },
      ascendant,
      planets,
      rashiChart,
      // Note: navamsaChart, dashamsa, dashas, and ayanamsa will be added in subsequent steps
    }

    logInfo("chart-converter", "Planets converted successfully", {
      ascendantSign: ascendant.sign,
      planetCount: planets.length,
      houseCount: Object.keys(rashiChart).length,
      planetDistribution: planets.reduce(
        (acc, planet) => {
          acc[planet.sign] = (acc[planet.sign] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),
    })

    return partialChart
  } catch (error) {
    logError("chart-converter", "Error converting planets", error)
    throw new Error(`Failed to convert planets: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Legacy function for backward compatibility
export function convertLegacyChartToAstrologyChart(
  d1Response: any,
  birthDetails: BirthDetails,
): Partial<AstrologyChart> {
  logInfo("chart-converter", "Using legacy converter - redirecting to planets converter")
  return convertPlanetsToAstrologyChart(d1Response, birthDetails)
}
