import type { AstrologyChart, PlanetPosition, BirthDetails, HierarchicalDashaPeriod } from "@/types/astrology"
import { findActiveDashaPeriodsAtDate, isInDashaSandhi, getNextDashaTransition } from "./dasha-calculator"

// Types for interpretations
export interface HouseInterpretation {
  house: number
  area: string
  strength: "strong" | "moderate" | "weak"
  occupants: string[]
  aspects: string[]
  significators: string[]
  interpretation: string
}

export interface PlanetInterpretation {
  planet: string
  sign: string
  house: number
  isRetrograde: boolean
  strength: "exalted" | "own sign" | "friendly" | "neutral" | "debilitated" | "combust"
  significations: string[]
  interpretation: string
}

export interface LifeAreaInterpretation {
  area: string
  houses: number[]
  planets: string[]
  strength: "excellent" | "good" | "moderate" | "challenging" | "difficult"
  currentDashaInfluence: string
  shortTermPrediction: string
  longTermPrediction: string
  remedialMeasures: string[]
}

export interface DashaInterpretation {
  planet: string
  period: string
  influence: string
  favorableAreas: string[]
  challengingAreas: string[]
  prediction: string
}

export interface ChartInterpretation {
  overview: string
  ascendant: {
    sign: string
    interpretation: string
  }
  houses: HouseInterpretation[]
  planets: PlanetInterpretation[]
  lifeAreas: LifeAreaInterpretation[]
  currentDasha: DashaInterpretation
  upcomingDasha: DashaInterpretation
  remedialMeasures: string[]
}

// House significations based on the rulebook
const HOUSE_SIGNIFICATIONS = {
  1: ["Self", "Physical body", "Personality", "Overall health", "Beginnings"],
  2: ["Wealth", "Family resources", "Speech", "Education", "Food"],
  3: ["Courage", "Siblings", "Short journeys", "Communication", "Hobbies"],
  4: ["Mother", "Home", "Emotional well-being", "Property", "Vehicles"],
  5: ["Children", "Creativity", "Intelligence", "Romance", "Speculative gains"],
  6: ["Enemies", "Obstacles", "Illness", "Debts", "Service"],
  7: ["Marriage", "Partnerships", "Business relationships", "Foreign travel"],
  8: ["Longevity", "Hidden knowledge", "Inheritance", "Accidents", "Transformation"],
  9: ["Fortune", "Higher education", "Spirituality", "Father", "Long journeys"],
  10: ["Career", "Authority", "Reputation", "Government", "Fame"],
  11: ["Income", "Gains", "Social networks", "Elder siblings", "Aspirations"],
  12: ["Losses", "Expenses", "Spiritual liberation", "Isolation", "Foreign residence"],
}

// Planet significations based on the rulebook
const PLANET_SIGNIFICATIONS = {
  Sun: ["Soul", "Authority", "Father", "Vitality", "Government"],
  Moon: ["Mind", "Emotions", "Mother", "Public", "Water"],
  Mars: ["Energy", "Courage", "Brothers", "Land", "Accidents"],
  Mercury: ["Intelligence", "Communication", "Analysis", "Business"],
  Jupiter: ["Wisdom", "Children", "Wealth", "Spirituality", "Teacher"],
  Venus: ["Relationships", "Luxury", "Marriage", "Art", "Vehicles"],
  Saturn: ["Longevity", "Discipline", "Sorrow", "Labor", "Delays"],
  Rahu: ["Obsession", "Foreign matters", "Material growth", "Innovation"],
  Ketu: ["Liberation", "Isolation", "Psychic abilities", "Losses"],
}

// Sign qualities based on the rulebook
const SIGN_QUALITIES = {
  Aries: ["Fiery", "Impulsive", "Pioneering", "Independent"],
  Taurus: ["Earthy", "Stable", "Sensual", "Resource-oriented"],
  Gemini: ["Airy", "Adaptable", "Communicative", "Dual-natured"],
  Cancer: ["Watery", "Nurturing", "Emotional", "Home-oriented"],
  Leo: ["Fiery", "Creative", "Dignified", "Leadership"],
  Virgo: ["Earthy", "Analytical", "Service-oriented", "Meticulous"],
  Libra: ["Airy", "Balanced", "Relationship-focused", "Artistic"],
  Scorpio: ["Watery", "Intense", "Secretive", "Transformative"],
  Sagittarius: ["Fiery", "Philosophical", "Adventurous", "Optimistic"],
  Capricorn: ["Earthy", "Ambitious", "Disciplined", "Structured"],
  Aquarius: ["Airy", "Innovative", "Humanitarian", "Detached"],
  Pisces: ["Watery", "Intuitive", "Compassionate", "Spiritual"],
}

