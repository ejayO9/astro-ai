import type { AstrologyChart, PlanetPosition } from "@/types/astrology"
import { logInfo, logDebug, logError } from "@/lib/logging-service"

// Planet significations and characteristics
export const PLANET_CHARACTERISTICS = {
  Sun: {
    nature: "Malefic",
    element: "Fire",
    gender: "Male",
    caste: "Kshatriya",
    significations: ["Soul", "Father", "Authority", "Government", "Vitality", "Leadership", "Ego", "Self-confidence"],
    friends: ["Moon", "Mars", "Jupiter"],
    enemies: ["Venus", "Saturn"],
    neutral: ["Mercury"],
    exaltationSign: "Aries",
    debilitationSign: "Libra",
    ownSigns: ["Leo"],
    moolTrikonaSign: "Leo",
    directionalStrength: 10, // 10th house
  },
  Moon: {
    nature: "Benefic",
    element: "Water",
    gender: "Female",
    caste: "Vaishya",
    significations: ["Mind", "Mother", "Emotions", "Public", "Water", "Comfort", "Nurturing", "Intuition"],
    friends: ["Sun", "Mercury"],
    enemies: [],
    neutral: ["Mars", "Jupiter", "Venus", "Saturn"],
    exaltationSign: "Taurus",
    debilitationSign: "Scorpio",
    ownSigns: ["Cancer"],
    moolTrikonaSign: "Taurus",
    directionalStrength: 4, // 4th house
  },
  Mars: {
    nature: "Malefic",
    element: "Fire",
    gender: "Male",
    caste: "Kshatriya",
    significations: ["Energy", "Courage", "Brothers", "Land", "Property", "Accidents", "Surgery", "Sports"],
    friends: ["Sun", "Moon", "Jupiter"],
    enemies: ["Mercury"],
    neutral: ["Venus", "Saturn"],
    exaltationSign: "Capricorn",
    debilitationSign: "Cancer",
    ownSigns: ["Aries", "Scorpio"],
    moolTrikonaSign: "Aries",
    directionalStrength: 10, // 10th house
  },
  Mercury: {
    nature: "Benefic",
    element: "Earth",
    gender: "Neutral",
    caste: "Vaishya",
    significations: ["Intelligence", "Communication", "Business", "Education", "Analysis", "Writing", "Mathematics"],
    friends: ["Sun", "Venus"],
    enemies: ["Moon"],
    neutral: ["Mars", "Jupiter", "Saturn"],
    exaltationSign: "Virgo",
    debilitationSign: "Pisces",
    ownSigns: ["Gemini", "Virgo"],
    moolTrikonaSign: "Virgo",
    directionalStrength: 1, // 1st house
  },
  Jupiter: {
    nature: "Benefic",
    element: "Ether",
    gender: "Male",
    caste: "Brahmin",
    significations: ["Wisdom", "Children", "Wealth", "Spirituality", "Teacher", "Knowledge", "Dharma", "Fortune"],
    friends: ["Sun", "Moon", "Mars"],
    enemies: ["Mercury", "Venus"],
    neutral: ["Saturn"],
    exaltationSign: "Cancer",
    debilitationSign: "Capricorn",
    ownSigns: ["Sagittarius", "Pisces"],
    moolTrikonaSign: "Sagittarius",
    directionalStrength: 1, // 1st house
  },
  Venus: {
    nature: "Benefic",
    element: "Water",
    gender: "Female",
    caste: "Brahmin",
    significations: ["Love", "Marriage", "Luxury", "Arts", "Vehicles", "Comforts", "Beauty", "Relationships"],
    friends: ["Mercury", "Saturn"],
    enemies: ["Sun", "Moon"],
    neutral: ["Mars", "Jupiter"],
    exaltationSign: "Pisces",
    debilitationSign: "Virgo",
    ownSigns: ["Taurus", "Libra"],
    moolTrikonaSign: "Libra",
    directionalStrength: 4, // 4th house
  },
  Saturn: {
    nature: "Malefic",
    element: "Air",
    gender: "Neutral",
    caste: "Shudra",
    significations: ["Discipline", "Delays", "Obstacles", "Longevity", "Hard work", "Service", "Sorrow", "Karma"],
    friends: ["Mercury", "Venus"],
    enemies: ["Sun", "Moon", "Mars"],
    neutral: ["Jupiter"],
    exaltationSign: "Libra",
    debilitationSign: "Aries",
    ownSigns: ["Capricorn", "Aquarius"],
    moolTrikonaSign: "Aquarius",
    directionalStrength: 7, // 7th house
  },
  Rahu: {
    nature: "Malefic",
    element: "Air",
    gender: "Neutral",
    caste: "Outcaste",
    significations: ["Obsession", "Foreign", "Innovation", "Materialism", "Confusion", "Illusion", "Technology"],
    friends: ["Venus", "Saturn"],
    enemies: ["Sun", "Moon", "Mars"],
    neutral: ["Mercury", "Jupiter"],
    exaltationSign: "Gemini",
    debilitationSign: "Sagittarius",
    ownSigns: [],
    moolTrikonaSign: "",
    directionalStrength: 0,
  },
  Ketu: {
    nature: "Malefic",
    element: "Fire",
    gender: "Neutral",
    caste: "Outcaste",
    significations: ["Spirituality", "Liberation", "Detachment", "Past life", "Mysticism", "Research", "Isolation"],
    friends: ["Mars", "Jupiter"],
    enemies: ["Sun", "Moon"],
    neutral: ["Mercury", "Venus", "Saturn"],
    exaltationSign: "Sagittarius",
    debilitationSign: "Gemini",
    ownSigns: [],
    moolTrikonaSign: "",
    directionalStrength: 0,
  },
} as const

