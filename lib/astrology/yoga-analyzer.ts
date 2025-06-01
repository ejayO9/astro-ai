import type { AstrologyChart, PlanetPosition } from "@/types/astrology"
import { logInfo, logDebug, logError } from "@/lib/logging-service"

// Yoga result interface
export interface YogaResult {
  name: string
  category: string
  definition: string
  results: string
  notes?: string
  isApplicable: boolean
  strength: "Strong" | "Moderate" | "Weak"
  planets: string[]
  houses: number[]
}

// Helper functions
function getPlanetPosition(chart: AstrologyChart, planetName: string): PlanetPosition | null {
  return chart.planets.find(p => p.name === planetName) || null
}

function getPlanetsInHouse(chart: AstrologyChart, houseNumber: number): PlanetPosition[] {
  const house = chart.rashiChart[houseNumber]
  return house ? house.planets : []
}

function isPlanetInHouse(chart: AstrologyChart, planetName: string, houseNumber: number): boolean {
  const planet = getPlanetPosition(chart, planetName)
  return planet ? planet.house === houseNumber : false
}

function isPlanetInSign(chart: AstrologyChart, planetName: string, signName: string): boolean {
  const planet = getPlanetPosition(chart, planetName)
  return planet ? planet.sign === signName : false
}

function getHouseFromPlanet(chart: AstrologyChart, planetName: string, offset: number): number {
  const planet = getPlanetPosition(chart, planetName)
  if (!planet || !planet.house) return 0
  let targetHouse = (planet.house + offset - 1) % 12 + 1
  if (targetHouse <= 0) targetHouse += 12
  return targetHouse
}

function isQuadrant(houseNumber: number): boolean {
  return [1, 4, 7, 10].includes(houseNumber)
}

function isTrine(houseNumber: number): boolean {
  return [1, 5, 9].includes(houseNumber)
}

function isUpachaya(houseNumber: number): boolean {
  return [3, 6, 10, 11].includes(houseNumber)
}

function isDusthana(houseNumber: number): boolean {
  return [6, 8, 12].includes(houseNumber)
}

function isPanapara(houseNumber: number): boolean {
  return [2, 5, 8, 11].includes(houseNumber)
}

function isApoklima(houseNumber: number): boolean {
  return [3, 6, 9, 12].includes(houseNumber)
}

function isMovableSign(signName: string): boolean {
  return ["Aries", "Cancer", "Libra", "Capricorn"].includes(signName)
}

function isFixedSign(signName: string): boolean {
  return ["Taurus", "Leo", "Scorpio", "Aquarius"].includes(signName)
}

function isDualSign(signName: string): boolean {
  return ["Gemini", "Virgo", "Sagittarius", "Pisces"].includes(signName)
}

function isBenefic(planetName: string): boolean {
  return ["Jupiter", "Venus", "Mercury", "Moon"].includes(planetName)
}

function isMalefic(planetName: string): boolean {
  return ["Sun", "Mars", "Saturn", "Rahu", "Ketu"].includes(planetName)
}

function isPlanetExalted(planetName: string, signName: string): boolean {
  const exaltationSigns: Record<string, string> = {
    "Sun": "Aries",
    "Moon": "Taurus", 
    "Mars": "Capricorn",
    "Mercury": "Virgo",
    "Jupiter": "Cancer",
    "Venus": "Pisces",
    "Saturn": "Libra"
  }
  return exaltationSigns[planetName] === signName
}

function isPlanetOwnSign(planetName: string, signName: string): boolean {
  const ownSigns: Record<string, string[]> = {
    "Sun": ["Leo"],
    "Moon": ["Cancer"],
    "Mars": ["Aries", "Scorpio"],
    "Mercury": ["Gemini", "Virgo"],
    "Jupiter": ["Sagittarius", "Pisces"],
    "Venus": ["Taurus", "Libra"],
    "Saturn": ["Capricorn", "Aquarius"]
  }
  return ownSigns[planetName]?.includes(signName) || false
}

function isPlanetDebilitated(planetName: string, signName: string): boolean {
  const debilitationSigns: Record<string, string> = {
    "Sun": "Libra",
    "Moon": "Scorpio",
    "Mars": "Cancer", 
    "Mercury": "Pisces",
    "Jupiter": "Capricorn",
    "Venus": "Virgo",
    "Saturn": "Aries"
  }
  return debilitationSigns[planetName] === signName
}