// Life area indicators based only on D1 (Rasi) and D9 (Navamsa) charts
const LIFE_AREA_INDICATORS = {
  // 1. Career and Professional Life
  careerProfessional: {
    houses: [10, 6, 2, 11], // 10th: career, 6th: service, 2nd: income, 11th: gains
    planets: ["Sun", "Saturn", "Mars", "Mercury"], // Sun: authority, Saturn: discipline, Mars: energy, Mercury: skills
    divisionalChart: "D-1", // Primary in D-1, career path and profession
    d1Elements: "10th house lord and its placement, planets in 10th house, Saturn's position, Sun's strength",
    d9Elements: "10th house of D9 shows career dharma and long-term professional evolution",
    subcategories: [
      "Career path alignment and natural aptitudes",
      "Leadership potential and management style",
      "Professional relationships and workplace dynamics",
      "Work-life balance tendencies",
      "Career satisfaction and fulfillment",
      "Entrepreneurial abilities",
      "Professional growth trajectory",
      "Decision-making approach in professional settings",
      "Workplace communication style",
      "Response to professional challenges",
    ],
  },

  // 2. Financial Well-being
  financialWellbeing: {
    houses: [2, 11, 5, 8, 9], // 2nd: wealth, 11th: gains, 5th: speculation, 8th: inheritance, 9th: fortune
    planets: ["Jupiter", "Venus", "Mercury", "Moon"], // Jupiter: expansion, Venus: luxury, Mercury: business, Moon: fluctuations
    divisionalChart: "D-1", // Primary in D-1, financial matters
    d1Elements: "2nd house lord and placement, 11th house strength, Jupiter's position, Venus aspects",
    d9Elements: "2nd house of D9 shows deeper financial karma and long-term wealth patterns",
    subcategories: [
      "Money management tendencies",
      "Relationship with wealth and abundance",
      "Financial decision-making patterns",
      "Risk tolerance with investments",
      "Long-term financial planning approach",
      "Wealth accumulation potential",
      "Financial security needs",
      "Spending and saving habits",
      "Financial independence pathway",
      "Attitudes toward material possessions",
    ],
  },

  // 3. Personal Relationships
  personalRelationships: {
    houses: [7, 5, 2, 11], // 7th: partnerships, 5th: romance, 2nd: family, 11th: friendships
    planets: ["Venus", "Jupiter", "Moon", "Mercury"], // Venus: relationships, Jupiter: expansion, Moon: emotions, Mercury: communication
    divisionalChart: "D-9", // Primary in D-9, marital and relationship karma
    d1Elements: "7th house lord and placement, Venus position and aspects, Moon's placement",
    d9Elements: "Overall D9 chart, 7th house of D9, Venus in D9, Upapada Lagna, 7th lord in D9",
    subcategories: [
      "Romantic partnership dynamics",
      "Friendship patterns and needs",
      "Family relationships and roles",
      "Communication style in close relationships",
      "Conflict resolution approach",
      "Intimacy needs and expression",
      "Trust development patterns",
      "Loyalty and commitment tendencies",
      "Relationship expectations",
      "Balance of giving and receiving",
    ],
  },

  // 4. Health and Well-being
  healthWellbeing: {
    houses: [1, 6, 8], // 1st: body, 6th: illness, 8th: chronic issues
    planets: ["Sun", "Moon", "Mars", "Saturn"], // Sun: vitality, Moon: mind, Mars: energy, Saturn: chronic conditions
    divisionalChart: "D-1", // Primary in D-1, physical health
    d1Elements: "Ascendant lord and its strength, 6th house afflictions, Sun and Moon positions, Saturn aspects",
    d9Elements: "D9 shows deeper health karma and psychological patterns affecting health",
    subcategories: [
      "Physical vitality and energy management",
      "Mental health tendencies",
      "Emotional balance and regulation",
      "Stress response patterns",
      "Health maintenance approach",
      "Healing capacity and resilience",
      "Self-care tendencies",
      "Physical activity preferences",
      "Rest and recovery needs",
      "Relationship with food and nutrition",
    ],
  },

  // 5. Personal Development
  personalDevelopment: {
    houses: [1, 5, 9], // 1st: self, 5th: creativity, 9th: higher purpose
    planets: ["Sun", "Jupiter", "Saturn"], // Sun: self, Jupiter: growth, Saturn: discipline
    divisionalChart: "D-1", // Primary in D-1 with D-9 insights
    d1Elements: "Ascendant and its lord, Sun's position, Jupiter's influence, 5th and 9th houses",
    d9Elements: "D9 shows soul-level growth patterns and deeper personal evolution",
    subcategories: [
      "Self-awareness and growth patterns",
      "Life purpose alignment",
      "Personal values and principles",
      "Identity development",
      "Character strengths and challenges",
      "Goal-setting approach",
      "Personal transformation capacity",
      "Self-discipline tendencies",
      "Personal boundaries management",
      "Adaptability to change",
    ],
  },

  // 6. Spiritual Life
  spiritualLife: {
    houses: [9, 12, 5], // 9th: dharma, 12th: moksha, 5th: past merits
    planets: ["Jupiter", "Ketu", "Sun", "Moon"], // Jupiter: wisdom, Ketu: liberation, Sun: soul, Moon: mind
    divisionalChart: "D-9", // Primary in D-9, spiritual evolution
    d1Elements: "9th and 12th houses and lords, Jupiter's position, Ketu's house placement",
    d9Elements: "Overall D9 chart, 9th and 12th houses in D9, Jupiter and Ketu in D9",
    subcategories: [
      "Spiritual path tendencies",
      "Connection to higher meaning",
      "Meditation and contemplative practices",
      "Faith and belief systems",
      "Intuitive development",
      "Spiritual community involvement",
      "Life philosophy development",
      "Inner wisdom access",
      "Transcendent experiences",
      "Spiritual growth patterns",
    ],
  },

  // 7. Creativity and Self-expression
  creativitySelfExpression: {
    houses: [5, 3, 1, 2], // 5th: creativity, 3rd: self-expression, 1st: self, 2nd: voice
    planets: ["Venus", "Mercury", "Jupiter", "Moon"], // Venus: arts, Mercury: communication, Jupiter: expansion, Moon: imagination
    divisionalChart: "D-1", // Primary in D-1
    d1Elements: "5th house and lord, Venus position and aspects, Mercury's placement",
    d9Elements: "5th house in D9 shows deeper creative potential and artistic karma",
    subcategories: [
      "Creative talents and natural abilities",
      "Artistic expression tendencies",
      "Creative problem-solving approach",
      "Innovation capacity",
      "Self-expression style",
      "Creative blocks and challenges",
      "Artistic development potential",
      "Relationship with beauty and aesthetics",
      "Creative fulfillment needs",
      "Originality and uniqueness expression",
    ],
  },

  // 8. Intellectual Life
  intellectualLife: {
    houses: [5, 2, 4, 9], // 5th: intelligence, 2nd: education, 4th: knowledge, 9th: higher learning
    planets: ["Mercury", "Jupiter", "Saturn"], // Mercury: intellect, Jupiter: wisdom, Saturn: depth
    divisionalChart: "D-1", // Primary in D-1
    d1Elements: "Mercury's position and aspects, 5th house strength, Jupiter's influence",
    d9Elements: "Mercury and Jupiter in D9 show deeper intellectual karma and wisdom potential",
    subcategories: [
      "Learning style and preferences",
      "Intellectual curiosity patterns",
      "Critical thinking approach",
      "Knowledge acquisition tendencies",
      "Information processing style",
      "Mental flexibility",
      "Analytical abilities",
      "Wisdom development",
      "Educational pursuits",
      "Intellectual challenges and growth",
    ],
  },

  // 9. Social Life and Community
  socialLifeCommunity: {
    houses: [11, 3, 7, 10], // 11th: social groups, 3rd: communication, 7th: partnerships, 10th: public image
    planets: ["Venus", "Mercury", "Jupiter", "Moon"], // Venus: social harmony, Mercury: communication, Jupiter: expansion, Moon: public
    divisionalChart: "D-1", // Primary in D-1
    d1Elements: "11th house and lord, Venus and Mercury positions, Moon's placement",
    d9Elements: "11th house in D9 shows deeper social karma and community connections",
    subcategories: [
      "Social network development",
      "Community involvement tendencies",
      "Leadership in group settings",
      "Social communication style",
      "Group dynamics navigation",
      "Social contribution patterns",
      "Cultural engagement",
      "Social responsibility approach",
      "Public perception management",
      "Belonging and connection needs",
    ],
  },

  // 10. Home and Living Environment
  homeLivingEnvironment: {
    houses: [4, 2, 12], // 4th: home, 2nd: family, 12th: private space
    planets: ["Moon", "Venus", "Mercury", "Mars"], // Moon: comfort, Venus: luxury, Mercury: adaptability, Mars: property
    divisionalChart: "D-1", // Primary in D-1
    d1Elements: "4th house and lord, Moon's position and aspects, Mars for property",
    d9Elements: "4th house in D9 shows deeper home karma and emotional foundation",
    subcategories: [
      "Home environment preferences",
      "Living space organization tendencies",
      "Domestic harmony needs",
      "Family life development",
      "Rootedness and stability needs",
      "Relationship with physical surroundings",
      "Home as sanctuary development",
      "Geographical location preferences",
      "Personal space requirements",
      "Home-based activities and interests",
    ],
  },

  // 11. Legacy and Life Purpose
  legacyLifePurpose: {
    houses: [9, 5, 8, 10], // 9th: purpose, 5th: creativity, 8th: transformation, 10th: reputation
    planets: ["Sun", "Jupiter", "Saturn"], // Sun: soul purpose, Jupiter: wisdom, Saturn: longevity
    divisionalChart: "D-9", // Primary in D-9, deeper purpose
    d1Elements: "9th house and lord, Sun's position, Saturn for long-term impact",
    d9Elements: "Overall D9 chart, 9th house in D9, Sun and Jupiter in D9",
    subcategories: [
      "Life mission alignment",
      "Contribution to future generations",
      "Values transmission",
      "Knowledge and wisdom sharing",
      "Meaningful impact creation",
      "Long-term vision development",
      "Personal legend creation",
      "Historical context awareness",
      "Generational healing potential",
      "Ethical and moral legacy",
    ],
  },

  // 12. Adventure and Travel
  adventureTravel: {
    houses: [3, 9, 12, 7], // 3rd: short journeys, 9th: long journeys, 12th: foreign lands, 7th: distant places
    planets: ["Jupiter", "Mercury", "Mars", "Rahu"], // Jupiter: expansion, Mercury: movement, Mars: courage, Rahu: foreign
    divisionalChart: "D-1", // Primary in D-1
    d1Elements: "9th and 3rd houses and lords, Jupiter's position, Rahu's influence",
    d9Elements: "9th house in D9 shows deeper travel karma and exploration purpose",
    subcategories: [
      "Exploration tendencies",
      "Risk-taking in new experiences",
      "Cultural adaptation abilities",
      "Travel preferences and patterns",
      "Geographic interests",
      "Experience-seeking tendencies",
      "Comfort with unfamiliarity",
      "Travel learning style",
      "Adventure planning approach",
      "Balance between exploration and security",
    ],
  },

  // 13. Time Management and Life Balance
  timeManagementBalance: {
    houses: [10, 3, 1, 8], // 10th: discipline, 3rd: multitasking, 1st: self-management, 8th: transformation
    planets: ["Saturn", "Mercury", "Mars", "Sun"], // Saturn: discipline, Mercury: adaptability, Mars: energy, Sun: focus
    divisionalChart: "D-1", // Primary in D-1
    d1Elements: "Saturn's position and aspects, Mercury's placement, Mars for energy management",
    d9Elements: "Saturn in D9 shows deeper karma related to time and discipline",
    subcategories: [
      "Priority setting tendencies",
      "Efficiency and effectiveness patterns",
      "Balance between life areas",
      "Time perception and relationship",
      "Long-term vs. short-term focus",
      "Procrastination tendencies",
      "Productivity patterns",
      "Rest and activity cycles",
      "Life rhythm development",
      "Presence and mindfulness capacity",
    ],
  },
}

// Remedial measures based on the rulebook
const REMEDIAL_MEASURES = {
  Sun: {
    gemstones: ["Ruby", "Red Garnet"],
    mantras: ["Om Suryaya Namaha", "Aditya Hridayam"],
    charity: ["Wheat", "Copper", "Gold"],
    day: "Sunday",
    color: "Red",
    direction: "East",
  },
  Moon: {
    gemstones: ["Pearl", "Moonstone"],
    mantras: ["Om Chandraya Namaha", "Chandra Kavacham"],
    charity: ["Rice", "Silver", "White cloth"],
    day: "Monday",
    color: "White",
    direction: "Northwest",
  },
  Mars: {
    gemstones: ["Red Coral", "Carnelian"],
    mantras: ["Om Kujaya Namaha", "Mangal Stotram"],
    charity: ["Red lentils", "Coral", "Red cloth"],
    day: "Tuesday",
    color: "Red",
    direction: "South",
  },
  Mercury: {
    gemstones: ["Emerald", "Jade"],
    mantras: ["Om Budhaya Namaha"],
    charity: ["Green mung beans", "Emerald"],
    day: "Wednesday",
    color: "Green",
    direction: "North",
  },
  Jupiter: {
    gemstones: ["Yellow Sapphire", "Topaz"],
    mantras: ["Om Gurave Namaha", "Guru Stotram"],
    charity: ["Yellow items", "Turmeric", "Gold"],
    day: "Thursday",
    color: "Yellow",
    direction: "Northeast",
  },
  Venus: {
    gemstones: ["Diamond", "White Sapphire"],
    mantras: ["Om Shukraya Namaha", "Shukra Stotram"],
    charity: ["White items", "Diamond", "Perfume"],
    day: "Friday",
    color: "White",
    direction: "Southeast",
  },
  Saturn: {
    gemstones: ["Blue Sapphire", "Amethyst"],
    mantras: ["Om Shanaischaraya Namaha", "Shani Chalisa"],
    charity: ["Black items", "Blue sapphire", "Iron"],
    day: "Saturday",
    color: "Black",
    direction: "West",
  },
  Rahu: {
    gemstones: ["Hessonite Garnet (Gomed)"],
    mantras: ["Om Rahave Namaha"],
    charity: ["Blue items", "Horsegram"],
    day: "Saturday",
    color: "Black",
    direction: "Southwest",
  },
  Ketu: {
    gemstones: ["Cat's Eye (Chrysoberyl)"],
    mantras: ["Om Ketave Namaha"],
    charity: ["Multicolored items", "Incense"],
    day: "Tuesday",
    color: "Brown",
    direction: "Southwest",
  },
}