// Sign characteristics
export const SIGN_CHARACTERISTICS = {
  Aries: {
    element: "Fire",
    quality: "Cardinal",
    ruler: "Mars",
    nature: "Movable",
    gender: "Male",
    direction: "East",
    bodyParts: ["Head", "Brain"],
    characteristics: ["Pioneering", "Impulsive", "Leadership", "Courage", "Independence"],
  },
  Taurus: {
    element: "Earth",
    quality: "Fixed",
    ruler: "Venus",
    nature: "Fixed",
    gender: "Female",
    direction: "South",
    bodyParts: ["Face", "Neck", "Throat"],
    characteristics: ["Stable", "Sensual", "Practical", "Stubborn", "Material"],
  },
  Gemini: {
    element: "Air",
    quality: "Mutable",
    ruler: "Mercury",
    nature: "Dual",
    gender: "Male",
    direction: "West",
    bodyParts: ["Arms", "Shoulders", "Lungs"],
    characteristics: ["Communicative", "Adaptable", "Curious", "Restless", "Intellectual"],
  },
  Cancer: {
    element: "Water",
    quality: "Cardinal",
    ruler: "Moon",
    nature: "Movable",
    gender: "Female",
    direction: "North",
    bodyParts: ["Chest", "Stomach", "Breasts"],
    characteristics: ["Nurturing", "Emotional", "Protective", "Intuitive", "Home-loving"],
  },
  Leo: {
    element: "Fire",
    quality: "Fixed",
    ruler: "Sun",
    nature: "Fixed",
    gender: "Male",
    direction: "East",
    bodyParts: ["Heart", "Back", "Spine"],
    characteristics: ["Creative", "Dramatic", "Generous", "Proud", "Leadership"],
  },
  Virgo: {
    element: "Earth",
    quality: "Mutable",
    ruler: "Mercury",
    nature: "Dual",
    gender: "Female",
    direction: "South",
    bodyParts: ["Intestines", "Digestive system"],
    characteristics: ["Analytical", "Perfectionist", "Service-oriented", "Practical", "Critical"],
  },
  Libra: {
    element: "Air",
    quality: "Cardinal",
    ruler: "Venus",
    nature: "Movable",
    gender: "Male",
    direction: "West",
    bodyParts: ["Kidneys", "Lower back"],
    characteristics: ["Balanced", "Diplomatic", "Artistic", "Harmonious", "Indecisive"],
  },
  Scorpio: {
    element: "Water",
    quality: "Fixed",
    ruler: "Mars",
    nature: "Fixed",
    gender: "Female",
    direction: "North",
    bodyParts: ["Reproductive organs", "Pelvis"],
    characteristics: ["Intense", "Secretive", "Transformative", "Passionate", "Mysterious"],
  },
  Sagittarius: {
    element: "Fire",
    quality: "Mutable",
    ruler: "Jupiter",
    nature: "Dual",
    gender: "Male",
    direction: "East",
    bodyParts: ["Thighs", "Hips"],
    characteristics: ["Philosophical", "Adventurous", "Optimistic", "Freedom-loving", "Spiritual"],
  },
  Capricorn: {
    element: "Earth",
    quality: "Cardinal",
    ruler: "Saturn",
    nature: "Movable",
    gender: "Female",
    direction: "South",
    bodyParts: ["Knees", "Bones"],
    characteristics: ["Ambitious", "Disciplined", "Practical", "Conservative", "Responsible"],
  },
  Aquarius: {
    element: "Air",
    quality: "Fixed",
    ruler: "Saturn",
    nature: "Fixed",
    gender: "Male",
    direction: "West",
    bodyParts: ["Calves", "Ankles"],
    characteristics: ["Innovative", "Humanitarian", "Independent", "Eccentric", "Progressive"],
  },
  Pisces: {
    element: "Water",
    quality: "Mutable",
    ruler: "Jupiter",
    nature: "Dual",
    gender: "Female",
    direction: "North",
    bodyParts: ["Feet", "Lymphatic system"],
    characteristics: ["Intuitive", "Compassionate", "Artistic", "Dreamy", "Spiritual"],
  },
} as const