// Ravi Yogas (Solar Combinations)
function checkRaviYogas(chart: AstrologyChart): YogaResult[] {
  const results: YogaResult[] = []
  const sun = getPlanetPosition(chart, "Sun")
  if (!sun || !sun.house) return results

  // Vesi Yoga - Planet other than Moon in 2nd house from Sun
  const houseFromSun2nd = getHouseFromPlanet(chart, "Sun", 2)
  const planetsIn2ndFromSun = getPlanetsInHouse(chart, houseFromSun2nd).filter(p => p.name !== "Moon")
  if (planetsIn2ndFromSun.length > 0) {
    results.push({
      name: "Vesi Yoga",
      category: "Ravi Yogas (Solar Combinations)",
      definition: "Planet other than Moon in the 2nd house from Sun.",
      results: "Balanced outlook, truthful, tall, sluggish, happy with little wealth.",
      notes: "Common in rasi chart, less in divisional charts like D-9, D-10.",
      isApplicable: true,
      strength: "Moderate",
      planets: ["Sun", ...planetsIn2ndFromSun.map(p => p.name)],
      houses: [sun.house, houseFromSun2nd]
    })
  }

  // Vosi Yoga - Planet other than Moon in 12th house from Sun
  const houseFromSun12th = getHouseFromPlanet(chart, "Sun", 12)
  const planetsIn12thFromSun = getPlanetsInHouse(chart, houseFromSun12th).filter(p => p.name !== "Moon")
  if (planetsIn12thFromSun.length > 0) {
    results.push({
      name: "Vosi Yoga",
      category: "Ravi Yogas (Solar Combinations)",
      definition: "Planet other than Moon in the 12th house from Sun.",
      results: "Skillful, charitable, famous, learned, strong.",
      notes: "Common in rasi chart, less in divisional charts.",
      isApplicable: true,
      strength: "Moderate",
      planets: ["Sun", ...planetsIn12thFromSun.map(p => p.name)],
      houses: [sun.house, houseFromSun12th]
    })
  }

  // Ubhayachara Yoga - Planets other than Moon in both 2nd and 12th houses from Sun
  if (planetsIn2ndFromSun.length > 0 && planetsIn12thFromSun.length > 0) {
    results.push({
      name: "Ubhayachara Yoga",
      category: "Ravi Yogas (Solar Combinations)",
      definition: "Planets other than Moon in both 2nd and 12th houses from Sun.",
      results: "All comforts, king or equal status.",
      notes: "Common in rasi chart, less in divisional charts.",
      isApplicable: true,
      strength: "Strong",
      planets: ["Sun", ...planetsIn2ndFromSun.map(p => p.name), ...planetsIn12thFromSun.map(p => p.name)],
      houses: [sun.house, houseFromSun2nd, houseFromSun12th]
    })
  }

  // Budha-Aaditya Yoga (Nipuna Yoga) - Sun and Mercury together
  const mercury = getPlanetPosition(chart, "Mercury")
  if (mercury && sun.house === mercury.house) {
    results.push({
      name: "Budha-Aaditya Yoga (Nipuna Yoga)",
      category: "Ravi Yogas (Solar Combinations)",
      definition: "Sun and Mercury together in one sign.",
      results: "Intelligent, skillful, well-known, respected, happy.",
      notes: "Most powerful in D-10 if Mercury is not combust; loses power if Mercury is combust.",
      isApplicable: true,
      strength: "Strong",
      planets: ["Sun", "Mercury"],
      houses: [sun.house]
    })
  }

  return results
}