/**
 * Determines the strength of a planet based on its position
 */
function determinePlanetStrength(
  planet: PlanetPosition,
): "exalted" | "own sign" | "friendly" | "neutral" | "debilitated" | "combust" {
  // This is a simplified version - in a real implementation, you would check:
  // 1. Exaltation/debilitation status based on sign
  // 2. Own sign status
  // 3. Friendly/enemy sign status
  // 4. Combustion status (proximity to Sun)

  // Simplified exaltation/debilitation rules
  const exaltationMap: Record<string, string> = {
    Sun: "Aries",
    Moon: "Taurus",
    Mars: "Capricorn",
    Mercury: "Virgo",
    Jupiter: "Cancer",
    Venus: "Pisces",
    Saturn: "Libra",
    Rahu: "Gemini",
    Ketu: "Sagittarius",
  }

  const debilitationMap: Record<string, string> = {
    Sun: "Libra",
    Moon: "Scorpio",
    Mars: "Cancer",
    Mercury: "Pisces",
    Jupiter: "Capricorn",
    Venus: "Virgo",
    Saturn: "Aries",
    Rahu: "Sagittarius",
    Ketu: "Gemini",
  }

  // Own sign rules (simplified)
  const ownSignMap: Record<string, string[]> = {
    Sun: ["Leo"],
    Moon: ["Cancer"],
    Mars: ["Aries", "Scorpio"],
    Mercury: ["Gemini", "Virgo"],
    Jupiter: ["Sagittarius", "Pisces"],
    Venus: ["Taurus", "Libra"],
    Saturn: ["Capricorn", "Aquarius"],
    Rahu: [],
    Ketu: [],
  }

  if (exaltationMap[planet.name] === planet.sign) {
    return "exalted"
  } else if (debilitationMap[planet.name] === planet.sign) {
    return "debilitated"
  } else if (ownSignMap[planet.name]?.includes(planet.sign)) {
    return "own sign"
  } else if (
    planet.name !== "Sun" &&
    planet.name !== "Moon" &&
    planet.name !== "Rahu" &&
    planet.name !== "Ketu" &&
    planet.isRetrograde
  ) {
    // Retrograde planets often behave differently
    return "neutral"
  } else {
    // In a real implementation, you would check friendly/enemy signs
    return "neutral"
  }
}

/**
 * Determines the strength of a house based on occupants and aspects
 */
function determineHouseStrength(houseNumber: number, chart: AstrologyChart): "strong" | "moderate" | "weak" {
  const house = chart.rashiChart[houseNumber]

  // Count benefic and malefic influences
  let beneficCount = 0
  let maleficCount = 0

  // Natural benefics and malefics
  const naturalBenefics = ["Jupiter", "Venus", "Mercury", "Moon"]
  const naturalMalefics = ["Saturn", "Mars", "Sun", "Rahu", "Ketu"]

  // Check occupants
  house.planets.forEach((planet) => {
    if (naturalBenefics.includes(planet.name)) {
      beneficCount++
    } else if (naturalMalefics.includes(planet.name)) {
      maleficCount++
    }
  })

  // In a real implementation, you would also check aspects to the house

  // Determine strength based on benefic/malefic ratio
  if (beneficCount > maleficCount) {
    return "strong"
  } else if (beneficCount === maleficCount) {
    return "moderate"
  } else {
    return "weak"
  }
}

/**
 * Helper function to get the ordinal suffix of a number (e.g., 1st, 2nd, 3rd, 4th)
 */
function getOrdinalSuffix(i: number): string {
  const j = i % 10
  const k = i % 100
  if (j === 1 && k !== 11) {
    return "st"
  }
  if (j === 2 && k !== 12) {
    return "nd"
  }
  if (j === 3 && k !== 13) {
    return "rd"
  }
  return "th"
}

/**
 * Interprets a specific house in the chart
 */
function interpretHouse(houseNumber: number, chart: AstrologyChart): HouseInterpretation {
  const house = chart.rashiChart[houseNumber]
  const strength = determineHouseStrength(houseNumber, chart)

  // Get occupants
  const occupants = house.planets.map((p) => p.name)

  // In a real implementation, you would determine aspects to the house
  const aspects: string[] = []

  // Get significations from our constant
  const significations = HOUSE_SIGNIFICATIONS[houseNumber as keyof typeof HOUSE_SIGNIFICATIONS] || []

  // Generate interpretation text
  let interpretationText = ""

  if (strength === "strong") {
    interpretationText = `Your ${houseNumber}${getOrdinalSuffix(
      houseNumber,
    )} house is strong, indicating favorable outcomes in areas of ${significations.join(", ")}.`
  } else if (strength === "moderate") {
    interpretationText = `Your ${houseNumber}${getOrdinalSuffix(
      houseNumber,
    )} house is moderately strong, suggesting mixed results in areas of ${significations.join(", ")}.`
  } else {
    interpretationText = `Your ${houseNumber}${getOrdinalSuffix(
      houseNumber,
    )} house faces some challenges, indicating potential difficulties in areas of ${significations.join(", ")}.`
  }

  // Add details about occupants
  if (occupants.length > 0) {
    interpretationText += ` It contains ${occupants.join(", ")}, which ${
      occupants.length > 1 ? "influence" : "influences"
    } these areas of life.`
  }

  return {
    house: houseNumber,
    area: significations[0] || "",
    strength,
    occupants,
    aspects,
    significators: significations,
    interpretation: interpretationText,
  }
}

/**
 * Interprets a specific planet in the chart
 */
function interpretPlanet(planet: PlanetPosition): PlanetInterpretation {
  const strength = determinePlanetStrength(planet)
  const significations = PLANET_SIGNIFICATIONS[planet.name as keyof typeof PLANET_SIGNIFICATIONS] || []

  // Generate interpretation text
  let interpretationText = ""

  if (strength === "exalted") {
    interpretationText = `Your ${planet.name} is exalted in ${planet.sign}, giving excellent results in areas of ${significations.join(", ")}.`
  } else if (strength === "own sign") {
    interpretationText = `Your ${planet.name} is in its own sign of ${planet.sign}, providing strong results in areas of ${significations.join(", ")}.`
  } else if (strength === "friendly") {
    interpretationText = `Your ${planet.name} is in a friendly sign of ${planet.sign}, giving good results in areas of ${significations.join(", ")}.`
  } else if (strength === "neutral") {
    interpretationText = `Your ${planet.name} is in ${planet.sign}, giving moderate results in areas of ${significations.join(", ")}.`
  } else if (strength === "debilitated") {
    interpretationText = `Your ${planet.name} is debilitated in ${planet.sign}, potentially challenging areas of ${significations.join(", ")}.`
  } else if (strength === "combust") {
    interpretationText = `Your ${planet.name} is combust (too close to the Sun), potentially weakening its influence over ${significations.join(", ")}.`
  }

  // Add details about house placement
  if (planet.house) {
    interpretationText += ` It is placed in the ${planet.house}${getOrdinalSuffix(planet.house)} house, influencing that area of life.`
  }

  // Add details about retrograde motion
  if (planet.isRetrograde) {
    interpretationText += ` It is retrograde, which can internalize or intensify its energy.`
  }

  return {
    planet: planet.name,
    sign: planet.sign,
    house: planet.house || 0,
    isRetrograde: planet.isRetrograde,
    strength,
    significations,
    interpretation: interpretationText,
  }
}

/**
 * Interprets a specific life area based on the chart
 */