// House significations
export const HOUSE_SIGNIFICATIONS = {
  1: {
    name: "Tanu Bhava",
    significations: ["Self", "Physical body", "Personality", "Overall health", "Beginnings", "Appearance"],
    naturalSign: "Aries",
    naturalRuler: "Mars",
    bodyParts: ["Head", "Brain", "Overall constitution"],
  },
  2: {
    name: "Dhana Bhava",
    significations: ["Wealth", "Family", "Speech", "Food", "Education", "Values", "Accumulated resources"],
    naturalSign: "Taurus",
    naturalRuler: "Venus",
    bodyParts: ["Face", "Eyes", "Mouth", "Teeth"],
  },
  3: {
    name: "Sahaja Bhava",
    significations: ["Courage", "Siblings", "Short journeys", "Communication", "Hobbies", "Skills", "Efforts"],
    naturalSign: "Gemini",
    naturalRuler: "Mercury",
    bodyParts: ["Arms", "Shoulders", "Hands"],
  },
  4: {
    name: "Sukha Bhava",
    significations: ["Mother", "Home", "Emotional well-being", "Property", "Vehicles", "Education", "Happiness"],
    naturalSign: "Cancer",
    naturalRuler: "Moon",
    bodyParts: ["Chest", "Heart", "Lungs"],
  },
  5: {
    name: "Putra Bhava",
    significations: ["Children", "Creativity", "Intelligence", "Romance", "Speculation", "Past merits", "Education"],
    naturalSign: "Leo",
    naturalRuler: "Sun",
    bodyParts: ["Heart", "Upper abdomen"],
  },
  6: {
    name: "Ripu Bhava",
    significations: ["Enemies", "Obstacles", "Illness", "Debts", "Service", "Competition", "Daily routine"],
    naturalSign: "Virgo",
    naturalRuler: "Mercury",
    bodyParts: ["Intestines", "Digestive system"],
  },
  7: {
    name: "Kalatra Bhava",
    significations: ["Marriage", "Partnerships", "Business", "Foreign travel", "Public relations", "Spouse"],
    naturalSign: "Libra",
    naturalRuler: "Venus",
    bodyParts: ["Kidneys", "Lower back"],
  },
  8: {
    name: "Ayur Bhava",
    significations: ["Longevity", "Hidden knowledge", "Inheritance", "Accidents", "Transformation", "Occult"],
    naturalSign: "Scorpio",
    naturalRuler: "Mars",
    bodyParts: ["Reproductive organs", "Excretory system"],
  },
  9: {
    name: "Dharma Bhava",
    significations: ["Fortune", "Higher education", "Spirituality", "Father", "Long journeys", "Dharma", "Luck"],
    naturalSign: "Sagittarius",
    naturalRuler: "Jupiter",
    bodyParts: ["Thighs", "Hips"],
  },
  10: {
    name: "Karma Bhava",
    significations: ["Career", "Authority", "Reputation", "Government", "Fame", "Status", "Profession"],
    naturalSign: "Capricorn",
    naturalRuler: "Saturn",
    bodyParts: ["Knees", "Joints"],
  },
  11: {
    name: "Labha Bhava",
    significations: ["Income", "Gains", "Social networks", "Elder siblings", "Aspirations", "Friends", "Profits"],
    naturalSign: "Aquarius",
    naturalRuler: "Saturn",
    bodyParts: ["Calves", "Ankles"],
  },
  12: {
    name: "Vyaya Bhava",
    significations: ["Losses", "Expenses", "Spiritual liberation", "Isolation", "Foreign residence", "Moksha"],
    naturalSign: "Pisces",
    naturalRuler: "Jupiter",
    bodyParts: ["Feet", "Left eye"],
  },
} as const