// Chandra Yogas (Lunar Combinations)
function checkChandraYogas(chart: AstrologyChart): YogaResult[] {
  const results: YogaResult[] = []
  const moon = getPlanetPosition(chart, "Moon")
  if (!moon || !moon.house) return results

  // Sunaphaa Yoga - Planets other than Sun in 2nd house from Moon
  const houseFromMoon2nd = getHouseFromPlanet(chart, "Moon", 2)
  const planetsIn2ndFromMoon = getPlanetsInHouse(chart, houseFromMoon2nd).filter(p => p.name !== "Sun")
  if (planetsIn2ndFromMoon.length > 0) {
    results.push({
      name: "Sunaphaa Yoga",
      category: "Chandra Yogas (Lunar Combinations)",
      definition: "Planets other than Sun in the 2nd house from Moon.",
      results: "King or equal, intelligent, wealthy, famous, self-earned wealth.",
      isApplicable: true,
      strength: "Strong",
      planets: ["Moon", ...planetsIn2ndFromMoon.map(p => p.name)],
      houses: [moon.house, houseFromMoon2nd]
    })
  }

  // Anaphaa Yoga - Planets other than Sun in 12th house from Moon
  const houseFromMoon12th = getHouseFromPlanet(chart, "Moon", 12)
  const planetsIn12thFromMoon = getPlanetsInHouse(chart, houseFromMoon12th).filter(p => p.name !== "Sun")
  if (planetsIn12thFromMoon.length > 0) {
    results.push({
      name: "Anaphaa Yoga",
      category: "Chandra Yogas (Lunar Combinations)",
      definition: "Planets other than Sun in the 12th house from Moon.",
      results: "King with good looks, disease-free body, great character, surrounded by comforts.",
      isApplicable: true,
      strength: "Strong",
      planets: ["Moon", ...planetsIn12thFromMoon.map(p => p.name)],
      houses: [moon.house, houseFromMoon12th]
    })
  }

  // Duradhara Yoga - Planets other than Sun in both 2nd and 12th houses from Moon
  if (planetsIn2ndFromMoon.length > 0 && planetsIn12thFromMoon.length > 0) {
    results.push({
      name: "Duradhara Yoga",
      category: "Chandra Yogas (Lunar Combinations)",
      definition: "Planets other than Sun in both 2nd and 12th houses from Moon.",
      results: "Enjoys pleasures, charitable, owns wealth and vehicles, has good servants.",
      isApplicable: true,
      strength: "Strong",
      planets: ["Moon", ...planetsIn2ndFromMoon.map(p => p.name), ...planetsIn12thFromMoon.map(p => p.name)],
      houses: [moon.house, houseFromMoon2nd, houseFromMoon12th]
    })
  }

  // Kemadruma Yoga - No planets other than Sun in 1st, 2nd, 12th from Moon, and no planets other than Moon in quadrants from lagna
  const houseFromMoon1st = moon.house
  const planetsIn1stFromMoon = getPlanetsInHouse(chart, houseFromMoon1st).filter(p => p.name !== "Sun")
  const planetsInQuadrantsFromLagna = [1, 4, 7, 10].flatMap(h => 
    getPlanetsInHouse(chart, h).filter(p => p.name !== "Moon")
  )
  
  if (planetsIn1stFromMoon.length === 1 && // Only Moon itself
      planetsIn2ndFromMoon.length === 0 && 
      planetsIn12thFromMoon.length === 0 && 
      planetsInQuadrantsFromLagna.length === 0) {
    results.push({
      name: "Kemadruma Yoga",
      category: "Chandra Yogas (Lunar Combinations)",
      definition: "No planets other than Sun in 1st, 2nd, 12th from Moon, and no planets other than Moon in quadrants from lagna.",
      results: "Unlucky, bereft of intelligence, afflicted by poverty, trouble; kills other Chandra yogas.",
      notes: "Negative yoga; requires hard work for success.",
      isApplicable: true,
      strength: "Strong",
      planets: ["Moon"],
      houses: [moon.house]
    })
  }

  // Chandra-Mangala Yoga - Moon and Mars together
  const mars = getPlanetPosition(chart, "Mars")
  if (mars && moon.house === mars.house) {
    results.push({
      name: "Chandra-Mangala Yoga",
      category: "Chandra Yogas (Lunar Combinations)",
      definition: "Moon and Mars together in one sign.",
      results: "Worldly wise, materially successful, may earn through unscrupulous means, may mistreat women.",
      isApplicable: true,
      strength: "Strong",
      planets: ["Moon", "Mars"],
      houses: [moon.house]
    })
  }

  // Adhi Yoga - Natural benefics in 6th, 7th, 8th from Moon
  const beneficsIn6th = getPlanetsInHouse(chart, getHouseFromPlanet(chart, "Moon", 6)).filter(p => isBenefic(p.name))
  const beneficsIn7th = getPlanetsInHouse(chart, getHouseFromPlanet(chart, "Moon", 7)).filter(p => isBenefic(p.name))
  const beneficsIn8th = getPlanetsInHouse(chart, getHouseFromPlanet(chart, "Moon", 8)).filter(p => isBenefic(p.name))
  
  if (beneficsIn6th.length > 0 && beneficsIn7th.length > 0 && beneficsIn8th.length > 0) {
    results.push({
      name: "Adhi Yoga",
      category: "Chandra Yogas (Lunar Combinations)",
      definition: "Natural benefics in 6th, 7th, 8th from Moon.",
      results: "King, minister, or army chief, depending on planet strength.",
      isApplicable: true,
      strength: "Strong",
      planets: ["Moon", ...beneficsIn6th.map(p => p.name), ...beneficsIn7th.map(p => p.name), ...beneficsIn8th.map(p => p.name)],
      houses: [moon.house, getHouseFromPlanet(chart, "Moon", 6), getHouseFromPlanet(chart, "Moon", 7), getHouseFromPlanet(chart, "Moon", 8)]
    })
  }

  return results
}

