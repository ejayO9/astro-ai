import { generateObject } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { z } from "zod"
import { HOUSE_CHARACTERISTICS } from "./house-characteristics"
import { logInfo, logError, logDebug } from "@/lib/logging-service"

/**
 * More flexible schema for LLM intent analysis with optional fields and defaults
 */
const IntentAnalysisSchema = z.object({
  intent: z.object({
    primaryIntent: z.string().default("General astrological guidance"),
    secondaryIntents: z.array(z.string()).default([]),
    lifeAreas: z.array(z.string()).default(["general life"]),
    isAskingForRemedies: z.boolean().default(false),
    specificConcerns: z.array(z.string()).default([]),
    emotionalTone: z.string().default("curious"),
  }),
  houseMapping: z.object({
    primaryHouses: z.array(z.number().min(1).max(12)).default([1]),
    secondaryHouses: z.array(z.number().min(1).max(12)).default([]),
    houseReasons: z.record(z.string()).default({}),
    analysisApproach: z.string().default("Provide general astrological guidance"),
  }),
  categories: z.array(z.string()).default(["General"]),
  confidence: z.number().min(0).max(1).default(0.5),
})

type IntentAnalysisResult = z.infer<typeof IntentAnalysisSchema>

/**
 * Get OpenAI API key from environment variables
 */
function getOpenAIApiKey(): string | null {
  return process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_KEY || null
}

/**
 * Analyzes user intent using LLM and maps to astrological houses
 */
export async function analyzeLLMIntent(userQuery: string): Promise<IntentAnalysisResult> {
  const apiKey = getOpenAIApiKey()

  logInfo("llm-intent-extractor", "Starting LLM intent analysis", {
    queryLength: userQuery.length,
    query: userQuery.substring(0, 100),
    hasApiKey: !!apiKey,
  })

  // If no API key or query is too short, use fallback immediately
  if (!apiKey || userQuery.trim().length < 3) {
    logInfo("llm-intent-extractor", "Using fallback analysis", {
      reason: !apiKey ? "No API key" : "Query too short",
      queryLength: userQuery.length,
    })
    return getFallbackAnalysis(userQuery)
  }

  try {
    // Create OpenAI provider with explicit configuration
    const openaiProvider = createOpenAI({
      apiKey: apiKey,
      compatibility: "strict",
    })

    // Use a simpler, more reliable prompt
    const { object } = await generateObject({
      model: openaiProvider("gpt-4o"),
      schema: IntentAnalysisSchema,
      prompt: `Analyze this astrological query and provide a JSON response:

Query: "${userQuery}"

Provide analysis in this exact format:
{
  "intent": {
    "primaryIntent": "What the user is mainly asking about",
    "secondaryIntents": ["Additional concerns"],
    "lifeAreas": ["career", "relationships", "health", etc.],
    "isAskingForRemedies": true/false,
    "specificConcerns": ["Specific worries mentioned"],
    "emotionalTone": "curious/worried/hopeful/confused"
  },
  "houseMapping": {
    "primaryHouses": [1, 2, 3] (most relevant houses 1-12),
    "secondaryHouses": [4, 5] (additional relevant houses),
    "houseReasons": {"1": "Why this house is relevant"},
    "analysisApproach": "How to analyze this query"
  },
  "categories": ["Career", "Relationships", etc.],
  "confidence": 0.8 (0-1 confidence level)
}

Focus on traditional Vedic astrology house meanings:
House 1: Self, personality, health
House 2: Money, family, speech
House 3: Siblings, communication, courage
House 4: Home, mother, property
House 5: Children, education, creativity
House 6: Health, enemies, service
House 7: Marriage, partnerships, business
House 8: Transformation, occult, longevity
House 9: Luck, spirituality, higher learning
House 10: Career, reputation, father
House 11: Gains, friends, aspirations
House 12: Losses, spirituality, foreign lands`,
      temperature: 0.3, // Lower temperature for more consistent responses
    })

    logDebug("llm-intent-extractor", "LLM analysis completed successfully", {
      primaryIntent: object.intent.primaryIntent,
      primaryHouses: object.houseMapping.primaryHouses,
      confidence: object.confidence,
    })

    return object
  } catch (error) {
    logError("llm-intent-extractor", "LLM analysis failed, using fallback", {
      error: error instanceof Error ? error.message : String(error),
      hasApiKey: !!apiKey,
      queryLength: userQuery.length,
    })

    return getFallbackAnalysis(userQuery)
  }
}

/**
 * Enhanced fallback analysis when LLM is not available
 */