// Planetary position analysis result
export interface PlanetaryPositionAnalysis {
  planet: string
  house: number
  sign: string
  degree: number
  nakshatra: string
  nakshatraPada: number
  isRetrograde: boolean
  dignity: "Exalted" | "Own Sign" | "Mool Trikona" | "Friend's Sign" | "Neutral" | "Enemy's Sign" | "Debilitated"
  strength: "Very Strong" | "Strong" | "Average" | "Weak" | "Very Weak"
  signCharacteristics: (typeof SIGN_CHARACTERISTICS)[keyof typeof SIGN_CHARACTERISTICS]
  houseSignifications: (typeof HOUSE_SIGNIFICATIONS)[keyof typeof HOUSE_SIGNIFICATIONS]
  planetCharacteristics: (typeof PLANET_CHARACTERISTICS)[keyof typeof PLANET_CHARACTERISTICS]
  interpretation: string
  effects: string[]
  remedies: string[]
}

// House occupancy analysis
export interface HouseOccupancyAnalysis {
  house: number
  sign: string
  planets: string[]
  isEmpty: boolean
  houseStrength: "Very Strong" | "Strong" | "Average" | "Weak" | "Very Weak"
  signCharacteristics: (typeof SIGN_CHARACTERISTICS)[keyof typeof SIGN_CHARACTERISTICS]
  houseSignifications: (typeof HOUSE_SIGNIFICATIONS)[keyof typeof HOUSE_SIGNIFICATIONS]
  interpretation: string
  effects: string[]
}

/**
 * Determines the dignity of a planet in a given sign
 */
function determinePlanetDignity(planet: string, sign: string): PlanetaryPositionAnalysis["dignity"] {
  const planetChar = PLANET_CHARACTERISTICS[planet as keyof typeof PLANET_CHARACTERISTICS]

  if (!planetChar) return "Neutral"

  if (planetChar.exaltationSign === sign) return "Exalted"
  if (planetChar.debilitationSign === sign) return "Debilitated"
  if (planetChar.ownSigns.includes(sign)) return "Own Sign"
  if (planetChar.moolTrikonaSign === sign) return "Mool Trikona"

  // Check friendship
  const signRuler = Object.entries(SIGN_CHARACTERISTICS).find(([signName]) => signName === sign)?.[1]?.ruler
  if (signRuler && planetChar.friends.includes(signRuler)) return "Friend's Sign"
  if (signRuler && planetChar.enemies.includes(signRuler)) return "Enemy's Sign"

  return "Neutral"
}

/**
 * Determines the overall strength of a planet based on various factors
 */