// Pancha Mahapurusha Yogas
function checkPanchaMahapurushaYogas(chart: AstrologyChart): YogaResult[] {
  const results: YogaResult[] = []

  // Ruchaka Yoga - Mars in quadrant in own or exaltation sign
  const mars = getPlanetPosition(chart, "Mars")
  if (mars && mars.house && isQuadrant(mars.house) && 
      (isPlanetOwnSign("Mars", mars.sign) || isPlanetExalted("Mars", mars.sign))) {
    results.push({
      name: "Ruchaka Yoga",
      category: "Pancha Mahapurusha Yogas",
      definition: "Mars in quadrant in own (Ar, Sc) or exaltation (Cp) sign from lagna.",
      results: "Fiery nature, enthusiastic, natural leader, victorious, learned in occult sciences, good taste.",
      notes: "Applies mainly in rasi chart, not from Moon.",
      isApplicable: true,
      strength: "Strong",
      planets: ["Mars"],
      houses: [mars.house]
    })
  }

  // Bhadra Yoga - Mercury in quadrant in own or exaltation sign
  const mercury = getPlanetPosition(chart, "Mercury")
  if (mercury && mercury.house && isQuadrant(mercury.house) && 
      (isPlanetOwnSign("Mercury", mercury.sign) || isPlanetExalted("Mercury", mercury.sign))) {
    results.push({
      name: "Bhadra Yoga",
      category: "Pancha Mahapurusha Yogas",
      definition: "Mercury in quadrant in own (Ge, Vi) or exaltation (Vi) sign from lagna.",
      results: "Earthy nature, lion-like, learned, good build, deep voice, sattwa guna, systematic, religious.",
      notes: "Applies mainly in rasi chart, not from Moon.",
      isApplicable: true,
      strength: "Strong",
      planets: ["Mercury"],
      houses: [mercury.house]
    })
  }

  // Sasa Yoga - Saturn in quadrant in own or exaltation sign
  const saturn = getPlanetPosition(chart, "Saturn")
  if (saturn && saturn.house && isQuadrant(saturn.house) && 
      (isPlanetOwnSign("Saturn", saturn.sign) || isPlanetExalted("Saturn", saturn.sign))) {
    results.push({
      name: "Sasa Yoga",
      category: "Pancha Mahapurusha Yogas",
      definition: "Saturn in quadrant in own (Cp, Aq) or exaltation (Li) sign from lagna.",
      results: "Airy nature, wise, enjoys wandering, valorous, slender build, charitable.",
      notes: "Applies mainly in rasi chart, not from Moon.",
      isApplicable: true,
      strength: "Strong",
      planets: ["Saturn"],
      houses: [saturn.house]
    })
  }

  // Maalavya Yoga - Venus in quadrant in own or exaltation sign
  const venus = getPlanetPosition(chart, "Venus")
  if (venus && venus.house && isQuadrant(venus.house) && 
      (isPlanetOwnSign("Venus", venus.sign) || isPlanetExalted("Venus", venus.sign))) {
    results.push({
      name: "Maalavya Yoga",
      category: "Pancha Mahapurusha Yogas",
      definition: "Venus in quadrant in own (Ta, Li) or exaltation (Pi) sign from lagna.",
      results: "Watery nature, lustrous, enjoys tasty food, luxuries, excellent health, versed in arts.",
      notes: "Applies mainly in rasi chart, not from Moon.",
      isApplicable: true,
      strength: "Strong",
      planets: ["Venus"],
      houses: [venus.house]
    })
  }

  // Hamsa Yoga - Jupiter in quadrant in own or exaltation sign
  const jupiter = getPlanetPosition(chart, "Jupiter")
  if (jupiter && jupiter.house && isQuadrant(jupiter.house) && 
      (isPlanetOwnSign("Jupiter", jupiter.sign) || isPlanetExalted("Jupiter", jupiter.sign))) {
    results.push({
      name: "Hamsa Yoga",
      category: "Pancha Mahapurusha Yogas",
      definition: "Jupiter in quadrant in own (Sg, Pi) or exaltation (Cn) sign from lagna.",
      results: "Ethery nature, swan-like, spiritual strength, respected, passionate, kingly, good conversationalist.",
      notes: "Applies mainly in rasi chart, not from Moon.",
      isApplicable: true,
      strength: "Strong",
      planets: ["Jupiter"],
      houses: [jupiter.house]
    })
  }

  return results
}

