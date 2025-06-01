import type { AstrologyChart, BirthDetails } from "@/types/astrology"
import type { IntentAnalysisResult } from "./intent-analyzer"
import type { YogaResult } from "./yoga-analyzer"
import { analyzeUserIntent } from "./intent-analyzer"
import { analyzeYogas } from "./yoga-analyzer"
import { findAllActiveDashaPeriodsAtDate } from "./dasha-calculator"
import { getHouseLordPlacementSignificance } from "./planetary-analyzer"
import { logInfo, logDebug } from "@/lib/logging-service"

// Import planet house significance from astrology summary component
const PLANET_HOUSE_SIGNIFICANCE: Record<string, Record<number, string>> = {
  Sun: {
    1: "Strong willpower, leadership, authoritative personality. Weak Sun can cause low immunity or ego issues.",
    2: "Wealth through government/politics, strong speech, strained family ties.",
    3: "Courageous siblings, success in media/sports, short travels.",
    4: "Property disputes, strained mother relationship, frequent relocations.",
    5: "Intelligent children, leadership in creative fields, speculative gains.",
    6: "Victory over enemies, health-conscious, government job benefits.",
    7: "Dominant spouse, legal partnerships, possible divorce if afflicted.",
    8: "Longevity struggles, inheritance delays, interest in occult.",
    9: "Strong dharma, father's influence, foreign connections.",
    10: "Fame, political success, career recognition.",
    11: "Gains through authority figures, influential friends.",
    12: "Expenses on prestige, spiritual retreats, foreign stays."
  },
  Moon: {
    1: "Emotional, intuitive, fluctuating health (digestive issues).",
    2: "Wealth through liquids (milk, oil), sweet speech, family bonds.",
    3: "Creative siblings, writing talent, short journeys.",
    4: "Happy home, inheritance, strong motherly love.",
    5: "Fertility, artistic children, success in creative arts.",
    6: "Healing abilities, victory in disputes, dietary habits affect health.",
    7: "Attractive spouse, moody relationships, business partnerships.",
    8: "Emotional trauma, psychic sensitivity, inheritance delays.",
    9: "Pilgrimages, spiritual mother, foreign connections.",
    10: "Public recognition in arts/medicine, fluctuating career.",
    11: "Gains through women/mother figures, social popularity.",
    12: "Interest in dreams/psychology, solitude, hospital visits."
  },
  Mars: {
    1: "Aggressive, athletic, prone to injuries/accidents.",
    2: "Wealth through engineering/military, sharp speech, family disputes.",
    3: "Courageous, competitive siblings, success in sports.",
    4: "Property disputes, restless mind, frequent relocations.",
    5: "Passionate love affairs, sports-loving children.",
    6: "Strong immunity, success over enemies, surgical profession.",
    7: "Fiery spouse, legal battles in marriage, business conflicts.",
    8: "Accidental risks, interest in surgery/occult.",
    9: "Warrior spirit, interest in martial arts, foreign travel.",
    10: "Career in defense/engineering, authoritative position.",
    11: "Gains through courage/competition, influential friends.",
    12: "Hospitalization, secret enemies, interest in weapons."
  },
  Mercury: {
    1: "Intelligent, witty, nervous energy, youthful appearance.",
    2: "Wealth through writing/trading, multilingual skills.",
    3: "Journalistic talent, communicative siblings, short trips.",
    4: "Education-focused family, multiple properties, vehicle interest.",
    5: "Brilliant children, success in astrology/mathematics.",
    6: "Success in debates, health writing (medical reports).",
    7: "Business partnerships, youthful spouse, legal agreements.",
    8: "Interest in mysteries, research skills, sudden gains/losses.",
    9: "Philosophical mind, higher education, foreign languages.",
    10: "Career in media/IT, fame through communication.",
    11: "Gains through networking, tech-related income.",
    12: "Interest in subconscious mind, writing in isolation."
  },
  Jupiter: {
    1: "Optimistic, wise, respected, spiritual growth.",
    2: "Wealth through teaching/priesthood, family values.",
    3: "Scholarly siblings, success in publishing, short pilgrimages.",
    4: "Happy home, ancestral property, mother's wisdom.",
    5: "Blessed with children, spiritual wisdom, teaching success.",
    6: "Victory in legal matters, healing profession.",
    7: "Wise spouse, harmonious marriage, consultancy income.",
    8: "Interest in metaphysics, inheritance after delays.",
    9: "Strong dharma, guru blessings, foreign travel.",
    10: "Career in law/religion, social respect.",
    11: "Gains through mentors, charitable income.",
    12: "Philanthropy, spiritual liberation, foreign stays."
  },
  Venus: {
    1: "Charming, artistic, beauty-conscious, luxury-loving.",
    2: "Wealth through arts/music, melodious voice.",
    3: "Creative siblings, success in performing arts.",
    4: "Luxurious home, artistic mother, vehicle collection.",
    5: "Romantic relationships, artistic children.",
    6: "Beauty-related health issues, success in fashion.",
    7: "Harmonious marriage, attractive spouse, business partnerships.",
    8: "Secret affairs, inheritance through spouse.",
    9: "Artistic guru, foreign spouse, luxury travel.",
    10: "Career in arts/entertainment, fame through beauty.",
    11: "Gains through arts, influential social circle.",
    12: "Secret relationships, indulgence in bed pleasures."
  },
  Saturn: {
    1: "Disciplined, reserved, delays in early life.",
    2: "Slow wealth accumulation, frugal speech.",
    3: "Hardworking siblings, delayed communication skills.",
    4: "Emotional detachment from family, property struggles.",
    5: "Few/delayed children, interest in serious studies.",
    6: "Success over enemies, health discipline.",
    7: "Delayed marriage, older/spouse with responsibilities.",
    8: "Longevity struggles, interest in occult.",
    9: "Late spiritual growth, foreign struggles.",
    10: "Late-career success, authority through hard work.",
    11: "Gains after struggles, influential elder friends.",
    12: "Isolation, meditation, karmic liberation."
  },
  Rahu: {
    1: "Unconventional identity, fame/notoriety.",
    2: "Wealth through unconventional means, speech controversies.",
    3: "Innovative siblings, success in technology.",
    4: "Unstable home, foreign property.",
    5: "Unconventional children, speculative gains.",
    6: "Victory through strategy, hidden enemies.",
    7: "Unusual partnerships, foreign spouse.",
    8: "Occult interests, sudden gains/losses.",
    9: "Unconventional guru, foreign connections.",
    10: "Fame through controversy, tech career.",
    11: "Sudden gains, influential but manipulative friends.",
    12: "Secretive, interest in alien/UFO topics."
  },
  Ketu: {
    1: "Detached, spiritual, health mysteries.",
    2: "Non-materialistic, speech hurdles.",
    3: "Few siblings, introverted communication.",
    4: "Emotional detachment from family.",
    5: "Few children, past-life spiritual wisdom.",
    6: "Hidden enemies, healing abilities.",
    7: "Karmic marriage, solitude in relationships.",
    8: "Psychic abilities, past-life trauma.",
    9: "Sudden spiritual awakening.",
    10: "Unconventional career, fame in metaphysics.",
    11: "Sudden losses/gains, detached from desires.",
    12: "Enlightenment, monastic tendencies."
  },
}