function determinePlanetStrength(
  planet: string,
  sign: string,
  house: number,
  isRetrograde: boolean,
): PlanetaryPositionAnalysis["strength"] {
  const dignity = determinePlanetDignity(planet, sign)
  const planetChar = PLANET_CHARACTERISTICS[planet as keyof typeof PLANET_CHARACTERISTICS]

  let strengthScore = 0

  // Dignity scoring
  switch (dignity) {
    case "Exalted":
      strengthScore += 5
      break
    case "Mool Trikona":
      strengthScore += 4
      break
    case "Own Sign":
      strengthScore += 3
      break
    case "Friend's Sign":
      strengthScore += 2
      break
    case "Neutral":
      strengthScore += 1
      break
    case "Enemy's Sign":
      strengthScore -= 1
      break
    case "Debilitated":
      strengthScore -= 3
      break
  }

  // Directional strength
  if (planetChar && planetChar.directionalStrength === house) {
    strengthScore += 2
  }

  // Retrograde consideration (can be both positive and negative)
  if (isRetrograde && planet !== "Sun" && planet !== "Moon" && planet !== "Rahu" && planet !== "Ketu") {
    strengthScore += 1 // Retrograde planets often gain strength
  }

  // Convert score to strength category
  if (strengthScore >= 6) return "Very Strong"
  if (strengthScore >= 3) return "Strong"
  if (strengthScore >= 0) return "Average"
  if (strengthScore >= -2) return "Weak"
  return "Very Weak"
}

/**
 * Generates interpretation for a planet's position
 */
function generatePlanetInterpretation(
  planet: string,
  house: number,
  sign: string,
  dignity: string,
  strength: string,
): string {
  const planetChar = PLANET_CHARACTERISTICS[planet as keyof typeof PLANET_CHARACTERISTICS]
  const houseInfo = HOUSE_SIGNIFICATIONS[house as keyof typeof HOUSE_SIGNIFICATIONS]
  const signChar = SIGN_CHARACTERISTICS[sign as keyof typeof SIGN_CHARACTERISTICS]

  if (!planetChar || !houseInfo || !signChar) {
    return `${planet} in ${sign} in the ${house}th house.`
  }

  let interpretation = `${planet} in ${sign} in the ${house}th house (${houseInfo.name}) `

  // Add dignity information
  switch (dignity) {
    case "Exalted":
      interpretation += `is exalted, giving excellent results. `
      break
    case "Own Sign":
      interpretation += `is in its own sign, providing strong and favorable results. `
      break
    case "Mool Trikona":
      interpretation += `is in its Mool Trikona sign, giving very good results. `
      break
    case "Friend's Sign":
      interpretation += `is in a friendly sign, providing good results. `
      break
    case "Debilitated":
      interpretation += `is debilitated, which may create challenges that lead to growth. `
      break
    case "Enemy's Sign":
      interpretation += `is in an enemy's sign, which may create some difficulties. `
      break
    default:
      interpretation += `is neutrally placed. `
  }

  // Add house-specific effects
  interpretation += `This placement influences ${houseInfo.significations.slice(0, 3).join(", ")} in your life. `

  // Add sign characteristics
  interpretation += `The ${signChar.element} element and ${signChar.characteristics.slice(0, 2).join(", ")} nature of ${sign} `
  interpretation += `colors how ${planet}'s energy of ${planetChar.significations.slice(0, 2).join(" and ")} manifests.`

  return interpretation
}

/**
 * Generates effects for a planet's position
 */
function generatePlanetEffects(
  planet: string,
  house: number,
  sign: string,
  dignity: string,
  strength: string,
): string[] {
  const effects: string[] = []
  const planetChar = PLANET_CHARACTERISTICS[planet as keyof typeof PLANET_CHARACTERISTICS]
  const houseInfo = HOUSE_SIGNIFICATIONS[house as keyof typeof HOUSE_SIGNIFICATIONS]

  if (!planetChar || !houseInfo) return effects

  // Positive effects based on strength and dignity
  if (strength === "Very Strong" || strength === "Strong") {
    effects.push(
      `Enhanced ${planetChar.significations[0].toLowerCase()} and ${planetChar.significations[1].toLowerCase()}`,
    )
    effects.push(`Favorable outcomes in ${houseInfo.significations[0].toLowerCase()}`)
  }

  // House-specific effects
  switch (house) {
    case 1:
      effects.push(`Strong personality traits related to ${planet}`)
      break
    case 2:
      effects.push(`${planet}'s influence on wealth and family matters`)
      break
    case 4:
      effects.push(`${planet}'s impact on home and emotional well-being`)
      break
    case 7:
      effects.push(`${planet}'s influence on partnerships and marriage`)
      break
    case 10:
      effects.push(`${planet}'s impact on career and reputation`)
      break
  }

  // Challenging effects for weak planets
  if (strength === "Weak" || strength === "Very Weak") {
    effects.push(`May need extra effort in areas related to ${planetChar.significations[0].toLowerCase()}`)
  }

  return effects
}

