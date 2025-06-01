import type { DashaPeriod } from "@/types/astrology"
import { logInfo, logDebug, logError } from "@/lib/logging-service"

// Constants for Vimshottari Dasha
const VIMSHOTTARI_DASHA_YEARS = {
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
  Ketu: 7,
  Venus: 20,
}

// Total years in Vimshottari cycle
const TOTAL_DASHA_YEARS = 120

// Standard Vimshottari sequence (starting from Ketu as per traditional order)
const DASHA_SEQUENCE = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]

// 27 Nakshatras with their lords in order
const NAKSHATRAS_WITH_LORDS = [
  { name: "Ashwini", lord: "Ketu" },
  { name: "Bharani", lord: "Venus" },
  { name: "Krittika", lord: "Sun" },
  { name: "Rohini", lord: "Moon" },
  { name: "Mrigashira", lord: "Mars" },
  { name: "Ardra", lord: "Rahu" },
  { name: "Punarvasu", lord: "Jupiter" },
  { name: "Pushya", lord: "Saturn" },
  { name: "Ashlesha", lord: "Mercury" },
  { name: "Magha", lord: "Ketu" },
  { name: "Purva Phalguni", lord: "Venus" },
  { name: "Uttara Phalguni", lord: "Sun" },
  { name: "Hasta", lord: "Moon" },
  { name: "Chitra", lord: "Mars" },
  { name: "Swati", lord: "Rahu" },
  { name: "Vishakha", lord: "Jupiter" },
  { name: "Anuradha", lord: "Saturn" },
  { name: "Jyeshtha", lord: "Mercury" },
  { name: "Mula", lord: "Ketu" },
  { name: "Purva Ashadha", lord: "Venus" },
  { name: "Uttara Ashadha", lord: "Sun" },
  { name: "Shravana", lord: "Moon" },
  { name: "Dhanishta", lord: "Mars" },
  { name: "Shatabhisha", lord: "Rahu" },
  { name: "Purva Bhadrapada", lord: "Jupiter" },
  { name: "Uttara Bhadrapada", lord: "Saturn" },
  { name: "Revati", lord: "Mercury" },
]

// Enhanced DashaPeriod interface with hierarchy support
export interface HierarchicalDashaPeriod extends DashaPeriod {
  level: "mahadasha" | "antardasha" | "pratyantardasha" | "sookshma" | "prana"
  children?: HierarchicalDashaPeriod[]
  parent?: HierarchicalDashaPeriod
}

/**
 * Gets the lord of a nakshatra by name
 */
function getNakshatraLord(nakshatraName: string): string {
  const nakshatra = NAKSHATRAS_WITH_LORDS.find(n => 
    n.name.toLowerCase() === nakshatraName.toLowerCase() ||
    n.name.toLowerCase().includes(nakshatraName.toLowerCase()) ||
    nakshatraName.toLowerCase().includes(n.name.toLowerCase())
  )
  return nakshatra?.lord || "Ketu" // Default to Ketu if not found
}

/**
 * Calculates Vimshottari Dasa based on Moon's exact position
 * Following the traditional method as per the given example:
 * Moon at 2°23' Aq (Dhanishtha 3rd pada) -> Mars dasa balance calculation
 */
