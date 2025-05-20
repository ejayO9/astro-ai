import type { DashaPeriod } from "@/types/astrology"

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

// Standard Vimshottari sequence
const DASHA_SEQUENCE = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]

// Nakshatra lords mapping
const NAKSHATRA_LORDS = [
  "Ketu", // Ashwini
  "Venus", // Bharani
  "Sun", // Krittika
  "Moon", // Rohini
  "Mars", // Mrigashira
  "Rahu", // Ardra
  "Jupiter", // Punarvasu
  "Saturn", // Pushya
  "Mercury", // Ashlesha
  "Ketu", // Magha
  "Venus", // Purva Phalguni
  "Sun", // Uttara Phalguni
  "Moon", // Hasta
  "Mars", // Chitra
  "Rahu", // Swati
  "Jupiter", // Vishakha
  "Saturn", // Anuradha
  "Mercury", // Jyeshtha
  "Ketu", // Mula
  "Venus", // Purva Ashadha
  "Sun", // Uttara Ashadha
  "Moon", // Shravana
  "Mars", // Dhanishta
  "Rahu", // Shatabhisha
  "Jupiter", // Purva Bhadrapada
  "Saturn", // Uttara Bhadrapada
  "Mercury", // Revati
]

// Enhanced DashaPeriod interface with hierarchy support
export interface HierarchicalDashaPeriod extends DashaPeriod {
  level: "mahadasha" | "antardasha" | "pratyantardasha" | "sookshma" | "prana"
  children?: HierarchicalDashaPeriod[]
  parent?: HierarchicalDashaPeriod
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
  const nakshatraIndex = NAKSHATRA_LORDS.findIndex(
    (lord, index) => NAKSHATRA_LORDS[index] === NAKSHATRA_LORDS[NAKSHATRA_LORDS.indexOf(moonNakshatra)],
  )

  if (nakshatraIndex === -1) return []

  const nakshatraLord = NAKSHATRA_LORDS[nakshatraIndex]

  // Calculate total duration of nakshatra (in years)
  const totalDuration = VIMSHOTTARI_DASHA_YEARS[nakshatraLord as keyof typeof VIMSHOTTARI_DASHA_YEARS]

  // Calculate elapsed portion based on pada
  const elapsedPortion = (moonPada - 1) / 4

  // Calculate balance of dasha at birth
  const balanceYears = totalDuration * (1 - elapsedPortion)

  // Generate dasha sequence
  const dashaSequence: HierarchicalDashaPeriod[] = []
  let currentLordIndex = DASHA_SEQUENCE.indexOf(nakshatraLord)

  // Start with the balance of the current dasha
  let currentDate = new Date(birthDate)
  const balanceEndDate = new Date(birthDate)
  balanceEndDate.setFullYear(balanceEndDate.getFullYear() + Math.floor(balanceYears))
  balanceEndDate.setMonth(balanceEndDate.getMonth() + Math.floor((balanceYears % 1) * 12))

  // Add days for the fractional part of the month
  const daysInMonth = new Date(balanceEndDate.getFullYear(), balanceEndDate.getMonth() + 1, 0).getDate()
  balanceEndDate.setDate(balanceEndDate.getDate() + Math.floor((((balanceYears % 1) * 12) % 1) * daysInMonth))

  // First Mahadasha (partial)
  const firstMahadasha: HierarchicalDashaPeriod = {
    planet: nakshatraLord,
    from: new Date(currentDate),
    to: new Date(balanceEndDate),
    duration: `${balanceYears.toFixed(2)} years`,
    balanceAtBirth: `${balanceYears.toFixed(2)} years`,
    level: "mahadasha",
    children: [],
  }

  // Calculate Antardashas for the first Mahadasha if levels > 1
  if (levels > 1) {
    firstMahadasha.children = calculateSubPeriods(
      firstMahadasha,
      currentLordIndex,
      balanceYears,
      "antardasha",
      levels - 1,
    )
  }

  dashaSequence.push(firstMahadasha)
  currentDate = new Date(balanceEndDate)

  // Generate the rest of the sequence
  for (let i = 1; i < 9; i++) {
    currentLordIndex = (currentLordIndex + 1) % DASHA_SEQUENCE.length
    const planet = DASHA_SEQUENCE[currentLordIndex]
    const duration = VIMSHOTTARI_DASHA_YEARS[planet as keyof typeof VIMSHOTTARI_DASHA_YEARS]

    const endDate = new Date(currentDate)
    endDate.setFullYear(endDate.getFullYear() + duration)

    const mahadasha: HierarchicalDashaPeriod = {
      planet,
      from: new Date(currentDate),
      to: new Date(endDate),
      duration: `${duration} years`,
      level: "mahadasha",
      children: [],
    }

    // Calculate Antardashas if levels > 1
    if (levels > 1) {
      mahadasha.children = calculateSubPeriods(mahadasha, currentLordIndex, duration, "antardasha", levels - 1)
    }

    dashaSequence.push(mahadasha)
    currentDate = new Date(endDate)
  }