/**
 * Generates remedies for a planet based on its position and strength
 */
function generatePlanetRemedies(planet: string, strength: string, dignity: string): string[] {
  const remedies: string[] = []

  // Only suggest remedies for weak or challenging positions
  if (strength === "Weak" || strength === "Very Weak" || dignity === "Debilitated" || dignity === "Enemy's Sign") {
    switch (planet) {
      case "Sun":
        remedies.push("Offer water to the Sun every morning")
        remedies.push("Recite Aditya Hridayam or Om Suryaya Namaha")
        remedies.push("Wear ruby or red coral (after consultation)")
        break
      case "Moon":
        remedies.push("Offer milk to Shiva on Mondays")
        remedies.push("Recite Om Chandraya Namaha")
        remedies.push("Wear pearl or moonstone (after consultation)")
        break
      case "Mars":
        remedies.push("Recite Hanuman Chalisa on Tuesdays")
        remedies.push("Donate red lentils on Tuesdays")
        remedies.push("Wear red coral (after consultation)")
        break
      case "Mercury":
        remedies.push("Recite Vishnu Sahasranama on Wednesdays")
        remedies.push("Donate green items on Wednesdays")
        remedies.push("Wear emerald (after consultation)")
        break
      case "Jupiter":
        remedies.push("Recite Guru Stotram on Thursdays")
        remedies.push("Donate yellow items or turmeric on Thursdays")
        remedies.push("Wear yellow sapphire (after consultation)")
        break
      case "Venus":
        remedies.push("Recite Shukra Stotram on Fridays")
        remedies.push("Donate white items on Fridays")
        remedies.push("Wear diamond or white sapphire (after consultation)")
        break
      case "Saturn":
        remedies.push("Recite Shani Chalisa on Saturdays")
        remedies.push("Donate black items or mustard oil on Saturdays")
        remedies.push("Wear blue sapphire (after consultation)")
        break
      case "Rahu":
        remedies.push("Recite Om Rahave Namaha")
        remedies.push("Donate blue or black items")
        remedies.push("Wear hessonite garnet (after consultation)")
        break
      case "Ketu":
        remedies.push("Recite Om Ketave Namaha")
        remedies.push("Donate multicolored items")
        remedies.push("Wear cat's eye (after consultation)")
        break
    }
  }

  return remedies
}

/**
 * Analyzes the position of all planets in the chart
 */