export function calculatePreciseVimshottariDasha(
  moonLongitude: number,
  moonNakshatra: string,
  moonPada: number,
  birthDate: Date
): DashaPeriod[] {
  logInfo("dasha-calculator", "Starting precise Vimshottari Dasha calculation", {
    moonLongitude,
    moonNakshatra,
    moonPada,
    birthDate: birthDate.toISOString()
  })

  // Step 1: Find the constellation occupied by Moon (already known)
  const nakshatraLord = getNakshatraLord(moonNakshatra)
  
  // Step 2 & 3: Calculate advancement and remaining portion with exact precision
  // Each nakshatra spans exactly 13°20' (13.333333... degrees)
  const NAKSHATRA_SPAN_DEGREES = 13
  const NAKSHATRA_SPAN_MINUTES = 20
  const NAKSHATRA_SPAN_DECIMAL = NAKSHATRA_SPAN_DEGREES + (NAKSHATRA_SPAN_MINUTES / 60) // 13.333333...
  
  // Find the nakshatra index (0-26) based on longitude
  const nakshatraIndex = Math.floor(moonLongitude / NAKSHATRA_SPAN_DECIMAL)
  
  // Calculate the start longitude of this nakshatra
  const nakshatraStartLongitude = nakshatraIndex * NAKSHATRA_SPAN_DECIMAL
  
  // Calculate advancement in this nakshatra
  const advancementInNakshatra = moonLongitude - nakshatraStartLongitude
  
  // Convert advancement to degrees and minutes for logging
  const advancementDegrees = Math.floor(advancementInNakshatra)
  const advancementMinutes = Math.round((advancementInNakshatra - advancementDegrees) * 60)
  
  // Calculate remaining distance in nakshatra
  const remainingInNakshatra = NAKSHATRA_SPAN_DECIMAL - advancementInNakshatra
  
  // Calculate fraction remaining (as per example: remaining/total)
  const remainingFraction = remainingInNakshatra / NAKSHATRA_SPAN_DECIMAL
  
  // Convert remaining to degrees and minutes
  const remainingDegrees = Math.floor(remainingInNakshatra)
  const remainingMinutes = Math.round((remainingInNakshatra - remainingDegrees) * 60)

  logDebug("dasha-calculator", "Detailed nakshatra calculations", {
    nakshatraIndex,
    nakshatraName: moonNakshatra,
    nakshatraLord,
    nakshatraStartLongitude: nakshatraStartLongitude.toFixed(6),
    advancement: `${advancementDegrees}°${advancementMinutes}'`,
    advancementDecimal: advancementInNakshatra.toFixed(6),
    remaining: `${remainingDegrees}°${remainingMinutes}'`,
    remainingDecimal: remainingInNakshatra.toFixed(6),
    remainingFraction: remainingFraction.toFixed(6),
    totalNakshatraSpan: `${NAKSHATRA_SPAN_DEGREES}°${NAKSHATRA_SPAN_MINUTES}'`
  })

  // Step 4: First dasa belongs to the lord of the constellation
  const firstDashaLord = nakshatraLord
  
  // Step 5 & 6: Calculate balance of first dasa
  const firstDashaTotalYears = VIMSHOTTARI_DASHA_YEARS[firstDashaLord as keyof typeof VIMSHOTTARI_DASHA_YEARS]
  const firstDashaBalanceYears = firstDashaTotalYears * remainingFraction

  // Convert balance to years, months, days (as per traditional method)
  const balanceYears = Math.floor(firstDashaBalanceYears)
  const balanceMonths = Math.floor((firstDashaBalanceYears - balanceYears) * 12)
  const balanceDays = Math.floor(((firstDashaBalanceYears - balanceYears) * 12 - balanceMonths) * 30)
  const balanceGhatis = Math.round((((firstDashaBalanceYears - balanceYears) * 12 - balanceMonths) * 30 - balanceDays) * 60)

  logDebug("dasha-calculator", "First dasha balance calculation", {
    firstDashaLord,
    firstDashaTotalYears,
    firstDashaBalanceYears: firstDashaBalanceYears.toFixed(6),
    formattedBalance: `${balanceYears}Y ${balanceMonths}M ${balanceDays}D ${balanceGhatis}G`,
    calculationDetails: {
      totalYears: firstDashaTotalYears,
      fraction: remainingFraction.toFixed(6),
      result: `${firstDashaTotalYears} × ${remainingFraction.toFixed(6)} = ${firstDashaBalanceYears.toFixed(6)}`
    }
  })

  // Generate the complete dasha sequence starting from the current lord
  const dashaSequence: DashaPeriod[] = []
  
  // Find the starting index in the sequence
  let currentDashaIndex = DASHA_SEQUENCE.indexOf(firstDashaLord)
  if (currentDashaIndex === -1) {
    logError("dasha-calculator", "Invalid dasha lord", { firstDashaLord })
    currentDashaIndex = 0
  }

  let currentDate = new Date(birthDate)

  // Add the first (current) dasha with remaining years
  const firstDashaEndDate = addPreciseYearsToDate(currentDate, firstDashaBalanceYears)
  
  dashaSequence.push({
    planet: firstDashaLord,
    from: new Date(currentDate),
    to: new Date(firstDashaEndDate),
    duration: formatTraditionalDuration(firstDashaBalanceYears),
    balanceAtBirth: formatTraditionalDuration(firstDashaBalanceYears),
  })

  currentDate = new Date(firstDashaEndDate)

  // Add the remaining dashas in sequence (completing the 120-year cycle)
  for (let i = 1; i < 9; i++) {
    currentDashaIndex = (currentDashaIndex + 1) % DASHA_SEQUENCE.length
    const planet = DASHA_SEQUENCE[currentDashaIndex]
    const duration = VIMSHOTTARI_DASHA_YEARS[planet as keyof typeof VIMSHOTTARI_DASHA_YEARS]

    const endDate = addPreciseYearsToDate(currentDate, duration)

    dashaSequence.push({
      planet,
      from: new Date(currentDate),
      to: new Date(endDate),
      duration: `${duration} years`,
    })

    currentDate = new Date(endDate)
  }

  logInfo("dasha-calculator", "Dasha calculation completed", {
    totalDashas: dashaSequence.length,
    firstDasha: `${firstDashaLord} (${formatTraditionalDuration(firstDashaBalanceYears)} remaining)`,
    firstDashaEndDate: firstDashaEndDate.toISOString(),
    totalCycleYears: dashaSequence.reduce((sum, dasha) => {
      // Parse years from duration string
      const match = dasha.duration.match(/(\d+(?:\.\d+)?)\s*years?/)
      return sum + (match ? parseFloat(match[1]) : 0)
    }, 0).toFixed(2)
  })

  return dashaSequence
}

