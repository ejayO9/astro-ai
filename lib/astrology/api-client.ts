console.log('USER_ID:', process.env.ASTROLOGY_API_USER_ID);
console.log('API_KEY:', process.env.ASTROLOGY_API_KEY);

import { logInfo, logError, logWarn } from "@/lib/logging-service"

// Types for the new planets API response
export interface PlanetData {
  id: number
  name: string
  fullDegree: number
  normDegree: number
  speed: number
  isRetro: string | boolean
  sign: string
  signLord: string
  nakshatra: string
  nakshatraLord: string
  nakshatra_pad: number
  house: number
  is_planet_set: boolean
  planet_awastha: string
}

export type PlanetsResponse = PlanetData[]

export interface BirthDetailsApiFormat {
  day: number
  month: number
  year: number
  hour: number
  min: number
  lat: number
  lon: number
  tzone: number
}

export interface AstrologyApiClient {
  fetchPlanets: (data: BirthDetailsApiFormat) => Promise<PlanetsResponse>
  validateCredentials: () => Promise<boolean>
}

export function convertBirthDetailsToApiFormat(birthDetails: any): BirthDetailsApiFormat {
  const [year, month, day] = birthDetails.date.split("-").map(Number)
  const [hour, min] = birthDetails.time.split(":").map(Number)

  // Convert timezone string to number (e.g., "+05:30" to 5.5)
  let timezoneOffset = 0
  if (birthDetails.timezone) {
    const match = birthDetails.timezone.match(/([+-])(\d{2}):(\d{2})/)
    if (match) {
      const sign = match[1] === "+" ? 1 : -1
      const hours = Number.parseInt(match[2])
      const minutes = Number.parseInt(match[3])
      timezoneOffset = sign * (hours + minutes / 60)
    }
  }

  const apiFormat = {
    day,
    month,
    year,
    hour,
    min,
    lat: birthDetails.latitude,
    lon: birthDetails.longitude,
    tzone: timezoneOffset,
  }
  console.log('convertBirthDetailsToApiFormat:', apiFormat)
  return apiFormat
}

export function createAstrologyApiClient(): AstrologyApiClient | null {
  const userId = process.env.ASTROLOGY_API_USER_ID
  const apiKey = process.env.ASTROLOGY_API_KEY

  if (!userId || !apiKey) {
    logWarn("api-client", "Astrology API credentials not found")
    return null
  }

  const baseUrl = "https://json.astrologyapi.com/v1"
  const auth = Buffer.from(`${userId}:${apiKey}`).toString("base64")

  return {
    async fetchPlanets(data: BirthDetailsApiFormat): Promise<PlanetsResponse> {
      logInfo("api-client", "Fetching planets data from API", {
        endpoint: "/planets",
        birthData: data,
      })

      try {
        const response = await fetch(`${baseUrl}/planets`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${auth}`,
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorText = await response.text()
          logError("api-client", "API request failed", {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
          })
          throw new Error(`API request failed: ${response.status} ${response.statusText}`)
        }

        const planetsData = await response.json()
        logInfo("api-client", "Planets data fetched successfully", {
          planetCount: planetsData.length,
          planets: planetsData.map((p: PlanetData) => p.name).join(", "),
        })

        return planetsData
      } catch (error) {
        logError("api-client", "Error fetching planets data", error)
        throw error
      }
    },

    async validateCredentials(): Promise<boolean> {
      logInfo("api-client", "Validating API credentials")

      try {
        // Use a simple test request to validate credentials
        const testData: BirthDetailsApiFormat = {
          day: 8,
          month: 2,
          year: 1997,
          hour: 7,
          min: 47,
          lat: 22.5726,
          lon: 88.3639,
          tzone: 5.5,
        }

        const response = await fetch(`${baseUrl}/planets`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${auth}`,
          },
          body: JSON.stringify(testData),
        })

        const isValid = response.ok
        logInfo("api-client", "Credential validation result", {
          isValid,
          status: response.status,
        })

        return isValid
      } catch (error) {
        logError("api-client", "Error validating credentials", error)
        return false
      }
    },
  }
}