export function analyzePlanetaryPositions(chart: AstrologyChart): PlanetaryPositionAnalysis[] {
  logInfo("planetary-analyzer", "Analyzing planetary positions", {
    planetCount: chart.planets.length,
  })

  const analyses: PlanetaryPositionAnalysis[] = []

  for (const planet of chart.planets) {
    try {
      const dignity = determinePlanetDignity(planet.name, planet.sign)
      const strength = determinePlanetStrength(planet.name, planet.sign, planet.house || 1, planet.isRetrograde)
      const interpretation = generatePlanetInterpretation(
        planet.name,
        planet.house || 1,
        planet.sign,
        dignity,
        strength,
      )
      const effects = generatePlanetEffects(planet.name, planet.house || 1, planet.sign, dignity, strength)
      const remedies = generatePlanetRemedies(planet.name, strength, dignity)

      const analysis: PlanetaryPositionAnalysis = {
        planet: planet.name,
        house: planet.house || 1,
        sign: planet.sign,
        degree: planet.longitude,
        nakshatra: planet.nakshatra,
        nakshatraPada: planet.nakshatraPada,
        isRetrograde: planet.isRetrograde,
        dignity,
        strength,
        signCharacteristics: SIGN_CHARACTERISTICS[planet.sign as keyof typeof SIGN_CHARACTERISTICS],
        houseSignifications: HOUSE_SIGNIFICATIONS[(planet.house || 1) as keyof typeof HOUSE_SIGNIFICATIONS],
        planetCharacteristics: PLANET_CHARACTERISTICS[planet.name as keyof typeof PLANET_CHARACTERISTICS],
        interpretation,
        effects,
        remedies,
      }

      analyses.push(analysis)

      logDebug("planetary-analyzer", `Analyzed ${planet.name}`, {
        house: planet.house,
        sign: planet.sign,
        dignity,
        strength,
      })
    } catch (error) {
      logError("planetary-analyzer", `Error analyzing ${planet.name}`, error)
    }
  }

  logInfo("planetary-analyzer", "Planetary position analysis completed", {
    analysisCount: analyses.length,
  })

  return analyses
}

/**
 * Analyzes house occupancy in the chart
 */
export function analyzeHouseOccupancy(chart: AstrologyChart): HouseOccupancyAnalysis[] {
  logInfo("planetary-analyzer", "Analyzing house occupancy")

  const analyses: HouseOccupancyAnalysis[] = []

  for (let houseNum = 1; houseNum <= 12; houseNum++) {
    try {
      const house = chart.rashiChart[houseNum]
      if (!house) continue

      const planets = house.planets.map((p) => p.name)
      const isEmpty = planets.length === 0

      // Determine house strength based on occupants and aspects
      let strengthScore = 0

      // Natural benefics add strength
      const benefics = ["Jupiter", "Venus", "Mercury", "Moon"]
      const malefics = ["Saturn", "Mars", "Sun", "Rahu", "Ketu"]

      for (const planet of house.planets) {
        if (benefics.includes(planet.name)) {
          const dignity = determinePlanetDignity(planet.name, planet.sign)
          if (dignity === "Exalted" || dignity === "Own Sign") strengthScore += 3
          else if (dignity === "Friend's Sign") strengthScore += 2
          else strengthScore += 1
        } else if (malefics.includes(planet.name)) {
          const dignity = determinePlanetDignity(planet.name, planet.sign)
          if (dignity === "Exalted" || dignity === "Own Sign") strengthScore += 2
          else if (dignity === "Debilitated") strengthScore -= 2
          else strengthScore -= 1
        }
      }

      let houseStrength: HouseOccupancyAnalysis["houseStrength"]
      if (strengthScore >= 4) houseStrength = "Very Strong"
      else if (strengthScore >= 2) houseStrength = "Strong"
      else if (strengthScore >= 0) houseStrength = "Average"
      else if (strengthScore >= -2) houseStrength = "Weak"
      else houseStrength = "Very Weak"

      // Generate interpretation
      const houseInfo = HOUSE_SIGNIFICATIONS[houseNum as keyof typeof HOUSE_SIGNIFICATIONS]
      const signChar = SIGN_CHARACTERISTICS[house.sign as keyof typeof SIGN_CHARACTERISTICS]

      let interpretation = `The ${houseNum}th house (${houseInfo.name}) in ${house.sign} `

      if (isEmpty) {
        interpretation += `is empty, which means its results depend on the placement and condition of its lord. `
      } else {
        interpretation += `contains ${planets.join(", ")}, which directly influences ${houseInfo.significations.slice(0, 2).join(" and ")}. `
      }

      interpretation += `The ${signChar.element} element and ${signChar.characteristics.slice(0, 2).join(", ")} nature of ${house.sign} `
      interpretation += `shapes how matters of ${houseInfo.significations[0].toLowerCase()} manifest in your life.`

      // Generate effects
      const effects: string[] = []
      if (!isEmpty) {
        effects.push(`Direct planetary influence on ${houseInfo.significations[0].toLowerCase()}`)
        effects.push(`${houseStrength.toLowerCase()} results in ${houseInfo.name.toLowerCase()} matters`)
      } else {
        effects.push(`Results depend on the house lord's placement and condition`)
      }

      const analysis: HouseOccupancyAnalysis = {
        house: houseNum,
        sign: house.sign,
        planets,
        isEmpty,
        houseStrength,
        signCharacteristics: signChar,
        houseSignifications: houseInfo,
        interpretation,
        effects,
      }

      analyses.push(analysis)
    } catch (error) {
      logError("planetary-analyzer", `Error analyzing house ${houseNum}`, error)
    }
  }

  logInfo("planetary-analyzer", "House occupancy analysis completed", {
    analysisCount: analyses.length,
  })

  return analyses
}