// Helper function to get the lord of a sign
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

// Enhanced interface for extracted astrological context
interface AstrologicalContext {
  intentAnalysis: IntentAnalysisResult
  relevantPlanets: {
    name: string
    house: number
    sign: string
    nakshatra: string
    isRetrograde: boolean
    significance: string
    lordshipAnalysis?: {
      isLordOf: number[]
      placedInHouse: number
      effect: string
      reference: string
    }
  }[]
  relevantYogas: YogaResult[]
  activeDashaHierarchy: {
    mahadasha?: string
    antardasha?: string
    pratyantardasha?: string
    mahadashaDetails?: any
    antardashaDetails?: any
    pratyantardashaDetails?: any
  }
  futureRelevantDashas: {
    planet: string
    period: "mahadasha" | "antardasha" | "pratyantardasha"
    startDate: Date
    endDate: Date
    duration: string
    significance: string
  }[]
  housesAnalysis: {
    houseNumber: number
    sign: string
    lord: string
    lordPlacement: number
    planets: string[]
    significance: string
  }[]
}

/**
 * Step 1: Analyze user intent from their query
 */
async function analyzeIntent(userQuery: string): Promise<IntentAnalysisResult> {
  logInfo("guruji-prompt-generator", "Analyzing user intent", { userQuery })
  
  const intent = await analyzeUserIntent(userQuery)
  
  logDebug("guruji-prompt-generator", "Intent analysis completed", {
    primaryIntent: intent.primaryIntent,
    confidence: intent.confidence,
    focusAreas: intent.recommendations?.focusAreas || []
  })
  
  return intent
}