function interpretLifeArea(area: keyof typeof LIFE_AREA_INDICATORS, chart: AstrologyChart): LifeAreaInterpretation {
  const indicators = LIFE_AREA_INDICATORS[area]
  const houses = indicators.houses
  const relevantPlanets = indicators.planets

  // Calculate overall strength for this life area
  let strengthScore = 0
  let maxScore = 0

  // Check house strengths
  houses.forEach((houseNum) => {
    const houseStrength = determineHouseStrength(houseNum, chart)
    maxScore += 2
    if (houseStrength === "strong") strengthScore += 2
    else if (houseStrength === "moderate") strengthScore += 1
  })

  // Check planet strengths
  relevantPlanets.forEach((planetName) => {
    const planet = chart.planets.find((p) => p.name === planetName)
    if (planet) {
      const planetStrength = determinePlanetStrength(planet)
      maxScore += 2
      if (planetStrength === "exalted" || planetStrength === "own sign") strengthScore += 2
      else if (planetStrength === "friendly" || planetStrength === "neutral") strengthScore += 1
    }
  })

  // Calculate percentage score
  const percentageScore = maxScore > 0 ? (strengthScore / maxScore) * 100 : 50

  // Determine overall strength
  let strength: "excellent" | "good" | "moderate" | "challenging" | "difficult"
  if (percentageScore >= 80) strength = "excellent"
  else if (percentageScore >= 60) strength = "good"
  else if (percentageScore >= 40) strength = "moderate"
  else if (percentageScore >= 20) strength = "challenging"
  else strength = "difficult"

  // Generate predictions based on strength
  let shortTermPrediction = ""
  let longTermPrediction = ""
  let currentDashaInfluence = ""

  // In a real implementation, you would check current dasha and upcoming transits
  // For now, we'll generate generic predictions based on strength

  switch (strength) {
    case "excellent":
      shortTermPrediction = `You are currently in a favorable period for ${area}. Opportunities are likely to come your way with minimal effort.`
      longTermPrediction = `Your chart indicates long-term success in ${area}. You have natural talents and supportive planetary energies in this area of life.`
      currentDashaInfluence = `Your current planetary period supports growth and achievement in ${area}.`
      break
    case "good":
      shortTermPrediction = `The coming months look promising for ${area}. With focused effort, you can achieve good results.`
      longTermPrediction = `Your chart shows good potential for ${area} over the long term. Consistent effort will yield positive results.`
      currentDashaInfluence = `Your current planetary period is generally supportive of your ${area} endeavors.`
      break
    case "moderate":
      shortTermPrediction = `You may experience mixed results in ${area} in the near future. Be prepared for both opportunities and challenges.`
      longTermPrediction = `Your chart indicates moderate potential in ${area}. Success will require dedicated effort and strategic timing.`
      currentDashaInfluence = `Your current planetary period brings both supportive and challenging influences to your ${area}.`
      break
    case "challenging":
      shortTermPrediction = `You may face some obstacles in ${area} in the coming months. Patience and persistence will be necessary.`
      longTermPrediction = `Your chart suggests that ${area} may be an area of growth through overcoming challenges. Extra effort and learning will be required.`
      currentDashaInfluence = `Your current planetary period may present challenges in ${area} that require adaptation and perseverance.`
      break
    case "difficult":
      shortTermPrediction = `This may be a testing period for ${area}. Focus on building foundations and learning from experiences rather than expecting immediate results.`
      longTermPrediction = `Your chart indicates that ${area} may be one of your life's lessons. Through overcoming significant challenges, you can develop strength and wisdom.`
      currentDashaInfluence = `Your current planetary period may bring significant tests in ${area}. Consider this a time for inner growth rather than external achievement.`
      break
  }

  // Generate remedial measures
  const remedialMeasures = generateRemedialMeasures(area, chart)

  return {
    area: area,
    houses: houses,
    planets: relevantPlanets,
    strength,
    currentDashaInfluence,
    shortTermPrediction,
    longTermPrediction,
    remedialMeasures,
  }
}

/**
 * Interprets the current dasha (planetary period)
 */
function interpretCurrentDasha(chart: AstrologyChart): DashaInterpretation {
  // Get current dasha (first in the list)
  const currentDasha = chart.dashas[0]

  if (!currentDasha) {
    return {
      planet: "Unknown",
      period: "Unknown",
      influence: "Dasha information not available",
      favorableAreas: [],
      challengingAreas: [],
      prediction: "Unable to make predictions without dasha information",
    }
  }

  const dashaPlanet = currentDasha.planet
  const from = new Date(currentDasha.from)
  const to = new Date(currentDasha.to)

  // Format period string
  const period = `${from.toLocaleDateString()} to ${to.toLocaleDateString()}`

  // Determine favorable and challenging areas based on the planet
  let favorableAreas: string[] = []
  let challengingAreas: string[] = []

  // This is a simplified version - in a real implementation, you would check:
  // 1. The house placement of the dasha lord
  // 2. Aspects to and from the dasha lord
  // 3. The strength of the dasha lord

  switch (dashaPlanet) {
    case "Sun":
      favorableAreas = ["Career", "Authority", "Government service", "Father relationships"]
      challengingAreas = ["Partnerships", "Ego conflicts", "Health (heart, eyes)"]
      break
    case "Moon":
      favorableAreas = ["Emotions", "Public life", "Mother relationships", "Travel"]
      challengingAreas = ["Mental stability", "Home changes", "Fluctuating circumstances"]
      break
    case "Mars":
      favorableAreas = ["Competition", "Physical strength", "Property", "Technical skills"]
      challengingAreas = ["Conflicts", "Accidents", "Impulsive decisions", "Siblings"]
      break
    case "Mercury":
      favorableAreas = ["Communication", "Business", "Education", "Travel"]
      challengingAreas = ["Overthinking", "Nervousness", "Skin issues"]
      break
    case "Jupiter":
      favorableAreas = ["Education", "Children", "Spirituality", "Wealth", "Marriage"]
      challengingAreas = ["Overindulgence", "Liver issues", "Excessive optimism"]
      break
    case "Venus":
      favorableAreas = ["Relationships", "Arts", "Luxury", "Comforts", "Vehicles"]
      challengingAreas = ["Overattachment", "Sensual indulgence", "Reproductive health"]
      break
    case "Saturn":
      favorableAreas = ["Discipline", "Long-term projects", "Service", "Spiritual growth"]
      challengingAreas = ["Delays", "Obstacles", "Joints/bones", "Isolation"]
      break
    case "Rahu":
      favorableAreas = ["Innovation", "Foreign connections", "Unconventional paths", "Material growth"]
      challengingAreas = ["Obsessions", "Confusion", "Deception", "Nervous disorders"]
      break
    case "Ketu":
      favorableAreas = ["Spiritual growth", "Research", "Liberation", "Healing abilities"]
      challengingAreas = ["Isolation", "Confusion", "Losses", "Detachment"]
      break
    default:
      favorableAreas = ["Unknown"]
      challengingAreas = ["Unknown"]
  }

  // Generate prediction text
  const prediction = `You are currently in the ${dashaPlanet} Mahadasha until ${to.toLocaleDateString()}. This period tends to emphasize ${favorableAreas.join(", ")} in your life, while potentially challenging areas include ${challengingAreas.join(", ")}. The specific effects will be modified by the sub-periods (Bhukti) within this main period.`

  return {
    planet: dashaPlanet,
    period,
    influence: `${dashaPlanet} energy dominates this period of your life`,
    favorableAreas,
    challengingAreas,
    prediction,
  }
}

/**
 * Generates remedial measures based on chart analysis
 */
function generateRemedialMeasures(area: keyof typeof LIFE_AREA_INDICATORS, chart: AstrologyChart): string[] {
  const measures: string[] = []
  const indicators = LIFE_AREA_INDICATORS[area]
  const relevantPlanets = indicators.planets

  // Find weak planets that need strengthening
  relevantPlanets.forEach((planetName) => {
    const planet = chart.planets.find((p) => p.name === planetName)
    if (planet) {
      const strength = determinePlanetStrength(planet)

      if (strength === "debilitated" || strength === "combust") {
        // This planet needs significant strengthening
        const remedies = REMEDIAL_MEASURES[planetName as keyof typeof REMEDIAL_MEASURES]

        if (remedies) {
          // Gemstone recommendation
          if (remedies.gemstones && remedies.gemstones.length > 0) {
            measures.push(`Consider wearing a ${remedies.gemstones[0]} to strengthen ${planetName}`)
          }

          // Mantra recommendation
          if (remedies.mantras && remedies.mantras.length > 0) {
            measures.push(`Recite "${remedies.mantras[0]}" mantra on ${remedies.day}s to strengthen ${planetName}`)
          }

          // Charity recommendation
          if (remedies.charity && remedies.charity.length > 0) {
            measures.push(`Donate ${remedies.charity[0]} on ${remedies.day}s to strengthen ${planetName}`)
          }
        }
      } else if (strength === "neutral" || strength === "friendly") {
        // This planet could use some moderate strengthening
        const remedies = REMEDIAL_MEASURES[planetName as keyof typeof REMEDIAL_MEASURES]

        if (remedies) {
          // Choose one remedy type
          if (remedies.mantras && remedies.mantras.length > 0) {
            measures.push(`Recite "${remedies.mantras[0]}" mantra to enhance ${planetName}'s influence`)
          }
        }
      }
    }
  })

  // If no specific remedies were found, add general ones
  if (measures.length === 0) {
    switch (area) {
      case "career":
        measures.push("Offer water to the Sun on Sunday mornings")
        measures.push("Wear red or orange colors to strengthen your professional presence")
        break
      case "wealth":
        measures.push("Feed yellow sweets to children on Thursdays")
        measures.push("Keep a clean and well-maintained money storage area in your home")
        break
      case "relationships":
        measures.push("Wear white clothes on Fridays")
        measures.push("Offer white flowers to Venus on Friday mornings")
        break
      case "health":
        measures.push("Practice pranayama (breathing exercises) daily")
        measures.push("Drink water stored in a copper vessel")
        break
      case "education":
        measures.push("Study during the Brahma Muhurta (early morning hours)")
        measures.push("Recite Saraswati mantras before studying")
        break
      case "children":
        measures.push("Feed cows on Thursdays")
        measures.push("Worship Lord Ganesha regularly")
        break
      case "travel":
        measures.push("Recite travel protection mantras before journeys")
        measures.push("Carry a small Mercury yantra when traveling")
        break
      case "spirituality":
        measures.push("Meditate during sunrise or sunset")
        measures.push("Practice selfless service (seva)")
        break
      default:
        measures.push("Practice gratitude daily")
        measures.push("Maintain a regular spiritual practice")
    }
  }

  return measures
}