/**
 * Gets planets in a specific house
 */
export function getPlanetsInHouse(chart: AstrologyChart, houseNumber: number): PlanetPosition[] {
  const house = chart.rashiChart[houseNumber]
  return house ? house.planets : []
}

/**
 * Gets the sign occupied by a specific planet
 */
export function getPlanetSign(chart: AstrologyChart, planetName: string): string | null {
  const planet = chart.planets.find((p) => p.name === planetName)
  return planet ? planet.sign : null
}

/**
 * Gets all planets in a specific sign
 */
export function getPlanetsInSign(chart: AstrologyChart, signName: string): PlanetPosition[] {
  return chart.planets.filter((p) => p.sign === signName)
}

/**
 * Gets the house number where a specific planet is placed
 */
export function getPlanetHouse(chart: AstrologyChart, planetName: string): number | null {
  const planet = chart.planets.find((p) => p.name === planetName)
  return planet ? planet.house || null : null
}

/**
 * Generates a comprehensive planetary position report
 */
export function generatePlanetaryPositionReport(chart: AstrologyChart): {
  planetaryAnalyses: PlanetaryPositionAnalysis[]
  houseAnalyses: HouseOccupancyAnalysis[]
  summary: string
} {
  logInfo("planetary-analyzer", "Generating comprehensive planetary position report")

  const planetaryAnalyses = analyzePlanetaryPositions(chart)
  const houseAnalyses = analyzeHouseOccupancy(chart)

  // Generate summary
  const strongPlanets = planetaryAnalyses.filter((p) => p.strength === "Very Strong" || p.strength === "Strong")
  const weakPlanets = planetaryAnalyses.filter((p) => p.strength === "Weak" || p.strength === "Very Weak")
  const exaltedPlanets = planetaryAnalyses.filter((p) => p.dignity === "Exalted")
  const debilitatedPlanets = planetaryAnalyses.filter((p) => p.dignity === "Debilitated")

  let summary = `Planetary Position Analysis Summary:\n\n`

  if (strongPlanets.length > 0) {
    summary += `Strong Planets: ${strongPlanets.map((p) => p.planet).join(", ")} - These planets will give favorable results in their respective areas.\n\n`
  }

  if (exaltedPlanets.length > 0) {
    summary += `Exalted Planets: ${exaltedPlanets.map((p) => p.planet).join(", ")} - These planets are in their highest dignity and will give excellent results.\n\n`
  }

  if (weakPlanets.length > 0) {
    summary += `Planets needing attention: ${weakPlanets.map((p) => p.planet).join(", ")} - These planets may require remedial measures for better results.\n\n`
  }

  if (debilitatedPlanets.length > 0) {
    summary += `Debilitated Planets: ${debilitatedPlanets.map((p) => p.planet).join(", ")} - These planets are in their lowest dignity but can still give good results through proper remedies and conscious effort.\n\n`
  }

  summary += `Each planet's placement in its respective house and sign creates a unique combination that influences different areas of life. The detailed analysis above provides specific insights for each planetary position.`

  logInfo("planetary-analyzer", "Planetary position report generated successfully", {
    strongPlanets: strongPlanets.length,
    weakPlanets: weakPlanets.length,
    exaltedPlanets: exaltedPlanets.length,
    debilitatedPlanets: debilitatedPlanets.length,
  })

  return {
    planetaryAnalyses,
    houseAnalyses,
    summary,
  }
}