/**
 * Adds years (including fractions) to a date with high precision
 * Handles the traditional calendar calculations properly
 */
function addPreciseYearsToDate(date: Date, years: number): Date {
  const newDate = new Date(date)
  
  // Add whole years
  const wholeYears = Math.floor(years)
  newDate.setFullYear(newDate.getFullYear() + wholeYears)
  
  // Add fractional year as months and days with higher precision
  const fractionalYear = years - wholeYears
  const totalDaysToAdd = fractionalYear * 365.25 // Account for leap years
  
  // Add days
  const wholeDaysToAdd = Math.floor(totalDaysToAdd)
  newDate.setDate(newDate.getDate() + wholeDaysToAdd)
  
  // Add remaining hours/minutes for precision
  const fractionalDay = totalDaysToAdd - wholeDaysToAdd
  const millisecondsToAdd = fractionalDay * 24 * 60 * 60 * 1000
  newDate.setTime(newDate.getTime() + millisecondsToAdd)
  
  return newDate
}

/**
 * Formats dasha duration in traditional format (years, months, days, ghatis)
 * Following the example: "2 years 2 months 29 days 33 ghatis"
 */
function formatTraditionalDuration(years: number): string {
  const wholeYears = Math.floor(years)
  const fractionalYear = years - wholeYears
  
  const totalMonths = fractionalYear * 12
  const wholeMonths = Math.floor(totalMonths)
  const fractionalMonth = totalMonths - wholeMonths
  
  const totalDays = fractionalMonth * 30 // Traditional 30-day month
  const wholeDays = Math.floor(totalDays)
  const fractionalDay = totalDays - wholeDays
  
  const ghatis = Math.round(fractionalDay * 60) // 1 day = 60 ghatis
  
  // Build the formatted string
  const parts: string[] = []
  
  if (wholeYears > 0) parts.push(`${wholeYears} year${wholeYears === 1 ? '' : 's'}`)
  if (wholeMonths > 0) parts.push(`${wholeMonths} month${wholeMonths === 1 ? '' : 's'}`)
  if (wholeDays > 0) parts.push(`${wholeDays} day${wholeDays === 1 ? '' : 's'}`)
  if (ghatis > 0) parts.push(`${ghatis} ghati${ghatis === 1 ? '' : 's'}`)
  
  return parts.length > 0 ? parts.join(' ') : '0 days'
}

/**
 * Calculates the complete Vimshottari Dasha hierarchy
 * @param moonNakshatra The nakshatra of the Moon
 * @param moonPada The pada (quarter) of the nakshatra  
 * @param birthDate The date and time of birth
 * @param levels The number of dasha levels to calculate (1-5)
 * @returns An array of hierarchical dasha periods
 */