// Gaja-Kesari Yoga
function checkGajaKesariYoga(chart: AstrologyChart): YogaResult[] {
  const results: YogaResult[] = []
  const jupiter = getPlanetPosition(chart, "Jupiter")
  const moon = getPlanetPosition(chart, "Moon")
  
  if (!jupiter || !moon || !jupiter.house || !moon.house) return results

  // Check if Jupiter is in quadrant from Moon
  const moonHouse = moon.house
  const quadrantsFromMoon = [
    moonHouse,
    (moonHouse + 2) % 12 + 1,
    (moonHouse + 5) % 12 + 1, 
    (moonHouse + 8) % 12 + 1
  ].map(h => h > 12 ? h - 12 : h)

  if (quadrantsFromMoon.includes(jupiter.house) && 
      !isPlanetDebilitated("Jupiter", jupiter.sign)) {
    results.push({
      name: "Gaja-Kesari Yoga",
      category: "Other Popular Yogas",
      definition: "Jupiter in quadrant from Moon, with benefic conjunction/aspect, not debilitated/combust/in enemy's house.",
      results: "Famous, wealthy, intelligent, great character, liked by kings.",
      notes: "Can apply from lagna if strong; key for fame.",
      isApplicable: true,
      strength: "Strong",
      planets: ["Jupiter", "Moon"],
      houses: [jupiter.house, moon.house]
    })
  }

  return results
}

// Raja Yogas
function checkBasicRajaYogas(chart: AstrologyChart): YogaResult[] {
  const results: YogaResult[] = []
  
  // Basic Raja Yoga - Lord of quadrant associated with lord of trine
  const quadrantHouses = [1, 4, 7, 10]
  const trineHouses = [1, 5, 9]
  
  // Check for conjunctions between quadrant and trine lords
  for (const qHouse of quadrantHouses) {
    for (const tHouse of trineHouses) {
      if (qHouse === tHouse) continue // Skip same house (lagna)
      
      const qLordSign = chart.rashiChart[qHouse]?.sign
      const tLordSign = chart.rashiChart[tHouse]?.sign
      
      if (qLordSign && tLordSign) {
        // Check if lords are in same house (conjunction)
        const qLordPlanet = getSignLord(qLordSign)
        const tLordPlanet = getSignLord(tLordSign)
        
        const qLordPos = getPlanetPosition(chart, qLordPlanet)
        const tLordPos = getPlanetPosition(chart, tLordPlanet)
        
        if (qLordPos && tLordPos && qLordPos.house === tLordPos.house) {
          results.push({
            name: "Basic Raja Yoga",
            category: "Raja Yogas",
            definition: "Lord of quadrant associated with lord of trine (conjunction, aspect, or exchange).",
            results: "Powerful, prosperous.",
            notes: "Lagna counts as both quadrant and trine; strength of planets determines magnitude.",
            isApplicable: true,
            strength: "Strong",
            planets: [qLordPlanet, tLordPlanet],
            houses: [qLordPos.house]
          })
        }
      }
    }
  }

  return results
}