function getFallbackAnalysis(userQuery: string): IntentAnalysisResult {
  const query = userQuery.toLowerCase().trim()

  // If query is empty or too short, return default
  if (query.length < 2) {
    return {
      intent: {
        primaryIntent: "General astrological guidance",
        secondaryIntents: [],
        lifeAreas: ["general life"],
        isAskingForRemedies: false,
        specificConcerns: [],
        emotionalTone: "curious",
      },
      houseMapping: {
        primaryHouses: [1],
        secondaryHouses: [],
        houseReasons: { "1": "General self-analysis for short query" },
        analysisApproach: "Provide general astrological overview",
      },
      categories: ["General"],
      confidence: 0.4,
    }
  }

  // Enhanced pattern matching
  const isAskingForRemedies =
    /remed(y|ies)|solution|fix|help|what.*do|how.*improve|suggestion|advice|upay|mantra|gemstone|stone|cure|heal/i.test(
      query,
    )

  let primaryIntent = "General astrological guidance"
  let primaryHouses = [1]
  let lifeAreas = ["general life"]
  let categories = ["General"]
  let emotionalTone = "curious"

  // Career patterns
  if (/career|job|work|profession|business|employment|promotion|salary|office|boss/i.test(query)) {
    primaryIntent = "Career and professional guidance"
    primaryHouses = [10, 6]
    lifeAreas = ["career", "profession"]
    categories = ["Career"]
  }
  // Relationship patterns
  else if (/love|marriage|relationship|partner|spouse|wedding|dating|romance|boyfriend|girlfriend/i.test(query)) {
    primaryIntent = "Relationship and marriage guidance"
    primaryHouses = [7, 5]
    lifeAreas = ["relationships", "marriage"]
    categories = ["Relationships"]
  }
  // Financial patterns
  else if (/money|finance|wealth|income|property|investment|debt|loan|rich|poor|financial/i.test(query)) {
    primaryIntent = "Financial and wealth guidance"
    primaryHouses = [2, 11]
    lifeAreas = ["finance", "wealth"]
    categories = ["Finance"]
  }
  // Health patterns
  else if (/health|disease|illness|medical|body|physical|pain|treatment|sick|doctor/i.test(query)) {
    primaryIntent = "Health and wellness guidance"
    primaryHouses = [6, 1]
    lifeAreas = ["health"]
    categories = ["Health"]
  }
  // Family patterns
  else if (/family|mother|father|children|siblings|parents|home|house|domestic/i.test(query)) {
    primaryIntent = "Family and domestic guidance"
    primaryHouses = [4, 3]
    lifeAreas = ["family"]
    categories = ["Family"]
  }
  // Spiritual patterns
  else if (/spiritual|meditation|god|temple|prayer|moksha|dharma|religious|divine/i.test(query)) {
    primaryIntent = "Spiritual and religious guidance"
    primaryHouses = [9, 12]
    lifeAreas = ["spirituality"]
    categories = ["Spirituality"]
  }
  // Education patterns
  else if (/education|study|learning|knowledge|exam|degree|school|college|student/i.test(query)) {
    primaryIntent = "Education and learning guidance"
    primaryHouses = [5, 9]
    lifeAreas = ["education"]
    categories = ["Education"]
  }

  // Emotional tone detection
  if (/worried|anxious|scared|afraid|concerned|trouble|problem|bad|negative/i.test(query)) {
    emotionalTone = "worried"
  } else if (/hopeful|optimistic|positive|excited|good|happy|blessed/i.test(query)) {
    emotionalTone = "hopeful"
  } else if (/confused|lost|uncertain|don't know|unclear|puzzled/i.test(query)) {
    emotionalTone = "confused"
  }

  logInfo("llm-intent-extractor", "Fallback analysis completed", {
    primaryIntent,
    primaryHouses,
    lifeAreas,
    emotionalTone,
    isAskingForRemedies,
    confidence: 0.7,
  })

  return {
    intent: {
      primaryIntent,
      secondaryIntents: [],
      lifeAreas,
      isAskingForRemedies,
      specificConcerns: [],
      emotionalTone,
    },
    houseMapping: {
      primaryHouses,
      secondaryHouses: [],
      houseReasons: {
        [primaryHouses[0]]: `Primary house for ${primaryIntent.toLowerCase()} based on keyword analysis`,
      },
      analysisApproach: `Focus on ${lifeAreas.join(" and ")} aspects using traditional Vedic principles`,
    },
    categories,
    confidence: 0.7,
  }
}

/**
 * Generates a comprehensive prompt with house characteristics
 */
function generateHouseCharacteristicsPrompt(): string {
  let prompt = ""

  for (let i = 1; i <= 12; i++) {
    const house = HOUSE_CHARACTERISTICS[i]
    if (house) {
      prompt += `House ${i} - ${house.name}: ${house.significations?.slice(0, 3).join(", ") || "General significations"}\n`
    }
  }

  return prompt
}

/**
 * Quick intent analysis for simple use cases
 */
export async function quickIntentAnalysis(userQuery: string): Promise<{
  primaryHouses: number[]
  confidence: number
  isAskingForRemedies: boolean
}> {
  try {
    const analysis = await analyzeLLMIntent(userQuery)
    return {
      primaryHouses: analysis.houseMapping.primaryHouses,
      confidence: analysis.confidence,
      isAskingForRemedies: analysis.intent.isAskingForRemedies,
    }
  } catch (error) {
    logError("llm-intent-extractor", "Error in quick intent analysis", error)

    const fallback = getFallbackAnalysis(userQuery)
    return {
      primaryHouses: fallback.houseMapping.primaryHouses,
      confidence: fallback.confidence,
      isAskingForRemedies: fallback.intent.isAskingForRemedies,
    }
  }
}

/**
 * Validates house numbers and ensures they're within valid range
 */
function validateHouses(houses: number[]): number[] {
  return houses.filter((house) => house >= 1 && house <= 12)
}

/**
 * Gets house names for display
 */
export function getHouseNames(houseNumbers: number[]): string[] {
  return houseNumbers.map((num) => {
    const house = HOUSE_CHARACTERISTICS[num]
    return house ? `${num}. ${house.name}` : `${num}. Unknown House`
  })
}