export function calculateVimshottariDashaHierarchy(
  moonNakshatra: string,
  moonPada: number,
  birthDate: Date,
  levels = 2,
): HierarchicalDashaPeriod[] {
  // Get the nakshatra lord to determine Moon's longitude approximately
  const nakshatraLord = getNakshatraLord(moonNakshatra)
  
  // Find the nakshatra index (0-26) 
  const nakshatraIndex = NAKSHATRAS_WITH_LORDS.findIndex(n => 
    n.name.toLowerCase() === moonNakshatra.toLowerCase() ||
    n.name.toLowerCase().includes(moonNakshatra.toLowerCase()) ||
    moonNakshatra.toLowerCase().includes(n.name.toLowerCase())
  )
  
  // Calculate approximate Moon longitude based on nakshatra and pada
  // Each nakshatra spans 13°20' (13.333333 degrees)
  // Each pada is 1/4 of nakshatra = 3°20' (3.333333 degrees)
  const NAKSHATRA_SPAN = 13.333333
  const PADA_SPAN = NAKSHATRA_SPAN / 4
  
  const nakshatraStartLongitude = nakshatraIndex * NAKSHATRA_SPAN
  const padaOffset = (moonPada - 1) * PADA_SPAN
  const approximateMoonLongitude = nakshatraStartLongitude + padaOffset + (PADA_SPAN / 2) // Middle of pada
  
  // Use the comprehensive calculation
  return calculateCompleteVimshottariDashaHierarchy(
    approximateMoonLongitude,
    moonNakshatra,
    moonPada,
    birthDate,
    levels
  )
}

/**
 * Finds all active dasha periods at a specific date across all levels
 * @param dashaHierarchy The complete dasha hierarchy
 * @param date The date to check
 * @returns An object with active periods at each level
 */
export function findAllActiveDashaPeriodsAtDate(
  dashaHierarchy: HierarchicalDashaPeriod[],
  date: Date
): {
  mahadasha?: HierarchicalDashaPeriod
  antardasha?: HierarchicalDashaPeriod
  pratyantardasha?: HierarchicalDashaPeriod
  sookshma?: HierarchicalDashaPeriod
  prana?: HierarchicalDashaPeriod
} {
  const result: any = {}

  // Find active Mahadasha
  const activeMahadasha = dashaHierarchy.find((dasha) => 
    date >= dasha.from && date <= dasha.to
  )

  if (!activeMahadasha) return result

  result.mahadasha = activeMahadasha

  // Find active Antardasha
  if (activeMahadasha.children) {
    const activeAntardasha = activeMahadasha.children.find((antardasha) =>
      date >= antardasha.from && date <= antardasha.to
    )

    if (activeAntardasha) {
      result.antardasha = activeAntardasha

      // Find active Pratyantardasha
      if (activeAntardasha.children) {
        const activePratyantardasha = activeAntardasha.children.find((pratyantardasha) =>
          date >= pratyantardasha.from && date <= pratyantardasha.to
        )

        if (activePratyantardasha) {
          result.pratyantardasha = activePratyantardasha

          // Find active Sookshma
          if (activePratyantardasha.children) {
            const activeSookshma = activePratyantardasha.children.find((sookshma) =>
              date >= sookshma.from && date <= sookshma.to
            )

            if (activeSookshma) {
              result.sookshma = activeSookshma

              // Find active Prana
              if (activeSookshma.children) {
                const activePrana = activeSookshma.children.find((prana) =>
                  date >= prana.from && date <= prana.to
                )

                if (activePrana) {
                  result.prana = activePrana
                }
              }
            }
          }
        }
      }
    }
  }

  return result
}

/**
 * Formats the complete active dasha information for display
 * @param activePeriods The active periods at all levels
 * @returns Formatted string with all active periods
 */