function getSignLord(sign: string): string {
  const signLords: Record<string, string> = {
    "Aries": "Mars",
    "Taurus": "Venus", 
    "Gemini": "Mercury",
    "Cancer": "Moon",
    "Leo": "Sun",
    "Virgo": "Mercury",
    "Libra": "Venus",
    "Scorpio": "Mars",
    "Sagittarius": "Jupiter",
    "Capricorn": "Saturn",
    "Aquarius": "Saturn",
    "Pisces": "Jupiter"
  }
  return signLords[sign] || ""
}

// Dhana Yogas by Lagna
function checkDhanaYogas(chart: AstrologyChart): YogaResult[] {
  const results: YogaResult[] = []
  const lagnaSign = chart.ascendant.sign
  
  // This is a simplified version - full implementation would check all conditions
  // For example, Aries lagna dhana yoga conditions
  if (lagnaSign === "Aries") {
    const sun = getPlanetPosition(chart, "Sun")
    if (sun && sun.house && sun.house === 5) {
      results.push({
        name: "Dhana Yoga (Aries Lagna)",
        category: "Dhana Yogas",
        definition: "Sun in 5th, Saturn/Moon/Jupiter in 11th; or Mars in lagna conjoined/aspected by Mercury/Venus/Saturn.",
        results: "Very affluent.",
        notes: "Strength of planets determines magnitude.",
        isApplicable: true,
        strength: "Strong",
        planets: ["Sun"],
        houses: [sun.house as number]
      })
    }
  }

  return results
}

// Naabhasa Yogas
function checkNaabhasaYogas(chart: AstrologyChart): YogaResult[] {
  const results: YogaResult[] = []
  
  // Get all planet signs
  const planetSigns = chart.planets.map(p => p.sign).filter(Boolean)
  
  // Rajju Yoga - All planets in movable signs
  const movableSigns = planetSigns.filter(sign => isMovableSign(sign))
  if (movableSigns.length === planetSigns.length && planetSigns.length >= 7) {
    results.push({
      name: "Rajju Yoga",
      category: "Naabhasa Yogas",
      definition: "All planets in movable signs.",
      results: "Likes travel, good looks, flourishes abroad, cruel.",
      notes: "Results felt in all dasas.",
      isApplicable: true,
      strength: "Strong",
      planets: chart.planets.map(p => p.name),
      houses: chart.planets.map(p => p.house || 0).filter(h => h > 0)
    })
  }

  // Musala Yoga - All planets in fixed signs
  const fixedSigns = planetSigns.filter(sign => isFixedSign(sign))
  if (fixedSigns.length === planetSigns.length && planetSigns.length >= 7) {
    results.push({
      name: "Musala Yoga",
      category: "Naabhasa Yogas",
      definition: "All planets in fixed signs.",
      results: "Honor, wisdom, wealth, liked by kings, famous, many children, firm spirit.",
      notes: "Results felt in all dasas.",
      isApplicable: true,
      strength: "Strong",
      planets: chart.planets.map(p => p.name),
      houses: chart.planets.map(p => p.house || 0).filter(h => h > 0)
    })
  }

  // Nala Yoga - All planets in dual signs
  const dualSigns = planetSigns.filter(sign => isDualSign(sign))
  if (dualSigns.length === planetSigns.length && planetSigns.length >= 7) {
    results.push({
      name: "Nala Yoga",
      category: "Naabhasa Yogas",
      definition: "All planets in dual signs.",
      results: "Poor physique, accumulates money, good looks, skillful, helps relatives.",
      notes: "Results felt in all dasas.",
      isApplicable: true,
      strength: "Strong",
      planets: chart.planets.map(p => p.name),
      houses: chart.planets.map(p => p.house || 0).filter(h => h > 0)
    })
  }

  // Kamala Yoga - All planets in quadrants
  const planetsInQuadrants = chart.planets.filter(p => p.house && isQuadrant(p.house))
  if (planetsInQuadrants.length === chart.planets.length && chart.planets.length >= 7) {
    results.push({
      name: "Kamala Yoga",
      category: "Naabhasa Yogas",
      definition: "All planets in quadrants from lagna.",
      results: "King, strong character, famous, long-lived, pure, performs good deeds.",
      notes: "Rahu and Ketu often excluded.",
      isApplicable: true,
      strength: "Strong",
      planets: chart.planets.map(p => p.name),
      houses: [1, 4, 7, 10]
    })
  }

  return results
}