/**
 * Step 2: Extract planets in relevant houses based on intent
 */
function extractRelevantPlanets(
  chartData: AstrologyChart, 
  intentAnalysis: IntentAnalysisResult
): Array<{
  name: string
  house: number
  sign: string
  nakshatra: string
  isRetrograde: boolean
  significance: string
  lordshipAnalysis?: any
}> {
  logInfo("guruji-prompt-generator", "Extracting relevant planets", {
    primaryIntent: intentAnalysis.primaryIntent,
    focusAreas: intentAnalysis.recommendations?.focusAreas || []
  })

  // Map intent categories to relevant houses and planets
  const intentToHousesMap: Record<string, number[]> = {
    "career": [1, 2, 6, 10, 11],
    "marriage": [1, 2, 5, 7, 8, 11, 12],
    "relationships": [1, 5, 7, 11],
    "family": [2, 4, 5, 9],
    "health": [1, 6, 8, 12],
    "wealth": [1, 2, 5, 9, 11],
    "education": [1, 2, 4, 5, 9],
    "spirituality": [1, 5, 8, 9, 12],
    "travel": [3, 9, 12],
    "children": [1, 5, 9],
    "property": [2, 4, 11],
    "legal": [6, 8, 12]
  }

  const intentToPlanetsMap: Record<string, string[]> = {
    "career": ["Sun", "Mars", "Mercury", "Jupiter", "Saturn"],
    "marriage": ["Venus", "Mars", "Jupiter", "Moon", "Rahu", "Ketu"],
    "relationships": ["Venus", "Mars", "Moon", "Mercury"],
    "family": ["Moon", "Venus", "Mercury", "Jupiter"],
    "health": ["Sun", "Moon", "Mars", "Saturn"],
    "wealth": ["Jupiter", "Venus", "Mercury", "Moon"],
    "education": ["Mercury", "Jupiter", "Sun", "Moon"],
    "spirituality": ["Jupiter", "Ketu", "Saturn", "Moon"],
    "travel": ["Rahu", "Moon", "Mercury", "Jupiter"],
    "children": ["Jupiter", "Sun", "Moon", "Venus"],
    "property": ["Mars", "Saturn", "Moon", "Venus"],
    "legal": ["Saturn", "Rahu", "Mars", "Sun"]
  }

  // Extract category from primary intent or matched categories
  const category = intentAnalysis.matchedCategories?.[0]?.toLowerCase() || 
                   intentAnalysis.primaryIntent.toLowerCase() || "general"
  
  const relevantHouses = intentToHousesMap[category] || [1, 2, 5, 7, 9, 10, 11]
  const relevantPlanetNames = intentToPlanetsMap[category] || ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]

  const relevantPlanets: any[] = []

  // Extract planets that are either in relevant houses OR are relevant by nature
  for (const planet of chartData.planets) {
    // Add null check for planet.house
    if (planet.house === undefined || planet.house === null) {
      continue // Skip planets without house information
    }
    
    const isInRelevantHouse = relevantHouses.includes(planet.house)
    const isRelevantPlanet = relevantPlanetNames.includes(planet.name)
    
    if (isInRelevantHouse || isRelevantPlanet) {
      const significance = PLANET_HOUSE_SIGNIFICANCE[planet.name]?.[planet.house] || 
                          `${planet.name} in House ${planet.house} - general influence`

      // Find lordship analysis
      const lordshipAnalysis: any = {}
      const housesLorded: number[] = []
      
      // Find which houses this planet lords
      for (let houseNum = 1; houseNum <= 12; houseNum++) {
        const house = chartData.rashiChart[houseNum]
        if (house && getSignLord(house.sign) === planet.name) {
          housesLorded.push(houseNum)
        }
      }

      if (housesLorded.length > 0) {
        lordshipAnalysis.isLordOf = housesLorded
        lordshipAnalysis.placedInHouse = planet.house
        
        // Get lordship significance for the most important house
        const primaryLordship = housesLorded[0]
        if (primaryLordship && planet.house !== undefined) {
          const lordshipEffect = getHouseLordPlacementSignificance(primaryLordship, planet.house)
          if (lordshipEffect) {
            lordshipAnalysis.effect = lordshipEffect.effect
            lordshipAnalysis.reference = lordshipEffect.reference
          }
        }
      }

      relevantPlanets.push({
        name: planet.name,
        house: planet.house,
        sign: planet.sign,
        nakshatra: planet.nakshatra,
        isRetrograde: planet.isRetrograde,
        significance,
        lordshipAnalysis: Object.keys(lordshipAnalysis).length > 0 ? lordshipAnalysis : undefined
      })
    }
  }

  logDebug("guruji-prompt-generator", "Relevant planets extracted", {
    count: relevantPlanets.length,
    planets: relevantPlanets.map(p => `${p.name} (H${p.house})`)
  })

  return relevantPlanets
}