export function formatActiveDashaDisplay(activePeriods: ReturnType<typeof findAllActiveDashaPeriodsAtDate>): string {
  const parts: string[] = []
  
  if (activePeriods.mahadasha) {
    parts.push(`${activePeriods.mahadasha.planet} Mahadasha`)
  }
  
  if (activePeriods.antardasha) {
    parts.push(`${activePeriods.antardasha.planet} Antardasha`)
  }
  
  if (activePeriods.pratyantardasha) {
    parts.push(`${activePeriods.pratyantardasha.planet} Pratyantardasha`)
  }
  
  if (activePeriods.sookshma) {
    parts.push(`${activePeriods.sookshma.planet} Sookshma`)
  }
  
  if (activePeriods.prana) {
    parts.push(`${activePeriods.prana.planet} Prana`)
  }
  
  return parts.join(' > ')
}

/**
 * Test function to validate the dasha calculation with the provided example
 * Moon at 2°23' Aquarius (Dhanishtha, 3rd pada) on April 28, 2000, 5:50 AM GMT-4
 * Expected result: Mars dasa balance = 2 years 2 months 29 days 33 ghatis
 */
export function testDashaCalculationWithExample(): void {
  const testMoonLongitude = 302.3833333 // 2°23' Aquarius = 300° + 2.383333°
  const testNakshatra = "Dhanishtha"
  const testPada = 3
  const testBirthDate = new Date("2000-04-28T09:50:00.000Z") // 5:50 AM GMT-4 = 9:50 AM GMT
  
  logInfo("dasha-calculator", "Testing with provided example", {
    moonPosition: "2°23' Aquarius",
    moonLongitude: testMoonLongitude,
    nakshatra: testNakshatra,
    pada: testPada,
    birthDate: testBirthDate.toISOString()
  })
  
  // Calculate dasha using our implementation
  const dashas = calculatePreciseVimshottariDasha(
    testMoonLongitude,
    testNakshatra,
    testPada,
    testBirthDate
  )
  
  if (dashas.length > 0) {
    const firstDasha = dashas[0]
    logInfo("dasha-calculator", "Test results", {
      expectedPlanet: "Mars",
      actualPlanet: firstDasha.planet,
      expectedBalance: "2 years 2 months 29 days 33 ghatis",
      actualBalance: firstDasha.balanceAtBirth,
      expectedEndDate: "around July 15, 2002, 7 PM",
      actualEndDate: firstDasha.to.toISOString(),
      match: firstDasha.planet === "Mars" ? "✓ Planet matches" : "✗ Planet mismatch"
    })
  }
}

/**
 * Manual verification of the example calculation
 * Moon at 2°23' Aquarius (Dhanishtha) -> Mars dasa balance
 */
export function verifyExampleCalculation(): void {
  // Example data
  const moonLongitudeAquarius = 2 + (23/60) // 2°23' = 2.383333°
  const moonAbsoluteLongitude = 300 + moonLongitudeAquarius // 302.383333°
  
  // Dhanishtha constellation boundaries (as per example)
  const dhanishthraStartCapricorn = 23 + (20/60) // 23°20' Capricorn
  const dhanishthraStartAbsolute = 270 + dhanishthraStartCapricorn // 293.333333°
  const constellationLength = 13 + (20/60) // 13°20' = 13.333333°
  
  // Step 2: Moon's advancement in constellation
  const advancement = moonAbsoluteLongitude - dhanishthraStartAbsolute // Should be 9°03'
  const advancementDegrees = Math.floor(advancement)
  const advancementMinutes = Math.round((advancement - advancementDegrees) * 60)
  
  // Step 3: Fraction remaining
  const remaining = constellationLength - advancement // Should be 4°17'
  const remainingDegrees = Math.floor(remaining)
  const remainingMinutes = Math.round((remaining - remainingDegrees) * 60)
  const fraction = remaining / constellationLength // Should be 0.32125
  
  // Step 6: Mars dasa balance
  const marsDasaTotal = 7 // years
  const marsBalance = marsDasaTotal * fraction // Should be 2.24875 years
  
  // Convert to traditional format
  const years = Math.floor(marsBalance)
  const months = Math.floor((marsBalance - years) * 12)
  const days = Math.floor(((marsBalance - years) * 12 - months) * 30)
  const ghatis = Math.round((((marsBalance - years) * 12 - months) * 30 - days) * 60)
  
  console.log("=== DASHA CALCULATION VERIFICATION ===")
  console.log(`Moon Position: ${moonLongitudeAquarius.toFixed(6)}° Aquarius`)
  console.log(`Absolute Longitude: ${moonAbsoluteLongitude.toFixed(6)}°`)
  console.log(`Dhanishtha Start: ${dhanishthraStartAbsolute.toFixed(6)}°`)
  console.log(`Advancement: ${advancementDegrees}°${advancementMinutes}' (${advancement.toFixed(6)}°)`)
  console.log(`Remaining: ${remainingDegrees}°${remainingMinutes}' (${remaining.toFixed(6)}°)`)
  console.log(`Fraction: ${fraction.toFixed(6)} (Expected: 0.321250)`)
  console.log(`Mars Balance: ${marsBalance.toFixed(6)} years`)
  console.log(`Formatted: ${years} years ${months} months ${days} days ${ghatis} ghatis`)
  console.log("Expected: 2 years 2 months 29 days 33 ghatis")
  console.log("=== END VERIFICATION ===")
}