/**
 * Generates a complete interpretation of the birth chart
 */
export function interpretChart(chart: AstrologyChart, birthDetails: BirthDetails): ChartInterpretation {
  try {
    // Interpret ascendant
    const ascendantSign = chart.ascendant.sign
    const ascendantNakshatra = chart.ascendant.nakshatra

    // Adds the typical Lagna (ascendant) and Nakshatra qualities
    const ascendantInterpretation = `Your ascendant (Lagna) is in ${ascendantSign}, in ${ascendantNakshatra} Nakshatra. This forms the foundation of your chart and significantly influences your physical appearance, personality, and overall approach to life. ${SIGN_QUALITIES[ascendantSign as keyof typeof SIGN_QUALITIES]?.join(", ") || ""} are key qualities in your nature.`

    // Interpret houses
    const houseInterpretations: HouseInterpretation[] = []
    for (let i = 1; i <= 12; i++) {
      try {
        houseInterpretations.push(interpretHouse(i, chart))
      } catch (error) {
        console.error(`Error interpreting house ${i}:`, error)
        // Add a placeholder interpretation
        houseInterpretations.push({
          house: i,
          area: HOUSE_SIGNIFICATIONS[i as keyof typeof HOUSE_SIGNIFICATIONS]?.[0] || `House ${i}`,
          strength: "moderate",
          occupants: [],
          aspects: [],
          significators: HOUSE_SIGNIFICATIONS[i as keyof typeof HOUSE_SIGNIFICATIONS] || [],
          interpretation: `House ${i} represents ${HOUSE_SIGNIFICATIONS[i as keyof typeof HOUSE_SIGNIFICATIONS]?.[0] || "various aspects of life"}.`,
        })
      }
    }

    // Interpret planets
    const planetInterpretations: PlanetInterpretation[] = []
    for (const planet of chart.planets) {
      try {
        planetInterpretations.push(interpretPlanet(planet))
      } catch (error) {
        console.error(`Error interpreting planet ${planet.name}:`, error)
        // Add a placeholder interpretation
        planetInterpretations.push({
          planet: planet.name,
          sign: planet.sign,
          house: planet.house || 0,
          isRetrograde: planet.isRetrograde,
          strength: "neutral",
          significations: PLANET_SIGNIFICATIONS[planet.name as keyof typeof PLANET_SIGNIFICATIONS] || [],
          interpretation: `${planet.name} is in ${planet.sign}.`,
        })
      }
    }

    // Interpret life areas
    const lifeAreaInterpretations: LifeAreaInterpretation[] = []
    for (const area of Object.keys(LIFE_AREA_INDICATORS)) {
      try {
        lifeAreaInterpretations.push(interpretLifeArea(area as keyof typeof LIFE_AREA_INDICATORS, chart))
      } catch (error) {
        console.error(`Error interpreting life area ${area}:`, error)
        // Add a placeholder interpretation
        lifeAreaInterpretations.push({
          area: area,
          houses: LIFE_AREA_INDICATORS[area as keyof typeof LIFE_AREA_INDICATORS].houses,
          planets: LIFE_AREA_INDICATORS[area as keyof typeof LIFE_AREA_INDICATORS].planets,
          strength: "moderate",
          currentDashaInfluence: "The current planetary period has mixed influences on this area.",
          shortTermPrediction: "Short-term results may vary.",
          longTermPrediction: "Long-term potential depends on your efforts and choices.",
          remedialMeasures: ["Practice regular spiritual discipline"],
        })
      }
    }

    // Interpret current dasha
    let currentDashaInterpretation: DashaInterpretation
    try {
      currentDashaInterpretation = interpretCurrentDasha(chart)
    } catch (error) {
      console.error("Error interpreting current dasha:", error)
      // Add a placeholder interpretation
      currentDashaInterpretation = {
        planet: chart.dashas[0]?.planet || "Unknown",
        period: "Current period",
        influence: "This planetary period influences various aspects of your life.",
        favorableAreas: ["Personal growth"],
        challengingAreas: ["Patience"],
        prediction: "This period offers opportunities for growth through various experiences.",
      }
    }

    // Interpret upcoming dasha
    let upcomingDashaInterpretation: DashaInterpretation
    try {
      upcomingDashaInterpretation =
        chart.dashas.length > 1
          ? interpretCurrentDasha({ ...chart, dashas: [chart.dashas[1]] })
          : currentDashaInterpretation
    } catch (error) {
      console.error("Error interpreting upcoming dasha:", error)
      upcomingDashaInterpretation = currentDashaInterpretation
    }

    // Generate overall remedial measures
    const remedialMeasures: string[] = []

    // Collect unique remedial measures from all life areas
    lifeAreaInterpretations.forEach((area) => {
      area.remedialMeasures.forEach((measure) => {
        if (!remedialMeasures.includes(measure)) {
          remedialMeasures.push(measure)
        }
      })
    })

    // Generate overview text
    const overview = `This Vedic astrological analysis is based on your birth details: ${birthDetails.name || "Native"} born on ${new Date(chart.native.birthDate).toLocaleDateString()} at ${new Date(chart.native.birthDate).toLocaleTimeString()} in ${birthDetails.city}, ${birthDetails.country}. Your ascendant is ${ascendantSign}, and you are currently in the ${currentDashaInterpretation.planet} Mahadasha. This chart reveals your potentials, challenges, and the timing of various life events according to Vedic astrology principles.`

    return {
      overview,
      ascendant: {
        sign: ascendantSign,
        interpretation: ascendantInterpretation,
      },
      houses: houseInterpretations,
      planets: planetInterpretations,
      lifeAreas: lifeAreaInterpretations,
      currentDasha: currentDashaInterpretation,
      upcomingDasha: upcomingDashaInterpretation,
      remedialMeasures,
    }
  } catch (error) {
    console.error("Error in chart interpretation:", error)
    // Return a simplified interpretation to avoid breaking the application
    return {
      overview: `Birth chart analysis for ${birthDetails.name || "Native"} born on ${birthDetails.date} at ${birthDetails.time} in ${birthDetails.city}, ${birthDetails.country}.`,
      ascendant: {
        sign: chart.ascendant.sign,
        interpretation: `Your ascendant is in ${chart.ascendant.sign}.`,
      },
      houses: [],
      planets: [],
      lifeAreas: [],
      currentDasha: {
        planet: chart.dashas[0]?.planet || "Unknown",
        period: "Current period",
        influence: "This planetary period influences various aspects of your life.",
        favorableAreas: [],
        challengingAreas: [],
        prediction: "This period offers opportunities for growth through various experiences.",
      },
      upcomingDasha: {
        planet: chart.dashas[1]?.planet || "Unknown",
        period: "Upcoming period",
        influence: "This planetary period will influence various aspects of your life.",
        favorableAreas: [],
        challengingAreas: [],
        prediction: "This period will offer opportunities for growth through various experiences.",
      },
      remedialMeasures: ["Regular spiritual practice", "Maintain a positive attitude"],
    }
  }
}

/**
 * Interprets the hierarchical dasha periods
 */