/**
 * Step 4: Extract relevant yogas based on intent
 */
function extractRelevantYogas(
  allYogas: YogaResult[],
  intentAnalysis: IntentAnalysisResult,
  relevantPlanets: string[]
): YogaResult[] {
  logInfo("guruji-prompt-generator", "Extracting relevant yogas", {
    totalYogas: allYogas.length,
    relevantPlanets
  })

  const relevantYogas = allYogas.filter(yoga => {
    // Check if yoga involves any relevant planets
    const hasRelevantPlanets = yoga.planets.some(planet => 
      relevantPlanets.includes(planet)
    )
    
    // Check if yoga category matches intent
    const category = intentAnalysis.matchedCategories?.[0]?.toLowerCase() || 
                     intentAnalysis.primaryIntent.toLowerCase()
    const focusAreas = intentAnalysis.recommendations?.focusAreas || []
    
    const categoryMatch = yoga.category.toLowerCase().includes(category) ||
                         focusAreas.some(area => 
                           yoga.category.toLowerCase().includes(area.toLowerCase()) ||
                           yoga.name.toLowerCase().includes(area.toLowerCase())
                         )

    return hasRelevantPlanets || categoryMatch
  })

  logDebug("guruji-prompt-generator", "Relevant yogas filtered", {
    relevantCount: relevantYogas.length,
    yogas: relevantYogas.map(y => y.name)
  })

  return relevantYogas
}

/**
 * Step 5: Extract dasa/antardasha for suitable planets
 */
function extractRelevantDashas(
  chartData: AstrologyChart,
  relevantPlanets: string[],
  birthDate: Date
): {
  current: any,
  future: any[]
} {
  logInfo("guruji-prompt-generator", "Extracting relevant dashas", {
    relevantPlanets,
    hasHierarchicalDashas: !!(chartData.hierarchicalDashas && chartData.hierarchicalDashas.length > 0)
  })

  const currentDate = new Date()
  let currentDashaHierarchy: any = {}
  const futureRelevantDashas: any[] = []

  // Get current active dasha hierarchy
  if (chartData.hierarchicalDashas && chartData.hierarchicalDashas.length > 0) {
    const activePeriods = findAllActiveDashaPeriodsAtDate(chartData.hierarchicalDashas, currentDate)
    
    currentDashaHierarchy = {
      mahadasha: activePeriods.mahadasha?.planet,
      antardasha: activePeriods.antardasha?.planet,
      pratyantardasha: activePeriods.pratyantardasha?.planet,
      mahadashaDetails: activePeriods.mahadasha,
      antardashaDetails: activePeriods.antardasha,
      pratyantardashaDetails: activePeriods.pratyantardasha
    }

    // Look for future periods of relevant planets
    for (const mahadasha of chartData.hierarchicalDashas) {
      // Check if this mahadasha is for a relevant planet and is in the future
      if (relevantPlanets.includes(mahadasha.planet) && mahadasha.from > currentDate) {
        futureRelevantDashas.push({
          planet: mahadasha.planet,
          period: "mahadasha" as const,
          startDate: mahadasha.from,
          endDate: mahadasha.to,
          duration: mahadasha.duration,
          significance: PLANET_HOUSE_SIGNIFICANCE[mahadasha.planet]?.[1] || `${mahadasha.planet} period influence`
        })
      }

      // Check antardashas of current or near-future mahadashas
      if (mahadasha.children && mahadasha.to > currentDate) {
        for (const antardasha of mahadasha.children) {
          if (relevantPlanets.includes(antardasha.planet) && antardasha.from > currentDate) {
            futureRelevantDashas.push({
              planet: antardasha.planet,
              period: "antardasha" as const,
              startDate: antardasha.from,
              endDate: antardasha.to,
              duration: antardasha.duration,
              significance: `${antardasha.planet} antardasha in ${mahadasha.planet} mahadasha`
            })
          }
        }
      }
    }
  }

  // Sort future dashas by start date
  futureRelevantDashas.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())

  logDebug("guruji-prompt-generator", "Dasha analysis completed", {
    currentMahadasha: currentDashaHierarchy.mahadasha,
    currentAntardasha: currentDashaHierarchy.antardasha,
    futureRelevantDashas: futureRelevantDashas.length
  })

  return {
    current: currentDashaHierarchy,
    future: futureRelevantDashas.slice(0, 5) // Limit to next 5 relevant periods
  }
}