/**
 * Calculates sub-periods (Antardasa, Pratyantardasa, Sookshma) for a given period
 * @param parentPlanet The planet ruling the parent period
 * @param parentDurationYears Total duration of parent period in years
 * @param parentStartDate Start date of the parent period
 * @param level The level of subdivision (antardasa, pratyantardasa, sookshma)
 * @returns Array of sub-periods
 */
function calculateSubPeriods(
  parentPlanet: string,
  parentDurationYears: number,
  parentStartDate: Date,
  level: "antardasha" | "pratyantardasha" | "sookshma" | "prana"
): HierarchicalDashaPeriod[] {
  const subPeriods: HierarchicalDashaPeriod[] = []
  
  // Find the starting index for the parent planet in the sequence
  let currentIndex = DASHA_SEQUENCE.indexOf(parentPlanet)
  if (currentIndex === -1) {
    logError("dasha-calculator", "Invalid parent planet for sub-periods", { parentPlanet })
    return []
  }

  let currentDate = new Date(parentStartDate)
  
  // Calculate 9 sub-periods starting from the parent planet
  for (let i = 0; i < 9; i++) {
    const planetIndex = (currentIndex + i) % DASHA_SEQUENCE.length
    const planet = DASHA_SEQUENCE[planetIndex]
    const planetYears = VIMSHOTTARI_DASHA_YEARS[planet as keyof typeof VIMSHOTTARI_DASHA_YEARS]
    
    // Calculate proportional duration: (planet_years / 120) * parent_duration
    const subPeriodDurationYears = (planetYears / TOTAL_DASHA_YEARS) * parentDurationYears
    const endDate = addPreciseYearsToDate(currentDate, subPeriodDurationYears)
    
    const subPeriod: HierarchicalDashaPeriod = {
      planet,
      from: new Date(currentDate),
      to: new Date(endDate),
      duration: formatTraditionalDuration(subPeriodDurationYears),
      level,
    }
    
    subPeriods.push(subPeriod)
    currentDate = new Date(endDate)
  }
  
  logDebug("dasha-calculator", `Calculated ${level} periods`, {
    parentPlanet,
    parentDurationYears: parentDurationYears.toFixed(6),
    subPeriodCount: subPeriods.length,
    level
  })
  
  return subPeriods
}

/**
 * Calculates the complete Vimshottari Dasha hierarchy with all sub-levels
 * @param moonLongitude Moon's longitude in degrees
 * @param moonNakshatra Moon's nakshatra name
 * @param moonPada Moon's pada (1-4)
 * @param birthDate Birth date and time
 * @param maxLevels Maximum levels to calculate (1-5: mahadasha, antardasha, pratyantardasha, sookshma, prana)
 * @returns Array of hierarchical dasha periods
 */