export function interpretHierarchicalDashas(
  chart: AstrologyChart,
  date: Date = new Date(),
): {
  activePeriods: HierarchicalDashaPeriod[]
  interpretation: string
  nextTransition: { date: Date; level: string } | null
  inSandhi: { isInSandhi: boolean; level?: string; percentComplete?: number }
} {
  if (!chart.hierarchicalDashas || chart.hierarchicalDashas.length === 0) {
    return {
      activePeriods: [],
      interpretation: "Dasha information not available.",
      nextTransition: null,
      inSandhi: { isInSandhi: false },
    }
  }

  // Find active periods at all levels
  const activePeriods = findActiveDashaPeriodsAtDate(chart.hierarchicalDashas, date, 5)

  if (activePeriods.length === 0) {
    return {
      activePeriods: [],
      interpretation: "No active dasha periods found for the given date.",
      nextTransition: null,
      inSandhi: { isInSandhi: false },
    }
  }

  // Check if we're in a dasha sandhi (transition period)
  const sandhiInfo = isInDashaSandhi(activePeriods, date)

  // Get the next transition
  const nextTransition = getNextDashaTransition(activePeriods)

  // Generate interpretation text
  let interpretationText = ""

  // Mahadasha interpretation
  if (activePeriods.length > 0) {
    const mahadasha = activePeriods[0]
    interpretationText += `You are currently in the ${mahadasha.planet} Mahadasha, which began on ${mahadasha.from.toLocaleDateString()} and will continue until ${mahadasha.to.toLocaleDateString()}. `

    // Add planet-specific interpretation
    interpretationText += getPlanetDashaInterpretation(mahadasha.planet, "mahadasha")
  }

  // Antardasha interpretation
  if (activePeriods.length > 1) {
    const antardasha = activePeriods[1]
    interpretationText += `\n\nWithin this, you are in the ${antardasha.planet} Antardasha (sub-period), which began on ${antardasha.from.toLocaleDateString()} and will continue until ${antardasha.to.toLocaleDateString()}. `

    // Add combined interpretation of Mahadasha-Antardasha
    interpretationText += getCombinedDashaInterpretation(activePeriods[0].planet, antardasha.planet, "antardasha")
  }

  // Pratyantardasha interpretation (if available)
  if (activePeriods.length > 2) {
    const pratyantardasha = activePeriods[2]
    interpretationText += `\n\nMore specifically, you are in the ${pratyantardasha.planet} Pratyantardasha (sub-sub-period), which began on ${pratyantardasha.from.toLocaleDateString()} and will continue until ${pratyantardasha.to.toLocaleDateString()}. `

    // Add finer details for this specific combination
    interpretationText += getDetailedDashaCombinationEffect(
      activePeriods[0].planet,
      activePeriods[1].planet,
      pratyantardasha.planet,
    )
  }

  // Add information about transition periods
  if (sandhiInfo.isInSandhi) {
    interpretationText += `\n\nYou are currently in a dasha sandhi (transition period) at the ${sandhiInfo.level} level. This is a time of change and adjustment as the influence of one planet gives way to another. Transition periods can bring both challenges and opportunities as energies shift.`
  }

  // Add information about upcoming transitions
  if (nextTransition) {
    const daysUntilTransition = Math.ceil((nextTransition.date.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    interpretationText += `\n\nYour next dasha transition will occur on ${nextTransition.date.toLocaleDateString()} (in ${daysUntilTransition} days) at the ${nextTransition.level} level.`
  }

  return {
    activePeriods,
    interpretation: interpretationText,
    nextTransition,
    inSandhi: sandhiInfo,
  }
}

/**
 * Helper function to get planet-specific dasha interpretations
 */
function getPlanetDashaInterpretation(planet: string, level: string): string {
  const interpretations: Record<string, string> = {
    Sun: "This period generally brings focus on authority, leadership, government connections, and father figures. It can enhance your vitality, confidence, and recognition from authority figures.",

    Moon: "This period often brings emotional fluctuations, public recognition, maternal connections, and changes in home and family life. Your intuition and emotional intelligence are heightened during this time.",

    Mars: "This period typically brings energy, courage, competition, and technical abilities to the forefront. It can be a time of action, initiative, and sometimes conflicts or accidents that ultimately lead to growth.",

    Mercury:
      "This period emphasizes communication, intellect, education, and business acumen. It's favorable for learning new skills, writing, teaching, and commercial ventures.",

    Jupiter:
      "This period generally brings expansion, wisdom, higher education, and spiritual growth. It's often considered one of the most favorable periods, bringing opportunities for growth and prosperity.",

    Venus:
      "This period highlights relationships, luxury, comforts, arts, and sensual pleasures. It's generally favorable for marriage, partnerships, and enjoying the finer things in life.",

    Saturn:
      "This period brings discipline, responsibility, hard work, and sometimes delays or obstacles that ultimately lead to lasting achievements. It can be challenging but builds character and endurance.",

    Rahu: "This period often brings unconventional experiences, foreign connections, sudden changes, and material growth. It can be unpredictable but often brings innovation and breaking of old patterns.",

    Ketu: "This period emphasizes spiritual growth, detachment, liberation from material concerns, and sometimes separation or loss that ultimately leads to spiritual insight.",
  }

  return (
    interpretations[planet] ||
    `The ${planet} ${level} brings its characteristic influences to your life during this period.`
  )
}

/**
 * Helper function to get combined dasha interpretations
 */
function getCombinedDashaInterpretation(majorPlanet: string, subPlanet: string, level: string): string {
  // This is a simplified version - in a real implementation, you would have specific interpretations
  // for each possible combination of planets

  // Check for friendly combinations
  const friendlyPairs = [
    ["Sun", "Moon"],
    ["Sun", "Mars"],
    ["Sun", "Jupiter"],
    ["Moon", "Mercury"],
    ["Moon", "Venus"],
    ["Mars", "Jupiter"],
    ["Mars", "Sun"],
    ["Mercury", "Venus"],
    ["Mercury", "Saturn"],
    ["Jupiter", "Sun"],
    ["Jupiter", "Moon"],
    ["Jupiter", "Mars"],
    ["Venus", "Mercury"],
    ["Venus", "Saturn"],
    ["Saturn", "Mercury"],
    ["Saturn", "Venus"],
  ]

  // Check for challenging combinations
  const challengingPairs = [
    ["Sun", "Saturn"],
    ["Sun", "Venus"],
    ["Moon", "Saturn"],
    ["Moon", "Rahu"],
    ["Mars", "Saturn"],
    ["Mars", "Venus"],
    ["Saturn", "Sun"],
    ["Saturn", "Moon"],
    ["Saturn", "Mars"],
  ]

  const isFriendly = friendlyPairs.some(
    (pair) => (pair[0] === majorPlanet && pair[1] === subPlanet) || (pair[1] === majorPlanet && pair[0] === subPlanet),
  )

  const isChallenging = challengingPairs.some(
    (pair) => (pair[0] === majorPlanet && pair[1] === subPlanet) || (pair[1] === majorPlanet && pair[0] === subPlanet),
  )

  if (isFriendly) {
    return `The combination of ${majorPlanet} and ${subPlanet} is generally favorable. During this ${level}, you may experience positive developments related to both planets' significations.`
  } else if (isChallenging) {
    return `The combination of ${majorPlanet} and ${subPlanet} can present some challenges. During this ${level}, you may need to navigate tensions between the energies these planets represent.`
  } else {
    return `The ${subPlanet} ${level} within the ${majorPlanet} Mahadasha brings a mixed influence, with the characteristics of both planets affecting your life during this period.`
  }
}

/**
 * Helper function to get detailed three-level dasha combination effects
 */
function getDetailedDashaCombinationEffect(majorPlanet: string, subPlanet: string, subSubPlanet: string): string {
  // This would ideally contain specific interpretations for each possible three-planet combination
  // For now, we'll provide a generic interpretation based on the nature of the sub-sub planet

  const benefics = ["Jupiter", "Venus", "Mercury", "Moon"]
  const malefics = ["Saturn", "Mars", "Rahu", "Ketu", "Sun"]

  const isBenefic = benefics.includes(subSubPlanet)
  const isMalefic = malefics.includes(subSubPlanet)

  if (isBenefic) {
    return `The ${subSubPlanet} Pratyantardasha brings a generally positive influence within the larger ${majorPlanet}-${subPlanet} period. This can be a favorable time for matters related to ${getKeySignifications(subSubPlanet)}.`
  } else if (isMalefic) {
    return `The ${subSubPlanet} Pratyantardasha brings some intensity or challenges within the larger ${majorPlanet}-${subPlanet} period. Pay attention to matters related to ${getKeySignifications(subSubPlanet)} during this time.`
  } else {
    return `This specific combination of ${majorPlanet}, ${subPlanet}, and ${subSubPlanet} creates a unique influence in your life right now, affecting areas related to all three planets.`
  }
}

/**
 * Helper function to get key significations of planets
 */
function getKeySignifications(planet: string): string {
  const significations: Record<string, string> = {
    Sun: "authority, vitality, father figures, and government",
    Moon: "emotions, mother, public life, and home",
    Mars: "courage, brothers, property, and technical skills",
    Mercury: "communication, education, business, and analytical thinking",
    Jupiter: "wisdom, children, wealth, and spirituality",
    Venus: "relationships, luxury, vehicles, and arts",
    Saturn: "discipline, career, longevity, and delays",
    Rahu: "ambition, foreign matters, innovation, and obsession",
    Ketu: "spirituality, liberation, technical skills, and separation",
  }

  return significations[planet] || planet
}

/**
 * Helper function to get dasha effects for specific life areas
 */
function getDashaEffectsForLifeArea(
  activePeriods: HierarchicalDashaPeriod[],
  lifeArea: keyof typeof LIFE_AREA_INDICATORS,
): string {
  if (activePeriods.length === 0) return ""

  const mahadasha = activePeriods[0]
  const antardasha = activePeriods.length > 1 ? activePeriods[1] : null
  const pratyantardasha = activePeriods.length > 2 ? activePeriods[2] : null

  // Get relevant planets for this life area
  const relevantPlanets = LIFE_AREA_INDICATORS[lifeArea].planets
  const subcategories = LIFE_AREA_INDICATORS[lifeArea].subcategories || []

  let effectText = ""

  // Check if any of the active dasha lords are significant for this life area
  const significantLords = activePeriods.filter((period) => relevantPlanets.includes(period.planet))

  if (significantLords.length > 0) {
    effectText += `\n\nYour current ${significantLords.map((p) => `${p.planet} ${p.level}`).join(" and ")} directly influence ${lifeArea} in your chart, as ${significantLords.length > 1 ? "these are" : "this is"} key planetary energy for this area of life.`

    // Add information about specific subcategories affected
    if (subcategories.length > 0) {
      // Select 2-3 relevant subcategories based on the dasha planets
      const relevantSubcategories = subcategories.slice(0, 3)
      effectText += `\n\nDuring this period, pay particular attention to: ${relevantSubcategories.join(", ")}.`
    }
  }

  // Add specific effects based on the combination of planets
  switch (lifeArea) {
    case "career":
      if (mahadasha.planet === "Sun" || mahadasha.planet === "Saturn" || mahadasha.planet === "Mars") {
        effectText += `\n\nThe ${mahadasha.planet} Mahadasha is particularly significant for your career, bringing focus to authority, responsibility, and action in your professional life.`
      }

      if (antardasha && (antardasha.planet === "Jupiter" || antardasha.planet === "Mercury")) {
        effectText += `\n\nThe ${antardasha.planet} Antardasha supports career growth through expansion of knowledge, communication skills, and opportunities for advancement.`
      }
      break

    case "wealth":
      if (mahadasha.planet === "Jupiter" || mahadasha.planet === "Venus" || mahadasha.planet === "Mercury") {
        effectText += `\n\nThe ${mahadasha.planet} Mahadasha generally supports financial growth and prosperity, especially when you align with this planet's energy.`
      }

      if (antardasha && antardasha.planet === "Saturn") {
        effectText += `\n\nThe Saturn Antardasha brings a focus on long-term financial planning and discipline in money matters.`
      }
      break

    case "relationships":
      if (mahadasha.planet === "Venus" || mahadasha.planet === "Jupiter" || mahadasha.planet === "Moon") {
        effectText += `\n\nThe ${mahadasha.planet} Mahadasha is generally supportive for relationships and partnerships, bringing harmony and growth in this area.`
      }

      if (antardasha && (antardasha.planet === "Saturn" || antardasha.planet === "Rahu")) {
        effectText += `\n\nThe ${antardasha.planet} Antardasha may bring some challenges or transformations in relationships, requiring patience and deeper understanding.`
      }
      break

    case "health":
      if (mahadasha.planet === "Sun" || mahadasha.planet === "Moon" || mahadasha.planet === "Mars") {
        effectText += `\n\nThe ${mahadasha.planet} Mahadasha has a direct influence on your vitality and physical well-being.`
      }
      break

    case "spirituality":
      if (mahadasha.planet === "Jupiter" || mahadasha.planet === "Ketu") {
        effectText += `\n\nThe ${mahadasha.planet} Mahadasha is particularly supportive for spiritual growth and deeper understanding of life's purpose.`
      }
      break

    case "personalDevelopment":
      if (mahadasha.planet === "Sun" || mahadasha.planet === "Jupiter") {
        effectText += `\n\nThe ${mahadasha.planet} Mahadasha supports personal growth, self-awareness, and the development of your authentic identity.`
      }
      break

    case "creativity":
      if (mahadasha.planet === "Venus" || mahadasha.planet === "Mercury" || mahadasha.planet === "Moon") {
        effectText += `\n\nThe ${mahadasha.planet} Mahadasha enhances your creative expression, artistic abilities, and innovative thinking.`
      }
      break

    case "intellectualLife":
      if (mahadasha.planet === "Mercury" || mahadasha.planet === "Jupiter") {
        effectText += `\n\nThe ${mahadasha.planet} Mahadasha stimulates intellectual growth, learning, and the expansion of knowledge.`
      }
      break

    case "socialLife":
      if (mahadasha.planet === "Venus" || mahadasha.planet === "Mercury" || mahadasha.planet === "Jupiter") {
        effectText += `\n\nThe ${mahadasha.planet} Mahadasha enhances your social connections, community involvement, and group activities.`
      }
      break

    case "homeLife":
      if (mahadasha.planet === "Moon" || mahadasha.planet === "Venus") {
        effectText += `\n\nThe ${mahadasha.planet} Mahadasha brings focus to your home environment, family relationships, and sense of belonging.`
      }
      break

    case "legacy":
      if (mahadasha.planet === "Sun" || mahadasha.planet === "Jupiter" || mahadasha.planet === "Saturn") {
        effectText += `\n\nThe ${mahadasha.planet} Mahadasha brings attention to your life purpose, long-term impact, and the legacy you're creating.`
      }
      break

    case "timeManagement":
      if (mahadasha.planet === "Saturn" || mahadasha.planet === "Mercury") {
        effectText += `\n\nThe ${mahadasha.planet} Mahadasha influences your relationship with time, organizational abilities, and life rhythm.`
      }
      break
  }

  // Add timing information
  if (pratyantardasha) {
    const daysRemaining = Math.ceil((pratyantardasha.to.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    effectText += `\n\nThe current ${pratyantardasha.planet} Pratyantardasha will last for approximately ${daysRemaining} more days, bringing its specific influence to this area of your life.`
  } else if (antardasha) {
    const daysRemaining = Math.ceil((antardasha.to.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    effectText += `\n\nThe current ${antardasha.planet} Antardasha will last for approximately ${daysRemaining} more days (about ${Math.round(daysRemaining / 30)} months), shaping this period of your life.`
  }

  return effectText
}

/**
 * Generates a personalized prompt for Guruji based on the birth chart and query
 */
export function generateGurujiInterpretationPrompt(
  birthDetails: BirthDetails,
  chartData: AstrologyChart,
  query?: string,
): string {
  try {
    // Interpret the chart
    const interpretation = interpretChart(chartData, birthDetails)

    // Get enhanced dasha interpretations
    const dashaInterpretation = interpretHierarchicalDashas(chartData)

    // Determine the focus area of the query if provided
    let focusArea: keyof typeof LIFE_AREA_INDICATORS | null = null
    let specificResponse = ""

    // Check if query is specifically about dashas/timing
    const isDashaQuery = query
      ? query.includes("dasha") ||
        query.includes("period") ||
        query.includes("timeline") ||
        query.includes("when") ||
        query.includes("future") ||
        query.includes("timing")
      : false

    if (query) {
      // Check which life area the query relates to
      if (query.includes("career") || query.includes("job") || query.includes("profession") || query.includes("work")) {
        focusArea = "careerProfessional"
      } else if (
        query.includes("money") ||
        query.includes("wealth") ||
        query.includes("finance") ||
        query.includes("income")
      ) {
        focusArea = "financialWellbeing"
      } else if (
        query.includes("marriage") ||
        query.includes("relationship") ||
        query.includes("partner") ||
        query.includes("spouse")
      ) {
        focusArea = "personalRelationships"
      } else if (
        query.includes("health") ||
        query.includes("illness") ||
        query.includes("disease") ||
        query.includes("body")
      ) {
        focusArea = "healthWellbeing"
      } else if (
        query.includes("education") ||
        query.includes("study") ||
        query.includes("learn") ||
        query.includes("school")
      ) {
        focusArea = "intellectualLife"
      } else if (
        query.includes("children") ||
        query.includes("child") ||
        query.includes("kids") ||
        query.includes("family")
      ) {
        focusArea = "personalRelationships" // Considering family relationships
      } else if (
        query.includes("travel") ||
        query.includes("journey") ||
        query.includes("abroad") ||
        query.includes("foreign")
      ) {
        focusArea = "adventureTravel"
      } else if (
        query.includes("spiritual") ||
        query.includes("purpose") ||
        query.includes("meaning") ||
        query.includes("dharma")
      ) {
        focusArea = "spiritualLife"
      } else if (
        query.includes("growth") ||
        query.includes("development") ||
        query.includes("self") ||
        query.includes("personal")
      ) {
        focusArea = "personalDevelopment"
      } else if (
        query.includes("creative") ||
        query.includes("art") ||
        query.includes("expression") ||
        query.includes("talent")
      ) {
        focusArea = "creativitySelfExpression"
      } else if (
        query.includes("intellect") ||
        query.includes("thinking") ||
        query.includes("mind") ||
        query.includes("knowledge")
      ) {
        focusArea = "intellectualLife"
      } else if (
        query.includes("social") ||
        query.includes("friends") ||
        query.includes("community") ||
        query.includes("network")
      ) {
        focusArea = "socialLifeCommunity"
      } else if (
        query.includes("home") ||
        query.includes("house") ||
        query.includes("living") ||
        query.includes("domestic")
      ) {
        focusArea = "homeLivingEnvironment"
      } else if (
        query.includes("legacy") ||
        query.includes("impact") ||
        query.includes("contribution") ||
        query.includes("mission")
      ) {
        focusArea = "legacyLifePurpose"
      } else if (
        query.includes("time") ||
        query.includes("balance") ||
        query.includes("schedule") ||
        query.includes("productivity")
      ) {
        focusArea = "timeManagementBalance"
      } else if (isDashaQuery) {
        // If the query is about dashas or timing, we'll focus on the dasha interpretation
        specificResponse = `Your question relates to timing and planetary periods.\n\n${dashaInterpretation.interpretation}`

        // Add information about dasha sandhi if applicable
        if (dashaInterpretation.inSandhi.isInSandhi) {
          specificResponse += `\n\nImportantly, you are currently in a dasha sandhi (transition period) at the ${dashaInterpretation.inSandhi.level} level. This is approximately ${Math.round(dashaInterpretation.inSandhi.percentComplete || 0)}% complete. Sandhi periods are times of significant change as one planetary influence gives way to another. They often bring both closure to previous themes and the seeds of new beginnings.`
        }

        // Add information about upcoming transitions
        if (dashaInterpretation.nextTransition) {
          const daysUntil = Math.ceil(
            (dashaInterpretation.nextTransition.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
          )
          specificResponse += `\n\nYour next significant dasha transition will occur on ${dashaInterpretation.nextTransition.date.toLocaleDateString()} (in ${daysUntil} days) at the ${dashaInterpretation.nextTransition.level} level. This will mark a shift in the planetary energies influencing your life.`
        }

        // Add remedial measures specific to current dasha lords
        specificResponse += `\n\nRemedial measures for your current dasha combination:`

        dashaInterpretation.activePeriods.forEach((period) => {
          const remedies = REMEDIAL_MEASURES[period.planet as keyof typeof REMEDIAL_MEASURES]
          if (remedies) {
            specificResponse += `\n- For ${period.planet} (${period.level}): `

            if (remedies.mantras && remedies.mantras.length > 0) {
              specificResponse += `Recite "${remedies.mantras[0]}" on ${remedies.day}s. `
            }

            if (remedies.gemstones && remedies.gemstones.length > 0) {
              specificResponse += `Consider wearing ${remedies.gemstones[0]}. `
            }

            if (remedies.charity && remedies.charity.length > 0) {
              specificResponse += `Donate ${remedies.charity[0]} to strengthen this influence.`
            }
          }
        })
      }

      // Generate a specific response for the focus area if identified
      if (focusArea) {
        specificResponse = `Your question relates to ${focusArea}. Based on your chart, this area shows both potentials and challenges that can be navigated with awareness and effort.`

        // Add dasha-specific information for this life area
        specificResponse += `\n\nConsidering your current planetary periods (${dashaInterpretation.activePeriods.map((p) => p.planet).join("-")}), this is how they affect your ${focusArea}:`

        // Add specific effects based on the active dashas and life area
        specificResponse += getDashaEffectsForLifeArea(dashaInterpretation.activePeriods, focusArea)

        // Add information about upcoming transitions relevant to this area
        if (dashaInterpretation.nextTransition) {
          specificResponse += `\n\nYour next dasha transition on ${dashaInterpretation.nextTransition.date.toLocaleDateString()} may bring changes to this area of life, as planetary influences shift.`
        }
      }
    }

    // Format birth details
    const birthDateStr = new Date(chartData.native.birthDate).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    })

    // Format ascendant details
    const ascendantDetails = `Lagna (Ascendant): ${chartData.ascendant.sign} at ${chartData.ascendant.longitude.toFixed(2)}° in ${chartData.ascendant.nakshatra} Nakshatra, Pada ${chartData.ascendant.nakshatraPada}`

    // Format planetary positions
    const planetaryPositions = chartData.planets
      .map((planet) => {
        return `${planet.name}: ${planet.sign} at ${planet.longitude.toFixed(2)}° in ${planet.nakshatra} Nakshatra, Pada ${planet.nakshatraPada}${planet.isRetrograde ? " (Retrograde)" : ""}, in House ${planet.house}`
      })
      .join("\n")

    // Format current dasha hierarchy in detail
    let dashaHierarchyStr = ""
    if (dashaInterpretation.activePeriods.length > 0) {
      dashaHierarchyStr = dashaInterpretation.activePeriods
        .map((period, index) => {
          const indent = "  ".repeat(index)
          const fromDate = period.from.toLocaleDateString()
          const toDate = period.to.toLocaleDateString()
          const duration = period.duration
          return `${indent}${period.level.charAt(0).toUpperCase() + period.level.slice(1)}: ${period.planet} (${fromDate} to ${toDate}, ${duration})`
        })
        .join("\n")
    } else {
      dashaHierarchyStr = "Detailed dasha information not available"
    }

    // Format query context
    const queryContext = query
      ? `The person is asking about: ${query}`
      : "The person is seeking general astrological guidance"

    // Generate the complete prompt
    let prompt = `
You are Guruji, a 53-year-old Sanskrit scholar and Vedic astrologer from Varanasi. You are analyzing a birth chart with the following details:

BIRTH INFORMATION:
Name: ${birthDetails.name || "The native"}
Birth Date and Time: ${birthDateStr}
Birth Place: ${birthDetails.city || ""}, ${birthDetails.country || ""}
Coordinates: ${birthDetails.latitude}° N, ${birthDetails.longitude}° E
Timezone: ${birthDetails.timezone}

CHART DETAILS:
${ascendantDetails}

PLANETARY POSITIONS:
${planetaryPositions}

DASHA HIERARCHY (VIMSHOTTARI DASHA SYSTEM):
${dashaHierarchyStr}

DASHA TRANSITION INFORMATION:
${
  dashaInterpretation.inSandhi.isInSandhi
    ? `Currently in a dasha sandhi (transition period) at the ${dashaInterpretation.inSandhi.level} level, ${Math.round(dashaInterpretation.inSandhi.percentComplete || 0)}% complete.`
    : "Not currently in a dasha sandhi (transition period)."
}
${
  dashaInterpretation.nextTransition
    ? `Next transition: ${dashaInterpretation.nextTransition.date.toLocaleDateString()} (${dashaInterpretation.nextTransition.level} level)`
    : "No upcoming transitions in the near future."
}

DETAILED DASHA INTERPRETATION:
${dashaInterpretation.interpretation}

CHART INTERPRETATION OVERVIEW:
${interpretation.overview}

ASCENDANT INTERPRETATION:
${interpretation.ascendant.interpretation}

CURRENT DASHA INTERPRETATION:
${interpretation.currentDasha.prediction}

QUERY CONTEXT:
${queryContext}

`

    // Add specific response if available
    if (specificResponse) {
      prompt += `
SPECIFIC ANALYSIS FOR THIS QUERY:
${specificResponse}
`
    }

    // Add remedial measures
    if (interpretation.remedialMeasures.length > 0) {
      prompt += `
RECOMMENDED REMEDIAL MEASURES:
${interpretation.remedialMeasures.join("\n")}
`
    }

    // Add final instructions
    prompt += `
As Guruji, provide a Vedic astrological interpretation based on this chart. Incorporate Sanskrit terms where appropriate, and reference ancient texts when relevant. Your analysis should be insightful, respectful, and spiritually oriented. Avoid making extreme predictions about death, disease, or disaster. Focus on providing guidance that helps the person understand their karmic patterns and potential paths forward.

When discussing challenging planetary positions, always offer traditional remedies such as mantras, gemstones, or spiritual practices that might help balance these energies.

${
  focusArea
    ? `Focus your response primarily on the ${focusArea} area since that is what the person is asking about.`
    : isDashaQuery
      ? "Focus your response primarily on the dasha periods, their meanings, and timing of events since that is what the person is asking about."
      : "Provide a balanced overview of all life areas, with emphasis on the most significant aspects of the chart."
}

Remember to speak in Guruji's voice - wise and compassionate, and with occasional references to ancient wisdom.
`

    return prompt
  } catch (error) {
    console.error("Error generating Guruji prompt:", error)
    // Return a simplified prompt that will still work
    return `
You are Guruji, a 53-year-old Sanskrit scholar and Vedic astrologer from Varanasi. 

The person has provided their birth details: ${birthDetails.name || "The native"} born on ${birthDetails.date} at ${birthDetails.time} in ${birthDetails.city}, ${birthDetails.country}.

${query ? `They are asking about: ${query}` : "They are seeking general astrological guidance."}

As Guruji, provide a Vedic astrological interpretation. Incorporate Sanskrit terms where appropriate, and reference ancient texts when relevant. Your analysis should be insightful, respectful, and spiritually oriented.

Remember to speak in Guruji's voice - wise and compassionate, and with occasional references to ancient wisdom.
`
  }
}

/**
 * Helper function to interpret a specific life area query
 */
function interpretLifeAreaQuery(
  focusArea: keyof typeof LIFE_AREA_INDICATORS,
  query: string,
  chartData: AstrologyChart,
): string {
  const areaInfo = LIFE_AREA_INDICATORS[focusArea]

  // Find relevant subcategories based on the query
  const relevantSubcategories =
    areaInfo.subcategories?.filter(
      (subcategory) =>
        query.toLowerCase().includes(subcategory.toLowerCase().split(" ")[0]) ||
        query.toLowerCase().includes(subcategory.toLowerCase().split(" ")[1]),
    ) || []

  let response = `Your question relates to ${focusArea}. Based on your chart, this area shows both potentials and challenges that can be navigated with awareness and effort.`

  // Add subcategory-specific insights if found
  if (relevantSubcategories.length > 0) {
    response += `\n\nSpecifically, your query relates to aspects of ${focusArea} involving: ${relevantSubcategories.join(", ")}.`

    // Add house and planet information
    response += `\n\nIn Vedic astrology, these aspects are primarily governed by houses ${areaInfo.houses.join(", ")} and planets ${areaInfo.planets.join(", ")}.`
  }

  return response
}

// Make sure this is at the bottom of the file and properly exported
export { LIFE_AREA_INDICATORS }