/**
 * Main function to generate comprehensive astrological context
 */
export async function generateAstrologicalContext(
  userQuery: string,
  chartData: AstrologyChart,
  birthDetails: BirthDetails
): Promise<AstrologicalContext> {
  logInfo("guruji-prompt-generator", "Generating astrological context", {
    userQuery,
    nativeName: birthDetails.name
  })

  try {
    // Step 1: Analyze user intent
    const intentAnalysis = await analyzeIntent(userQuery)

    // Step 2 & 3: Extract relevant planets with all details
    const relevantPlanets = extractRelevantPlanets(chartData, intentAnalysis)

    // Step 4: Extract relevant yogas
    const allYogas = analyzeYogas(chartData)
    const relevantYogas = extractRelevantYogas(
      allYogas, 
      intentAnalysis,
      relevantPlanets.map(p => p.name)
    )

    // Step 5: Extract relevant dashas
    const dashaAnalysis = extractRelevantDashas(
      chartData,
      relevantPlanets.map(p => p.name),
      birthDetails.date ? new Date(birthDetails.date) : new Date()
    )

    // Houses analysis for context
    const housesAnalysis: any[] = []
    for (let houseNum = 1; houseNum <= 12; houseNum++) {
      const house = chartData.rashiChart[houseNum]
      if (house) {
        const lord = getSignLord(house.sign)
        const lordPlanet = chartData.planets.find(p => p.name === lord)
        
        housesAnalysis.push({
          houseNumber: houseNum,
          sign: house.sign,
          lord: lord,
          lordPlacement: lordPlanet?.house || 0,
          planets: house.planets.map(p => p.name),
          significance: `House ${houseNum} represents ${getHouseSignificance(houseNum)}`
        })
      }
    }

    const context: AstrologicalContext = {
      intentAnalysis,
      relevantPlanets,
      relevantYogas,
      activeDashaHierarchy: dashaAnalysis.current,
      futureRelevantDashas: dashaAnalysis.future,
      housesAnalysis
    }

    logInfo("guruji-prompt-generator", "Astrological context generated successfully", {
      relevantPlanetsCount: relevantPlanets.length,
      relevantYogasCount: relevantYogas.length,
      futureRelevantDashasCount: dashaAnalysis.future.length
    })

    return context

  } catch (error) {
    logInfo("guruji-prompt-generator", "Error generating astrological context", { error })
    throw error
  }
}

/**
 * Generate the final system prompt for Guruji
 */