// More Popular Yogas
function checkPopularYogas(chart: AstrologyChart): YogaResult[] {
  const results: YogaResult[] = []

  // Guru-Mangala Yoga - Jupiter and Mars together or in 7th from each other
  const jupiter = getPlanetPosition(chart, "Jupiter")
  const mars = getPlanetPosition(chart, "Mars")
  
  if (jupiter && mars && jupiter.house && mars.house) {
    const areConjunct = jupiter.house === mars.house
    const areOpposite = Math.abs(jupiter.house - mars.house) === 6 || 
                       Math.abs(jupiter.house - mars.house) === 6
    
    if (areConjunct || areOpposite) {
      results.push({
        name: "Guru-Mangala Yoga",
        category: "Other Popular Yogas",
        definition: "Jupiter and Mars together or in 7th from each other.",
        results: "Righteous, energetic, energies in dharmic paths.",
        isApplicable: true,
        strength: "Strong",
        planets: ["Jupiter", "Mars"],
        houses: [jupiter.house, mars.house]
      })
    }
  }

  // Amala Yoga - Only natural benefics in 10th from lagna or Moon
  const beneficsIn10thFromLagna = getPlanetsInHouse(chart, 10).filter(p => isBenefic(p.name))
  const maleficsIn10thFromLagna = getPlanetsInHouse(chart, 10).filter(p => isMalefic(p.name))
  
  if (beneficsIn10thFromLagna.length > 0 && maleficsIn10thFromLagna.length === 0) {
    results.push({
      name: "Amala Yoga",
      category: "Other Popular Yogas",
      definition: "Only natural benefics in 10th from lagna or Moon.",
      results: "Ever-lasting fame, respected by kings, luxuries, virtuous, helps others.",
      isApplicable: true,
      strength: "Strong",
      planets: beneficsIn10thFromLagna.map(p => p.name),
      houses: [10]
    })
  }

  // Vasumati Yoga - Benefics in upachayas
  const beneficsInUpachayas = [3, 6, 10, 11].flatMap(h => 
    getPlanetsInHouse(chart, h).filter(p => isBenefic(p.name))
  )
  const maleficsInUpachayas = [3, 6, 10, 11].flatMap(h => 
    getPlanetsInHouse(chart, h).filter(p => isMalefic(p.name))
  )

  if (beneficsInUpachayas.length > 0 && maleficsInUpachayas.length === 0) {
    results.push({
      name: "Vasumati Yoga",
      category: "Other Popular Yogas",
      definition: "Benefics in upachayas (3rd, 6th, 10th, 11th), no malefics in upachayas, benefics strong.",
      results: "Abundant wealth.",
      isApplicable: true,
      strength: "Strong",
      planets: beneficsInUpachayas.map(p => p.name),
      houses: [3, 6, 10, 11]
    })
  }

  return results
}

// Viparita Raja Yogas
function checkVipariataRajaYogas(chart: AstrologyChart): YogaResult[] {
  const results: YogaResult[] = []

  // Basic Viparita Raja Yoga - 6th, 8th, 12th lords in dusthanas
  for (const dusthanaHouse of [6, 8, 12]) {
    const houseSign = chart.rashiChart[dusthanaHouse]?.sign
    if (houseSign) {
      const houseLord = getSignLord(houseSign)
      const lordPosition = getPlanetPosition(chart, houseLord)
      
      if (lordPosition && lordPosition.house && isDusthana(lordPosition.house)) {
        results.push({
          name: "Viparita Raja Yoga",
          category: "Raja Yogas",
          definition: "6th, 8th, 12th lords in dusthanas (6th, 8th, 12th) or 3rd/11th, no other planets conjoining.",
          results: "Tremendous success after initial struggle.",
          notes: "Obstacles face obstacles, leading to success.",
          isApplicable: true,
          strength: "Strong",
          planets: [houseLord],
          houses: [dusthanaHouse, lordPosition.house]
        })
      }
    }
  }

  return results
}