  return dashaSequence
}

/**
 * Calculates sub-periods (Antardasha, Pratyantardasha, etc.) for a given parent period
 * @param parentPeriod The parent dasha period
 * @param startingPlanetIndex The index of the starting planet in the DASHA_SEQUENCE
 * @param parentDuration The duration of the parent period in years
 * @param level The level of the sub-periods
 * @param remainingLevels The number of remaining levels to calculate
 * @returns An array of sub-periods
 */
function calculateSubPeriods(
  parentPeriod: HierarchicalDashaPeriod,
  startingPlanetIndex: number,
  parentDuration: number,
  level: "antardasha" | "pratyantardasha" | "sookshma" | "prana",
  remainingLevels: number,
): HierarchicalDashaPeriod[] {
  const subPeriods: HierarchicalDashaPeriod[] = []
  let currentDate = new Date(parentPeriod.from)
  let planetIndex = startingPlanetIndex

  // Calculate each sub-period
  for (let i = 0; i < DASHA_SEQUENCE.length; i++) {
    const planet = DASHA_SEQUENCE[planetIndex]
    const planetYears = VIMSHOTTARI_DASHA_YEARS[planet as keyof typeof VIMSHOTTARI_DASHA_YEARS]

    // Calculate duration proportion
    const durationYears = (parentDuration / TOTAL_DASHA_YEARS) * planetYears

    // Convert years to milliseconds for precise date calculation
    const durationMs = durationYears * 365.25 * 24 * 60 * 60 * 1000

    const startDate = new Date(currentDate)
    const endDate = new Date(currentDate.getTime() + durationMs)

    const subPeriod: HierarchicalDashaPeriod = {
      planet,
      from: startDate,
      to: endDate,
      duration: formatDuration(durationYears),
      level,
      parent: parentPeriod,
      children: [],
    }

    // Calculate next level of sub-periods if needed
    if (remainingLevels > 1) {
      const nextLevel = getNextLevel(level)
      if (nextLevel) {
        subPeriod.children = calculateSubPeriods(subPeriod, planetIndex, durationYears, nextLevel, remainingLevels - 1)
      }
    }

    subPeriods.push(subPeriod)
    currentDate = new Date(endDate)
    planetIndex = (planetIndex + 1) % DASHA_SEQUENCE.length
  }

  return subPeriods
}

/**
 * Gets the next dasha level
 * @param currentLevel The current dasha level
 * @returns The next dasha level or undefined if at the lowest level
 */
function getNextLevel(
  currentLevel: "antardasha" | "pratyantardasha" | "sookshma" | "prana",
): "pratyantardasha" | "sookshma" | "prana" | undefined {
  switch (currentLevel) {
    case "antardasha":
      return "pratyantardasha"
    case "pratyantardasha":
      return "sookshma"
    case "sookshma":
      return "prana"
    default:
      return undefined
  }
}

/**
 * Formats a duration in years to a human-readable string
 * @param years The duration in years
 * @returns A formatted duration string
 */
function formatDuration(years: number): string {
  if (years >= 1) {
    return `${years.toFixed(2)} years`
  }

  const months = years * 12
  if (months >= 1) {
    return `${months.toFixed(1)} months`
  }

  const days = years * 365.25
  if (days >= 1) {
    return `${Math.round(days)} days`
  }

  const hours = days * 24
  if (hours >= 1) {
    return `${Math.round(hours)} hours`
  }

  const minutes = hours * 60
  return `${Math.round(minutes)} minutes`
}

/**
 * Finds the active dasha periods at a specific date
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

  // Find active Mahadasha
  const activeMahadasha = dashaHierarchy.find((dasha) => date >= dasha.from && date <= dasha.to)

  if (!activeMahadasha) return activePeriods

  activePeriods.push(activeMahadasha)

  // Find active periods at deeper levels
  let currentLevel = activeMahadasha
  let currentLevelNum = 1

  while (currentLevel.children && currentLevel.children.length > 0 && currentLevelNum < maxLevel) {
    const activeSubPeriod = currentLevel.children.find((subDasha) => date >= subDasha.from && date <= subDasha.to)

    if (!activeSubPeriod) break

    activePeriods.push(activeSubPeriod)
    currentLevel = activeSubPeriod
    currentLevelNum++
  }

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
 * Enhanced version of the original calculateVimshottariDasha function
 * that returns hierarchical dasha periods
 */
export function calculateVimshottariDasha(
  moonNakshatra: string,
  moonPada: number,
  birthDate: Date,
  levels = 2,
): HierarchicalDashaPeriod[] {
  return calculateVimshottariDashaHierarchy(moonNakshatra, moonPada, birthDate, levels)
}