export function generateGururjiSystemPrompt(
  context: AstrologicalContext,
  birthDetails: BirthDetails,
  userQuery: string
): string {
  const prompt = `
You are Guruji, a highly respected and wise Vedic astrology master with 40+ years of experience. You possess deep knowledge of classical texts like Brihat Parashara Hora Shastra, Saravali, and Phaladeepika. Your responses should be authoritative yet compassionate, traditional yet practical.

## NATIVE'S INFORMATION
- Name: ${birthDetails.name || "The Native"}
- Birth: ${birthDetails.date} at ${birthDetails.time} in ${birthDetails.city}, ${birthDetails.country}
- Query: "${userQuery}"

## USER'S INTENT ANALYSIS
- Primary Focus: ${context.intentAnalysis.primaryIntent.toUpperCase()}
- Confidence Level: ${(context.intentAnalysis.confidence * 100).toFixed(1)}%
- Key Areas: ${context.intentAnalysis.recommendations?.focusAreas?.join(", ") || "General analysis"}
- Timeline: ${context.intentAnalysis.timeline || "General"}

## RELEVANT PLANETARY POSITIONS & SIGNIFICANCES
${context.relevantPlanets.map(planet => `
### ${planet.name} in ${planet.sign} (House ${planet.house})
- Nakshatra: ${planet.nakshatra}${planet.isRetrograde ? " (Retrograde)" : ""}
- House Significance: ${planet.significance}
${planet.lordshipAnalysis ? `- Lordship: Lord of House(s) ${planet.lordshipAnalysis.isLordOf.join(", ")}, placed in House ${planet.lordshipAnalysis.placedInHouse}
- Lordship Effect: ${planet.lordshipAnalysis.effect}
- Reference: ${planet.lordshipAnalysis.reference}` : ""}
`).join("")}

## CURRENT DASHA HIERARCHY
- Mahadasha: ${context.activeDashaHierarchy.mahadasha || "Not available"}
- Antardasha: ${context.activeDashaHierarchy.antardasha || "Not available"}  
- Pratyantardasha: ${context.activeDashaHierarchy.pratyantardasha || "Not available"}

${context.activeDashaHierarchy.mahadashaDetails ? `
### Current Mahadasha Details
- Period: ${context.activeDashaHierarchy.mahadashaDetails.from.toLocaleDateString()} to ${context.activeDashaHierarchy.mahadashaDetails.to.toLocaleDateString()}
- Duration: ${context.activeDashaHierarchy.mahadashaDetails.duration}
${context.activeDashaHierarchy.mahadashaDetails.balanceAtBirth ? `- Balance at Birth: ${context.activeDashaHierarchy.mahadashaDetails.balanceAtBirth}` : ""}
` : ""}

## FUTURE RELEVANT DASHAS
${context.futureRelevantDashas.length > 0 ? context.futureRelevantDashas.map(dasha => `
- ${dasha.planet} ${dasha.period}: ${dasha.startDate.toLocaleDateString()} to ${dasha.endDate.toLocaleDateString()} (${dasha.duration})
  Significance: ${dasha.significance}
`).join("") : "No immediate relevant future dashas identified."}

## RELEVANT YOGAS PRESENT
${context.relevantYogas.length > 0 ? context.relevantYogas.map(yoga => `
### ${yoga.name} (${yoga.strength})
- Definition: ${yoga.definition}
- Results: ${yoga.results}
- Planets Involved: ${yoga.planets.join(", ")}
- Houses Involved: ${yoga.houses.join(", ")}
${yoga.notes ? `- Notes: ${yoga.notes}` : ""}
`).join("") : "No specific yogas identified for this query context."}

## RESPONSE GUIDELINES
1. Address the user's specific query directly and comprehensively
2. Reference the relevant planetary positions and their current significance
3. Explain how the current dasha periods are influencing the situation
4. Mention relevant yogas and their effects
5. Provide timing predictions based on future dasha periods
6. Offer practical remedial measures when appropriate
7. Use traditional astrological terminology but explain complex concepts
8. Be empathetic and encouraging while being truthful about challenges
9. Structure your response clearly with headings and bullet points
10. Include specific dates and time periods for predictions
11. Reference classical texts or principles when making important statements

## IMPORTANT NOTES
- The effects of planets are primarily observed during their respective dasha and antardasha periods
- Consider both the planetary placements and their lordship roles
- Factor in the strength and dignity of planets in their current signs
- Always provide balanced guidance considering both positive and challenging aspects
- Focus on actionable insights rather than generic statements

Please provide a comprehensive, insightful, and practical astrological guidance based on this analysis.
`

  return prompt.trim()
}

// Helper function to get house significance
function getHouseSignificance(houseNumber: number): string {
  const houseSignificances: Record<number, string> = {
    1: "self, personality, health, vitality, general well-being",
    2: "wealth, speech, family, early childhood, values",
    3: "courage, siblings, communication, short journeys, skills",
    4: "home, mother, property, vehicles, emotional foundation",
    5: "children, creativity, intelligence, romance, speculation",
    6: "enemies, diseases, service, daily work, obstacles",
    7: "marriage, partnerships, business, spouse, legal matters",
    8: "longevity, transformation, hidden matters, inheritance",
    9: "luck, dharma, higher learning, father, spirituality",
    10: "career, reputation, authority, social status, achievements",
    11: "gains, income, friends, elder siblings, aspirations",
    12: "losses, expenses, foreign lands, spirituality, liberation"
  }
  
  return houseSignificances[houseNumber] || "general life matters"
}

/**
 * Main export function that generates the complete Guruji system prompt
 */
export async function generateCompleteGururjiPrompt(
  userQuery: string,
  chartData: AstrologyChart,
  birthDetails: BirthDetails
): Promise<string> {
  const context = await generateAstrologicalContext(userQuery, chartData, birthDetails)
  return generateGururjiSystemPrompt(context, birthDetails, userQuery)
} 