// Dhana Yogas by Lagna (Expanded)
function checkExpandedDhanaYogas(chart: AstrologyChart): YogaResult[] {
  const results: YogaResult[] = []
  const lagnaSign = chart.ascendant.sign

  // Check specific dhana yogas based on lagna sign
  const dhanaYogaConditions: Record<string, () => boolean> = {
    "Aries": () => {
      const sun = getPlanetPosition(chart, "Sun")
      const saturn = getPlanetPosition(chart, "Saturn")
      const moon = getPlanetPosition(chart, "Moon")
      const jupiter = getPlanetPosition(chart, "Jupiter")
      
      return (sun?.house === 5) && 
             (saturn?.house === 11 || moon?.house === 11 || jupiter?.house === 11)
    },
    "Taurus": () => {
      const mercury = getPlanetPosition(chart, "Mercury")
      return mercury?.house === 5
    },
    "Gemini": () => {
      const venus = getPlanetPosition(chart, "Venus")
      const mars = getPlanetPosition(chart, "Mars")
      return venus?.house === 5 && mars?.house === 11
    },
    "Cancer": () => {
      const mars = getPlanetPosition(chart, "Mars")
      const venus = getPlanetPosition(chart, "Venus")
      return mars?.house === 5 && venus?.house === 11
    },
    "Leo": () => {
      const jupiter = getPlanetPosition(chart, "Jupiter")
      const mercury = getPlanetPosition(chart, "Mercury")
      return jupiter?.house === 5 && mercury?.house === 11
    }
  }

  const condition = dhanaYogaConditions[lagnaSign]
  if (condition && condition()) {
    results.push({
      name: `Dhana Yoga (${lagnaSign} Lagna)`,
      category: "Dhana Yogas",
      definition: `Specific planetary combinations for ${lagnaSign} lagna that create wealth.`,
      results: "Very affluent.",
      notes: "Strength of planets determines magnitude.",
      isApplicable: true,
      strength: "Strong",
      planets: [],
      houses: [5, 11]
    })
  }

  return results
}

// Main yoga analysis function
export function analyzeYogas(chart: AstrologyChart): YogaResult[] {
  logInfo("yoga-analyzer", "Starting comprehensive yoga analysis")
  
  const allYogas: YogaResult[] = []
  
  try {
    // Analyze different categories of yogas
    allYogas.push(...checkRaviYogas(chart))
    allYogas.push(...checkChandraYogas(chart))
    allYogas.push(...checkPanchaMahapurushaYogas(chart))
    allYogas.push(...checkGajaKesariYoga(chart))
    allYogas.push(...checkBasicRajaYogas(chart))
    allYogas.push(...checkNaabhasaYogas(chart))
    allYogas.push(...checkPopularYogas(chart))
    allYogas.push(...checkVipariataRajaYogas(chart))
    allYogas.push(...checkExpandedDhanaYogas(chart))
    
    logInfo("yoga-analyzer", "Yoga analysis completed", {
      totalYogasFound: allYogas.filter(y => y.isApplicable).length,
      totalChecked: allYogas.length
    })
    
  } catch (error) {
    logError("yoga-analyzer", "Error in yoga analysis", error)
  }
  
  return allYogas.filter(yoga => yoga.isApplicable)
}

// Summary function
export function generateYogaSummary(yogas: YogaResult[]): string {
  const categories = [...new Set(yogas.map(y => y.category))]
  const strongYogas = yogas.filter(y => y.strength === "Strong")
  
  let summary = `Yoga Analysis Summary:\n\n`
  summary += `Total Applicable Yogas: ${yogas.length}\n`
  summary += `Categories Found: ${categories.join(", ")}\n\n`
  
  if (strongYogas.length > 0) {
    summary += `Strong Yogas: ${strongYogas.map(y => y.name).join(", ")}\n\n`
  }
  
  summary += `Each yoga represents specific planetary combinations that influence different aspects of life. The presence of these yogas indicates favorable or challenging periods and characteristics.`
  
  return summary
} 