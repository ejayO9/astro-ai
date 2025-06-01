import { analyzeLLMIntent } from "./llm-intent-extractor"
import { getHouseCharacteristics } from "./house-characteristics"
import { logInfo, logError } from "@/lib/logging-service"

/**
 * Enhanced intent analysis result using LLM
 */
export interface IntentAnalysisResult {
  userQuery: string
  primaryIntent: string
  secondaryIntents: string[]
  primaryHouses: number[]
  secondaryHouses: number[]
  matchedCategories: string[]
  confidence: number
  houseAnalysis: {
    house: number
    name: string
    relevantSignifications: string[]
    bodyParts: string[]
    lifeAreas: string[]
    reason: string
  }[]
  recommendations: {
    focusAreas: string[]
    analysisApproach: string
    keyQuestions: string[]
  }
  summary: string
  isAskingForRemedies: boolean
  specificConcerns: string[]
  timeline: string
}

/**
 * Analyzes user intent using LLM and maps it to relevant houses and life areas
 */
export async function analyzeUserIntent(userQuery: string): Promise<IntentAnalysisResult> {
  logInfo("intent-analyzer", "Starting LLM-based intent analysis", {
    queryLength: userQuery.length,
    query: userQuery.substring(0, 100),
  })

  try {
    // Use LLM to analyze intent and map to houses with enhanced timeline extraction
    const llmAnalysis = await analyzeLLMIntent(userQuery, true)

    // Get detailed house characteristics
    const primaryHouseChars = getHouseCharacteristics(llmAnalysis.houseMapping.primaryHouses)
    const secondaryHouseChars = getHouseCharacteristics(llmAnalysis.houseMapping.secondaryHouses)

    // Analyze each relevant house with LLM reasoning
    const houseAnalysis = [
      ...primaryHouseChars.map((house) => ({
        house: house.number,
        name: house.name,
        relevantSignifications: extractRelevantSignifications(userQuery, house, llmAnalysis.intent.lifeAreas),
        bodyParts: house.body,
        lifeAreas: [
          ...house.material.slice(0, 2),
          ...house.family.slice(0, 2),
          ...house.career.slice(0, 2),
          ...house.relationships.slice(0, 2),
        ].slice(0, 6),
        reason: llmAnalysis.houseMapping.houseReasons[house.number.toString()] || "Primary house for this query",
      })),
      ...secondaryHouseChars.map((house) => ({
        house: house.number,
        name: house.name,
        relevantSignifications: extractRelevantSignifications(userQuery, house, llmAnalysis.intent.lifeAreas),
        bodyParts: house.body,
        lifeAreas: [
          ...house.material.slice(0, 2),
          ...house.family.slice(0, 2),
          ...house.career.slice(0, 2),
          ...house.relationships.slice(0, 2),
        ].slice(0, 6),
        reason:
          llmAnalysis.houseMapping.houseReasons[house.number.toString()] || "Secondary house for additional insights",
      })),
    ]

    // Generate recommendations based on LLM analysis
    const recommendations = generateLLMBasedRecommendations(llmAnalysis)

    // Generate summary
    const summary = generateLLMBasedSummary(llmAnalysis, userQuery)

    const result: IntentAnalysisResult = {
      userQuery,
      primaryIntent: llmAnalysis.intent.primaryIntent,
      secondaryIntents: llmAnalysis.intent.secondaryIntents,
      primaryHouses: llmAnalysis.houseMapping.primaryHouses,
      secondaryHouses: llmAnalysis.houseMapping.secondaryHouses,
      matchedCategories: llmAnalysis.categories,
      confidence: llmAnalysis.confidence,
      houseAnalysis,
      recommendations,
      summary,
      isAskingForRemedies: llmAnalysis.intent.isAskingForRemedies,
      specificConcerns: llmAnalysis.intent.specificConcerns,
      timeline: llmAnalysis.intent.timeline,
    }

    logInfo("intent-analyzer", "LLM-based intent analysis completed", {
      primaryIntent: result.primaryIntent,
      primaryHouses: result.primaryHouses,
      secondaryHouses: result.secondaryHouses,
      confidence: Math.round(result.confidence * 100),
      matchedCategories: result.matchedCategories,
      isAskingForRemedies: result.isAskingForRemedies,
    })

    return result
  } catch (error) {
    logError("intent-analyzer", "Error in LLM-based intent analysis", error)

    // Return a basic analysis as fallback
    return {
      userQuery,
      primaryIntent: "General astrological guidance",
      secondaryIntents: [],
      primaryHouses: [1], // Default to 1st house (self)
      secondaryHouses: [],
      matchedCategories: ["General"],
      confidence: 0.3,
      houseAnalysis: [
        {
          house: 1,
          name: "Tanu Bhava (House of Self)",
          relevantSignifications: ["Self", "Personality", "General life"],
          bodyParts: ["Head", "Body"],
          lifeAreas: ["Personal life", "General health", "Self-identity"],
          reason: "Fallback to general self-analysis",
        },
      ],
      recommendations: {
        focusAreas: ["General life analysis"],
        analysisApproach: "Provide general astrological guidance",
        keyQuestions: ["What does the overall chart indicate?"],
      },
      summary: "General astrological analysis focusing on overall life patterns and tendencies.",
      isAskingForRemedies:
        /remed(y|ies)|solution|fix|help|what (can|should) (i|we) do|how (can|should) (i|we)|suggestion|advice|upay|mantra|gemstone|stone|ratna/i.test(
          userQuery,
        ),
      specificConcerns: [],
      timeline: "",
    }
  }
}