export function calculateCompleteVimshottariDashaHierarchy(
  moonLongitude: number,
  moonNakshatra: string,
  moonPada: number,
  birthDate: Date,
  maxLevels: number = 3
): HierarchicalDashaPeriod[] {
  logInfo("dasha-calculator", "Starting complete Vimshottari Dasha hierarchy calculation", {
    moonLongitude,
    moonNakshatra,
    moonPada,
    birthDate: birthDate.toISOString(),
    maxLevels
  })

  // First get the basic Mahadasha sequence
  const mahadashas = calculatePreciseVimshottariDasha(moonLongitude, moonNakshatra, moonPada, birthDate)
  
  // Convert to hierarchical format and add sub-periods
  const hierarchicalDashas: HierarchicalDashaPeriod[] = []
  
  for (let i = 0; i < mahadashas.length; i++) {
    const mahadasha = mahadashas[i]
    
    // Create the Mahadasha with level information
    const hierarchicalMahadasha: HierarchicalDashaPeriod = {
      ...mahadasha,
      level: "mahadasha",
      children: []
    }
    
    if (maxLevels >= 2) {
      // Calculate Antardashas
      // Special handling for the first dasha
      let antardashaCalculationDuration: number
      
      if (i === 0) {
        // For the first dasha, use the COMPLETE duration, not the remainder
        const firstDashaCompleteDuration = VIMSHOTTARI_DASHA_YEARS[mahadasha.planet as keyof typeof VIMSHOTTARI_DASHA_YEARS]
        antardashaCalculationDuration = firstDashaCompleteDuration
        
        logDebug("dasha-calculator", "Using complete duration for first dasha antardashas", {
          planet: mahadasha.planet,
          remainderAtBirth: mahadasha.duration,
          completeDuration: firstDashaCompleteDuration
        })
      } else {
        // For subsequent dashas, use the actual duration
        const match = mahadasha.duration.match(/(\d+(?:\.\d+)?)\s*years?/)
        antardashaCalculationDuration = match ? parseFloat(match[1]) : 0
      }
      
      if (antardashaCalculationDuration > 0) {
        // Calculate the theoretical start date for complete antardashas
        let antardashaStartDate: Date
        
        if (i === 0) {
          // For first dasha, calculate when the complete dasha would have started
          const remainderYears = parseFloat(mahadasha.duration.split(' ')[0]) || 0
          const timeBeforeBirth = antardashaCalculationDuration - remainderYears
          antardashaStartDate = addPreciseYearsToDate(birthDate, -timeBeforeBirth)
        } else {
          antardashaStartDate = mahadasha.from
        }
        
        const antardashas = calculateSubPeriods(
          mahadasha.planet,
          antardashaCalculationDuration,
          antardashaStartDate,
          "antardasha"
        )
        
        // Filter antardashas to only include those active after birth
        const activeAntardashas = antardashas.filter(antardasha => antardasha.to > birthDate)
        
        // Adjust first active antardasha start date if needed
        if (activeAntardashas.length > 0 && i === 0) {
          const firstActiveAntardasha = activeAntardashas[0]
          if (firstActiveAntardasha.from < birthDate) {
            firstActiveAntardasha.from = new Date(birthDate)
          }
        }
        
        hierarchicalMahadasha.children = activeAntardashas
        
        // Calculate deeper levels if requested
        if (maxLevels >= 3) {
          for (const antardasha of activeAntardashas) {
            const antardashaMatch = antardasha.duration.match(/(\d+(?:\.\d+)?)\s*years?/)
            const antardashaYears = antardashaMatch ? parseFloat(antardashaMatch[1]) : 0
            
            if (antardashaYears > 0) {
              const pratyantardashas = calculateSubPeriods(
                antardasha.planet,
                antardashaYears,
                antardasha.from,
                "pratyantardasha"
              )
              
              antardasha.children = pratyantardashas
              
              // Calculate Sookshma if requested
              if (maxLevels >= 4) {
                for (const pratyantardasha of pratyantardashas) {
                  const pratyantardashaMatch = pratyantardasha.duration.match(/(\d+(?:\.\d+)?)\s*years?/)
                  const pratyantardashaYears = pratyantardashaMatch ? parseFloat(pratyantardashaMatch[1]) : 0
                  
                  if (pratyantardashaYears > 0) {
                    const sookshmas = calculateSubPeriods(
                      pratyantardasha.planet,
                      pratyantardashaYears,
                      pratyantardasha.from,
                      "sookshma"
                    )
                    
                    pratyantardasha.children = sookshmas
                    
                    // Calculate Prana if requested
                    if (maxLevels >= 5) {
                      for (const sookshma of sookshmas) {
                        const sookshmaMatch = sookshma.duration.match(/(\d+(?:\.\d+)?)\s*years?/)
                        const sookshmaYears = sookshmaMatch ? parseFloat(sookshmaMatch[1]) : 0
                        
                        if (sookshmaYears > 0) {
                          const pranas = calculateSubPeriods(
                            sookshma.planet,
                            sookshmaYears,
                            sookshma.from,
                            "prana"
                          )
                          
                          sookshma.children = pranas
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    
    hierarchicalDashas.push(hierarchicalMahadasha)
  }
  
  logInfo("dasha-calculator", "Complete dasha hierarchy calculation completed", {
    mahadashaCount: hierarchicalDashas.length,
    maxLevels,
    firstMahadasha: hierarchicalDashas[0]?.planet,
    firstMahadashaAntardashaCount: hierarchicalDashas[0]?.children?.length || 0
  })
  
  return hierarchicalDashas
}

/**
 * Legacy function - Finds the active dasha periods at a specific date
 * @param dashaHierarchy The complete dasha hierarchy
 * @param date The date to check
 * @param maxLevel The maximum level to check (1-5)
 * @returns An array of active dasha periods at each level
 */
export function findActiveDashaPeriodsAtDate(
  dashaHierarchy: HierarchicalDashaPeriod[],
  date: Date,
  maxLevel = 5,
): HierarchicalDashaPeriod[] {
  const activePeriods: HierarchicalDashaPeriod[] = []
  const allActive = findAllActiveDashaPeriodsAtDate(dashaHierarchy, date)
  
  if (allActive.mahadasha) activePeriods.push(allActive.mahadasha)
  if (allActive.antardasha && maxLevel >= 2) activePeriods.push(allActive.antardasha)
  if (allActive.pratyantardasha && maxLevel >= 3) activePeriods.push(allActive.pratyantardasha)
  if (allActive.sookshma && maxLevel >= 4) activePeriods.push(allActive.sookshma)
  if (allActive.prana && maxLevel >= 5) activePeriods.push(allActive.prana)
  
  return activePeriods
}

/**
 * Calculates the next dasha transition date
 * @param activePeriods The currently active dasha periods
 * @returns The next transition date and the level at which it occurs
 */
export function getNextDashaTransition(activePeriods: HierarchicalDashaPeriod[]): { date: Date; level: string } | null {
  if (activePeriods.length === 0) return null

  // Find the earliest end date among active periods
  let earliestTransition = {
    date: new Date(activePeriods[0].to),
    level: activePeriods[0].level,
  }

  for (let i = 1; i < activePeriods.length; i++) {
    if (activePeriods[i].to < earliestTransition.date) {
      earliestTransition = {
        date: new Date(activePeriods[i].to),
        level: activePeriods[i].level,
      }
    }
  }

  return earliestTransition
}

/**
 * Determines if a date is in a dasha sandhi (transition period)
 * @param activePeriods The currently active dasha periods
 * @param date The date to check
 * @returns Whether the date is in a dasha sandhi and details about the transition
 */
export function isInDashaSandhi(
  activePeriods: HierarchicalDashaPeriod[],
  date: Date,
): { isInSandhi: boolean; level?: string; percentComplete?: number } {
  if (activePeriods.length === 0) {
    return { isInSandhi: false }
  }

  // Check each active period for sandhi (last 10% of period)
  for (const period of activePeriods) {
    const periodDuration = period.to.getTime() - period.from.getTime()
    const sandhiStart = new Date(period.to.getTime() - periodDuration * 0.1)

    if (date >= sandhiStart && date <= period.to) {
      const timeInSandhi = date.getTime() - sandhiStart.getTime()
      const sandhiDuration = period.to.getTime() - sandhiStart.getTime()
      const percentComplete = (timeInSandhi / sandhiDuration) * 100

      return {
        isInSandhi: true,
        level: period.level,
        percentComplete,
      }
    }
  }

  return { isInSandhi: false }
}

/**
 * Enhanced version that returns hierarchical dasha periods with sub-divisions
 * Uses precise Moon longitude when available
 */
export function calculateVimshottariDasha(
  moonNakshatra: string,
  moonPada: number,
  birthDate: Date,
  levels = 2,
): HierarchicalDashaPeriod[] {
  return calculateVimshottariDashaHierarchy(moonNakshatra, moonPada, birthDate, levels)
}
