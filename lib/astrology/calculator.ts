import type {
  BirthDetails,
  AstrologyChart,
  PlanetPosition,
  AscendantData,
  DashaPeriod,
  HierarchicalDashaPeriod,
  HouseData,
} from "@/types/astrology"
import { calculateVimshottariDashaHierarchy } from "./dasha-calculator"

// Constants for astrological calculations
const ZODIAC_SIGNS = [
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

const NAKSHATRAS = [
  "Ashwini",
  "Bharani",
  "Krittika",
  "Rohini",
  "Mrigashira",
  "Ardra",
  "Punarvasu",
  "Pushya",
  "Ashlesha",
  "Magha",
  "Purva Phalguni",
  "Uttara Phalguni",
  "Hasta",
  "Chitra",
  "Swati",
  "Vishakha",
  "Anuradha",
  "Jyeshtha",
  "Mula",
  "Purva Ashadha",
  "Uttara Ashadha",
  "Shravana",
  "Dhanishta",
  "Shatabhisha",
  "Purva Bhadrapada",
  "Uttara Bhadrapada",
  "Revati",
]

const NAKSHATRA_LORDS = [
  "Ketu",
  "Venus",
  "Sun",
  "Moon",
  "Mars",
  "Rahu",
  "Jupiter",
  "Saturn",
  "Mercury",
  "Ketu",
  "Venus",
  "Sun",
  "Moon",
  "Mars",
  "Rahu",
  "Jupiter",
  "Saturn",
  "Mercury",
  "Ketu",
  "Venus",
  "Sun",
  "Moon",
  "Mars",
  "Rahu",
  "Jupiter",
  "Saturn",
  "Mercury",
]

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

// Helper functions
export function longitudeToSign(longitude: number): string {
  const signIndex = Math.floor(longitude / 30) % 12
  return ZODIAC_SIGNS[signIndex]
}

export function longitudeToNakshatra(longitude: number): { nakshatra: string; pada: number; lord: string } {
  const totalNakshatraSpan = 13.333333 // 360 degrees / 27 nakshatras
  const nakshatraIndex = Math.floor(longitude / totalNakshatraSpan) % 27
  const padaProgress = (longitude % totalNakshatraSpan) / totalNakshatraSpan
  const pada = Math.floor(padaProgress * 4) + 1

  return {
    nakshatra: NAKSHATRAS[nakshatraIndex],
    pada,
    lord: NAKSHATRA_LORDS[nakshatraIndex],
  }
}

export function parseTimezoneOffset(timezone: string): number {
  const match = timezone.match(/([+-])(\d{2}):(\d{2})/)
  if (!match) return 0

  const [_, sign, hours, minutes] = match
  const totalMinutes = Number.parseInt(hours) * 60 + Number.parseInt(minutes)
  return sign === "+" ? totalMinutes : -totalMinutes
}

export function calculateJulianDay(date: Date): number {
  // Simplified Julian Day calculation
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600

  let y = year
  let m = month

  if (m <= 2) {
    y -= 1
    m += 12
  }

  const a = Math.floor(y / 100)
  const b = 2 - a + Math.floor(a / 4)

  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5 + hour / 24

  return jd
}

export function calculateAyanamsa(date: Date): number {
  // Simplified Lahiri ayanamsa calculation
  // This is a basic approximation - for production use, a more accurate algorithm or ephemeris would be needed
  const year = date.getFullYear()
  const t = (year - 2000) / 100

  // Simplified formula based on Lahiri ayanamsa
  return 23.85 + 0.5 * t
}

export function calculateAscendant(
  julianDay: number,
  latitude: number,
  longitude: number,
  timezoneOffset: number,
): AscendantData {
  // This is a simplified calculation - in production, use a proper astronomical library

  // Calculate Local Sidereal Time (LST)
  const t = (julianDay - 2451545.0) / 36525
  const lst =
    280.46061837 +
    360.98564736629 * (julianDay - 2451545.0) +
    0.000387933 * t * t -
    (t * t * t) / 38710000.0 +
    longitude

  // Simplified ascendant calculation
  const obliquity = 23.439291 - 0.0130042 * t - 0.00000016 * t * t + 0.000000504 * t * t * t
  const ramc = lst

  // Calculate ascendant longitude (simplified)
  let ascLongitude =
    (Math.atan2(
      Math.sin((ramc * Math.PI) / 180),
      Math.cos((ramc * Math.PI) / 180) * Math.cos((obliquity * Math.PI) / 180) -
        Math.tan((latitude * Math.PI) / 180) * Math.sin((obliquity * Math.PI) / 180),
    ) *
      180) /
    Math.PI

  if (ascLongitude < 0) ascLongitude += 360

  // Convert to sidereal (subtract ayanamsa)
  const ayanamsa = calculateAyanamsa(new Date(julianDay * 86400000))
  let siderealAsc = ascLongitude - ayanamsa
  if (siderealAsc < 0) siderealAsc += 360

  // Get nakshatra details
  const { nakshatra, pada } = longitudeToNakshatra(siderealAsc)

  return {
    longitude: siderealAsc,
    sign: longitudeToSign(siderealAsc),
    nakshatra,
    nakshatraPada: pada,
  }
}

export function calculatePlanetaryPositions(julianDay: number, ayanamsa: number): PlanetPosition[] {
  // This is a simplified calculation - in production, use a proper astronomical library or ephemeris
  // Here we're generating approximate positions for demonstration

  // Simplified mean longitudes for planets (very approximate)
  const t = (julianDay - 2451545.0) / 36525

  const meanLongitudes = {
    Sun: (280.46646 + 36000.76983 * t + 0.0003032 * t * t) % 360,
    Moon: (218.3165 + 481267.8813 * t) % 360,
    Mercury: (252.25084 + 149472.67411 * t) % 360,
    Venus: (181.97973 + 58517.81539 * t) % 360,
    Mars: (355.45332 + 19140.30282 * t) % 360,
    Jupiter: (34.35669 + 3034.74612 * t) % 360,
    Saturn: (50.07757 + 1222.11414 * t) % 360,
    Rahu: (125.04452 - 1934.13618 * t) % 360, // Simplified Node calculation
    Ketu: (125.04452 - 1934.13618 * t + 180) % 360, // Ketu is 180° from Rahu
  }

  // Add some "eccentricity" to make it look more realistic
  const eccentricities = {
    Sun: 2 * Math.sin(((meanLongitudes["Sun"] + 278.83354) * Math.PI) / 180),
    Moon: 6 * Math.sin(((meanLongitudes["Moon"] + 275.05) * Math.PI) / 180),
    Mercury: 7 * Math.sin(((meanLongitudes["Mercury"] + 220) * Math.PI) / 180),
    Venus: 3 * Math.sin(((meanLongitudes["Venus"] + 40) * Math.PI) / 180),
    Mars: 9 * Math.sin(((meanLongitudes["Mars"] + 320) * Math.PI) / 180),
    Jupiter: 5 * Math.sin(((meanLongitudes["Jupiter"] + 180) * Math.PI) / 180),
    Saturn: 6 * Math.sin(((meanLongitudes["Saturn"] + 200) * Math.PI) / 180),
    Rahu: 0, // Nodes don't have this kind of eccentricity
    Ketu: 0,
  }

  // Simplified retrograde determination (not accurate)
  const isRetrograde = (planet: string) => {
    if (planet === "Sun" || planet === "Moon" || planet === "Rahu" || planet === "Ketu") return false

    // Simplified retrograde logic - just for demonstration
    const randomFactor = Math.sin((meanLongitudes[planet as keyof typeof meanLongitudes] * Math.PI) / 180)
    return randomFactor < -0.7 // About 20% chance of retrograde
  }

  const planets: PlanetPosition[] = []

  for (const planet of Object.keys(meanLongitudes)) {
    const trueLongitude =
      (meanLongitudes[planet as keyof typeof meanLongitudes] + eccentricities[planet as keyof typeof eccentricities]) %
      360

    // Convert to sidereal longitude
    let siderealLongitude = trueLongitude - ayanamsa
    if (siderealLongitude < 0) siderealLongitude += 360

    const { nakshatra, pada } = longitudeToNakshatra(siderealLongitude)

    planets.push({
      name: planet,
      longitude: siderealLongitude,
      sign: longitudeToSign(siderealLongitude),
      nakshatra,
      nakshatraPada: pada,
      isRetrograde: isRetrograde(planet),
    })
  }

  return planets
}

export function organizeHouses(planets: PlanetPosition[], ascendant: AscendantData): Record<number, HouseData> {
  const houses: Record<number, HouseData> = {}

  // Determine ascendant sign index
  const ascSignIndex = ZODIAC_SIGNS.indexOf(ascendant.sign)

  // Create 12 houses
  for (let i = 0; i < 12; i++) {
    const houseNumber = i + 1
    const signIndex = (ascSignIndex + i) % 12
    const sign = ZODIAC_SIGNS[signIndex]
    const startLongitude = (Math.floor(ascendant.longitude / 30) * 30 + i * 30) % 360

    houses[houseNumber] = {
      number: houseNumber,
      startLongitude,
      sign,
      planets: [],
    }
  }

  // Place planets in houses
  for (const planet of planets) {
    const planetSignIndex = ZODIAC_SIGNS.indexOf(planet.sign)
    const houseNumber = ((12 + planetSignIndex - ascSignIndex) % 12) + 1

    planet.house = houseNumber
    houses[houseNumber].planets.push({ ...planet })
  }

  return houses
}

export function calculateNavamsa(planets: PlanetPosition[], ascendant: AscendantData): Record<number, HouseData> {
  // Convert D-1 positions to D-9 positions
  const navamsaPlanets = planets.map((planet) => {
    const signIndex = ZODIAC_SIGNS.indexOf(planet.sign)
    const degreeInSign = planet.longitude % 30

    // Calculate navamsa position (each navamsa is 3°20')
    const navamsaIndex = Math.floor(degreeInSign / (30 / 9))

    // Calculate the navamsa sign
    let navamsaSignIndex

    if (signIndex % 3 === 0) {
      // Fire signs (Aries, Leo, Sagittarius)
      navamsaSignIndex = navamsaIndex % 12
    } else if (signIndex % 3 === 1) {
      // Earth signs (Taurus, Virgo, Capricorn)
      navamsaSignIndex = (navamsaIndex + 4) % 12
    } else {
      // Air and Water signs
      navamsaSignIndex = (navamsaIndex + 8) % 12
    }

    // Calculate the longitude in the navamsa chart
    const navamsaLongitude = navamsaSignIndex * 30 + (degreeInSign % (30 / 9)) * 9

    return {
      ...planet,
      longitude: navamsaLongitude,
      sign: ZODIAC_SIGNS[navamsaSignIndex],
      nakshatra: longitudeToNakshatra(navamsaLongitude).nakshatra,
      nakshatraPada: longitudeToNakshatra(navamsaLongitude).pada,
    }
  })

  // Calculate navamsa ascendant
  const ascSignIndex = ZODIAC_SIGNS.indexOf(ascendant.sign)
  const degreeInSign = ascendant.longitude % 30
  const navamsaIndex = Math.floor(degreeInSign / (30 / 9))

  let navamsaAscSignIndex
  if (ascSignIndex % 3 === 0) {
    navamsaAscSignIndex = navamsaIndex % 12
  } else if (ascSignIndex % 3 === 1) {
    navamsaAscSignIndex = (navamsaIndex + 4) % 12
  } else {
    navamsaAscSignIndex = (navamsaIndex + 8) % 12
  }

  const navamsaAscLongitude = navamsaAscSignIndex * 30 + (degreeInSign % (30 / 9)) * 9

  const navamsaAscendant: AscendantData = {
    longitude: navamsaAscLongitude,
    sign: ZODIAC_SIGNS[navamsaAscSignIndex],
    nakshatra: longitudeToNakshatra(navamsaAscLongitude).nakshatra,
    nakshatraPada: longitudeToNakshatra(navamsaAscLongitude).pada,
  }

  // Organize houses based on navamsa ascendant
  return organizeHouses(navamsaPlanets, navamsaAscendant)
}

export function calculateDashamsa(planets: PlanetPosition[], ascendant: AscendantData): Record<number, HouseData> {
  // Similar to navamsa but with 10 divisions per sign
  const dashamshaPlanets = planets.map((planet) => {
    const signIndex = ZODIAC_SIGNS.indexOf(planet.sign)
    const degreeInSign = planet.longitude % 30

    // Calculate dashamsha position (each dashamsha is 3°)
    const dashamshaIndex = Math.floor(degreeInSign / 3)

    // Calculate the dashamsha sign
    let dashamshaSignIndex

    if (signIndex % 3 === 0) {
      // Fire signs
      dashamshaSignIndex = (signIndex + dashamshaIndex) % 12
    } else if (signIndex % 3 === 1) {
      // Earth signs
      dashamshaSignIndex = (signIndex + dashamshaIndex + 9) % 12
    } else {
      // Air and Water signs
      dashamshaSignIndex = (signIndex + dashamshaIndex + 6) % 12
    }

    // Calculate the longitude in the dashamsha chart
    const dashamshaLongitude = dashamshaSignIndex * 30 + (degreeInSign % 3) * 10

    return {
      ...planet,
      longitude: dashamshaLongitude,
      sign: ZODIAC_SIGNS[dashamshaSignIndex],
      nakshatra: longitudeToNakshatra(dashamshaLongitude).nakshatra,
      nakshatraPada: longitudeToNakshatra(dashamshaLongitude).pada,
    }
  })

  // Calculate dashamsha ascendant (simplified)
  const ascSignIndex = ZODIAC_SIGNS.indexOf(ascendant.sign)
  const degreeInSign = ascendant.longitude % 30
  const dashamshaIndex = Math.floor(degreeInSign / 3)

  let dashamshaAscSignIndex
  if (ascSignIndex % 3 === 0) {
    dashamshaAscSignIndex = (ascSignIndex + dashamshaIndex) % 12
  } else if (ascSignIndex % 3 === 1) {
    dashamshaAscSignIndex = (ascSignIndex + dashamshaIndex + 9) % 12
  } else {
    dashamshaAscSignIndex = (ascSignIndex + dashamshaIndex + 6) % 12
  }

  const dashamshaAscLongitude = dashamshaAscSignIndex * 30 + (degreeInSign % 3) * 10

  const dashamshaAscendant: AscendantData = {
    longitude: dashamshaAscLongitude,
    sign: ZODIAC_SIGNS[dashamshaAscSignIndex],
    nakshatra: longitudeToNakshatra(dashamshaAscLongitude).nakshatra,
    nakshatraPada: longitudeToNakshatra(dashamshaAscLongitude).pada,
  }

  // Organize houses based on dashamsha ascendant
  return organizeHouses(dashamshaPlanets, dashamshaAscendant)
}

// Original function kept for backward compatibility
export function calculateVimshottariDasha(moonNakshatra: string, moonPada: number, birthDate: Date): DashaPeriod[] {
  const nakshatraIndex = NAKSHATRAS.indexOf(moonNakshatra)
  if (nakshatraIndex === -1) return []

  const nakshatraLord = NAKSHATRA_LORDS[nakshatraIndex]

  // Calculate total duration of nakshatra (in years)
  const totalDuration = VIMSHOTTARI_DASHA_YEARS[nakshatraLord as keyof typeof VIMSHOTTARI_DASHA_YEARS]

  // Calculate elapsed portion based on pada
  const elapsedPortion = (moonPada - 1) / 4

  // Calculate balance of dasha at birth
  const balanceYears = totalDuration * (1 - elapsedPortion)

  // Generate dasha sequence
  const dashaSequence = []
  let currentLordIndex = NAKSHATRA_LORDS.indexOf(nakshatraLord)

  // Start with the balance of the current dasha
  let currentDate = new Date(birthDate)
  const balanceEndDate = new Date(birthDate)
  balanceEndDate.setFullYear(balanceEndDate.getFullYear() + Math.floor(balanceYears))
  balanceEndDate.setMonth(balanceEndDate.getMonth() + Math.floor((balanceYears % 1) * 12))

  dashaSequence.push({
    planet: nakshatraLord,
    from: new Date(currentDate),
    to: new Date(balanceEndDate),
    duration: `${balanceYears.toFixed(2)} years`,
    balanceAtBirth: `${balanceYears.toFixed(2)} years`,
  })

  currentDate = new Date(balanceEndDate)

  // Generate the rest of the sequence
  for (let i = 1; i < 9; i++) {
    currentLordIndex = (currentLordIndex + 1) % NAKSHATRA_LORDS.length
    const planet = NAKSHATRA_LORDS[currentLordIndex]
    const duration = VIMSHOTTARI_DASHA_YEARS[planet as keyof typeof VIMSHOTTARI_DASHA_YEARS]

    const endDate = new Date(currentDate)
    endDate.setFullYear(endDate.getFullYear() + duration)

    dashaSequence.push({
      planet,
      from: new Date(currentDate),
      to: new Date(endDate),
      duration: `${duration} years`,
    })

    currentDate = new Date(endDate)
  }

  return dashaSequence
}

export async function calculateVedicChart(birthDetails: BirthDetails): Promise<AstrologyChart> {
  // Parse birth date and time
  const [year, month, day] = birthDetails.date.split("-").map(Number)
  const [hour, minute] = birthDetails.time.split(":").map(Number)

  // Create Date object with timezone adjustment
  const birthDate = new Date(Date.UTC(year, month - 1, day, hour, minute))
  const timezoneOffset = parseTimezoneOffset(birthDetails.timezone)
  birthDate.setMinutes(birthDate.getMinutes() - timezoneOffset)

  // Calculate Julian Day
  const julianDay = calculateJulianDay(birthDate)

  // Calculate Ayanamsa
  const ayanamsa = calculateAyanamsa(birthDate)

  // Calculate Ascendant
  const ascendant = calculateAscendant(julianDay, birthDetails.latitude, birthDetails.longitude, timezoneOffset)

  // Calculate Planetary Positions
  const planets = calculatePlanetaryPositions(julianDay, ayanamsa)

  // Organize planets into houses
  const rashiChart = organizeHouses(planets, ascendant)

  // Calculate Navamsa Chart
  const navamsaChart = calculateNavamsa(planets, ascendant)

  // Calculate Dashamsa Chart
  const dashamsa = calculateDashamsa(planets, ascendant)

  // Find Moon's nakshatra and pada for dasha calculation
  const moon = planets.find((p) => p.name === "Moon")
  let dashas: DashaPeriod[] = []
  let hierarchicalDashas: HierarchicalDashaPeriod[] = []

  if (moon) {
    // Calculate traditional dashas for backward compatibility
    dashas = calculateVimshottariDasha(moon.nakshatra, moon.nakshatraPada, birthDate)

    // Calculate enhanced hierarchical dashas with 3 levels (Mahadasha, Antardasha, Pratyantardasha)
    hierarchicalDashas = calculateVimshottariDashaHierarchy(moon.nakshatra, moon.nakshatraPada, birthDate, 3)
  }

  // Return the complete chart data
  return {
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
    navamsaChart,
    dashamsa,
    dashas,
    hierarchicalDashas,
    ayanamsa,
  }
}