/**
 * Extracts the most relevant significations for a house based on the user query and LLM-identified life areas
 */
function extractRelevantSignifications(userQuery: string, house: any, lifeAreas: string[]): string[] {
  const query = userQuery.toLowerCase()
  const areas = lifeAreas.map((area) => area.toLowerCase())

  const allSignifications = [
    ...house.physical,
    ...house.identity,
    ...house.abilities,
    ...house.lifeEvents,
    ...house.material,
    ...house.family,
    ...house.skills,
    ...house.relationships,
    ...house.personalTraits,
    ...house.emotionalState,
    ...house.education,
    ...house.spiritual,
    ...house.emotions,
    ...house.status,
    ...house.adversity,
    ...house.work,
    ...house.health,
    ...house.activities,
    ...house.career,
    ...house.social,
    ...house.habits,
    ...house.travel,
  ]

  // Score significations based on relevance to query and life areas
  const scoredSignifications = allSignifications.map((sig) => {
    let score = 0
    const sigWords = sig.toLowerCase().split(" ")
    const queryWords = query.split(" ")

    // Check for matches with life areas (higher weight)
    areas.forEach((area) => {
      if (sig.toLowerCase().includes(area) || area.includes(sig.toLowerCase())) {
        score += 10
      }
    })

    // Check for exact matches with query
    sigWords.forEach((sigWord) => {
      if (query.includes(sigWord) && sigWord.length > 2) {
        score += sigWord.length * 2
      }
    })

    // Check for partial matches with query
    queryWords.forEach((queryWord) => {
      if (queryWord.length > 2 && sig.toLowerCase().includes(queryWord)) {
        score += queryWord.length
      }
    })

    return { signification: sig, score }
  })

  // Sort by score and return top significations
  return scoredSignifications
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.signification)
    .slice(0, 5) // Top 5 most relevant
}

/**
 * Generates recommendations based on LLM analysis
 */
function generateLLMBasedRecommendations(llmAnalysis: any): {
  focusAreas: string[]
  analysisApproach: string
  keyQuestions: string[]
} {
  const focusAreas = llmAnalysis.intent.lifeAreas.map((area: string) => `${area} analysis`)

  const keyQuestions = llmAnalysis.houseMapping.primaryHouses.map((house: number) => {
    const houseChar = getHouseCharacteristics([house])[0]
    return `What does the ${house}${getOrdinalSuffix(house)} house (${houseChar?.name}) reveal about ${llmAnalysis.intent.primaryIntent.toLowerCase()}?`
  })

  // Add specific questions based on concerns
  if (llmAnalysis.intent.specificConcerns.length > 0) {
    keyQuestions.push(
      `How do the planetary positions address the specific concerns: ${llmAnalysis.intent.specificConcerns.join(", ")}?`,
    )
  }

  return {
    focusAreas: [...new Set(focusAreas)],
    analysisApproach: llmAnalysis.houseMapping.analysisApproach,
    keyQuestions,
  }
}

/**
 * Generates a summary based on LLM analysis
 */
function generateLLMBasedSummary(llmAnalysis: any, userQuery: string): string {
  let summary = ""

  if (llmAnalysis.confidence > 0.7) {
    summary = `High confidence analysis: The query clearly relates to ${llmAnalysis.intent.primaryIntent}. `
  } else if (llmAnalysis.confidence > 0.4) {
    summary = `Moderate confidence analysis: The query appears to relate to ${llmAnalysis.intent.primaryIntent}. `
  } else {
    summary = `General analysis: The query requires broad examination. Primary intent identified as ${llmAnalysis.intent.primaryIntent}. `
  }

  if (llmAnalysis.houseMapping.primaryHouses.length > 0) {
    const houseNames = llmAnalysis.houseMapping.primaryHouses
      .map((h: number) => `${h}${getOrdinalSuffix(h)} house`)
      .join(", ")
    summary += `Primary focus should be on the ${houseNames}. `
  }

  if (llmAnalysis.houseMapping.secondaryHouses.length > 0) {
    const secondaryHouseNames = llmAnalysis.houseMapping.secondaryHouses
      .map((h: number) => `${h}${getOrdinalSuffix(h)} house`)
      .join(", ")
    summary += `Secondary consideration should be given to the ${secondaryHouseNames}. `
  }

  if (llmAnalysis.intent.specificConcerns.length > 0) {
    summary += `Specific concerns to address: ${llmAnalysis.intent.specificConcerns.join(", ")}. `
  }

  return summary
}

/**
 * Helper function to get ordinal suffix
 */
function getOrdinalSuffix(num: number): string {
  const j = num % 10
  const k = num % 100
  if (j === 1 && k !== 11) return "st"
  if (j === 2 && k !== 12) return "nd"
  if (j === 3 && k !== 13) return "rd"
  return "th"
}

/**
 * Gets intent analysis for display purposes
 */
export function getIntentAnalysisForDisplay(userQuery: string): Promise<{
  houses: string[]
  categories: string[]
  confidence: string
  summary: string
  primaryIntent: string
  specificConcerns: string[]
}> {
  return analyzeUserIntent(userQuery).then((analysis) => ({
    houses: [
      ...analysis.primaryHouses.map((h) => `${h}${getOrdinalSuffix(h)} (Primary)`),
      ...analysis.secondaryHouses.map((h) => `${h}${getOrdinalSuffix(h)} (Secondary)`),
    ],
    categories: analysis.matchedCategories,
    confidence: `${Math.round(analysis.confidence * 100)}%`,
    summary: analysis.summary,
    primaryIntent: analysis.primaryIntent,
    specificConcerns: analysis.specificConcerns,
  }))
}
