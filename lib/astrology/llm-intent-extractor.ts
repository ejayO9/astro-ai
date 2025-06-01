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
    timeline: z.string().default("")
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
 * Dedicated timeline extraction using LLM for maximum accuracy
 */
export async function extractTimelineWithLLM(userQuery: string): Promise<string> {
  const apiKey = getOpenAIApiKey()
  
  if (!apiKey || userQuery.trim().length < 3) {
    return ""
  }

  try {
    const openaiProvider = createOpenAI({
      apiKey: apiKey,
      compatibility: "strict",
    })

    const TimelineSchema = z.object({
      timeline: z.string().describe("Exact time reference found in the query"),
      reasoning: z.string().describe("Brief explanation of timeline extraction"),
      confidence: z.number().min(0).max(1).describe("Confidence in timeline extraction")
    })

    const { object } = await generateObject({
      model: openaiProvider("gpt-4.1"),
      schema: TimelineSchema,
      prompt: `TASK: Extract the exact time reference from this query.

Query: "${userQuery}"

INSTRUCTIONS:
1. Find ANY mention of time, period, duration, or date
2. Extract the EXACT phrase as it appears
3. If multiple time references exist, extract the most specific one
4. If no time reference exists, return empty string

EXAMPLES:
- "this year" → "this year"
- "for the year 2030" → "for the year 2030"  
- "in 3 months" → "in 3 months"
- "next summer" → "next summer"
- "by December 2025" → "by December 2025"
- "soon" → "soon"
- "eventually" → "eventually"
- "no time mentioned" → ""

Return JSON with timeline, reasoning, and confidence (0-1).`,
      temperature: 0.6, // Maximum consistency
    })

    logInfo("llm-intent-extractor", "Dedicated timeline extraction completed", {
      timeline: object.timeline,
      confidence: object.confidence,
      reasoning: object.reasoning
    })

    return object.timeline
  } catch (error) {
    logError("llm-intent-extractor", "Dedicated timeline extraction failed", error)
    return ""
  }
}

/**
 * Enhanced LLM-based intent analyzer for astrological queries
 */
export async function analyzeLLMIntent(userQuery: string, useEnhancedTimeline: boolean = false): Promise<IntentAnalysisResult> {
  console.log("🎯 [LLMIntentExtractor] analyzeLLMIntent CALLED")
  console.log("📁 File: lib/astrology/llm-intent-extractor.ts")
  console.log("🔧 Function: analyzeLLMIntent")
  console.log("📊 Parameters:", { userQuery, useEnhancedTimeline })

  const apiKey = getOpenAIApiKey()

  logInfo("llm-intent-extractor", "Starting LLM intent analysis", {
    queryLength: userQuery.length,
    query: userQuery.substring(0, 100),
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
    const detailedHouseList = generateDetailedHouseCharacteristicsPrompt();
    const { object } = await generateObject({
      model: openaiProvider("gpt-4.1"),
      schema: IntentAnalysisSchema,
      prompt: `You are an expert astrological analyst. Analyze this query and extract all relevant information:

Query: "${userQuery}"

TIMELINE EXTRACTION - CRITICAL INSTRUCTIONS:
Extract ANY time reference, period, duration, or date mentioned in the query. Be very thorough and precise.

TIMELINE EXAMPLES:
- "this year" → "this year"
- "next year" → "next year"  
- "in 2030" → "in 2030"
- "for the year 2025" → "for the year 2025"
- "during 2024" → "during 2024"
- "throughout 2023" → "throughout 2023"
- "next month" → "next month"
- "this month" → "this month"
- "in 3 months" → "in 3 months"
- "for 6 weeks" → "for 6 weeks"
- "next week" → "next week"
- "this summer" → "this summer"
- "in January" → "in January"
- "by December" → "by December"
- "for a lifetime" → "for a lifetime"
- "in the coming years" → "in the coming years"
- "next decade" → "next decade"
- "this quarter" → "this quarter"
- "12/31/2024" → "12/31/2024"
- "in my 30s" → "in my 30s"
- "after 40" → "after 40"
- "before marriage" → "before marriage"
- "soon" → "soon"
- "eventually" → "eventually"
- "immediately" → "immediately"

If NO time reference exists, return empty string "".

Provide analysis in this exact JSON format:
{
  "intent": {
    "primaryIntent": "What the user is mainly asking about",
    "secondaryIntents": ["Additional concerns if any"],
    "lifeAreas": ["career", "relationships", "health", etc.],
    "isAskingForRemedies": true/false,
    "specificConcerns": ["Specific worries mentioned"],
    "emotionalTone": "curious/worried/hopeful/confused",
    "timeline": "EXTRACT EXACT TIME REFERENCE FROM QUERY - SEE EXAMPLES ABOVE"
  },
  "houseMapping": {
    "primaryHouses": [most relevant houses 1-12],
    "secondaryHouses": [additional relevant houses],
    "houseReasons": {"house_number": "Why this house is relevant"},
    "analysisApproach": "How to analyze this query"
  },
  "categories": ["Career", "Relationships", "Health", "Finance", etc.],
  "confidence": 0.8 (0-1 confidence level)
}

Use these detailed Vedic astrology house characteristics:
${detailedHouseList}
`,
      temperature: 0.4, // Very low temperature for consistent timeline extraction
    })

    logInfo("llm-intent-extractor", "LLM analysis completed successfully", {
      primaryIntent: object.intent.primaryIntent,
      primaryHouses: object.houseMapping.primaryHouses,
      confidence: object.confidence,
      timeline: object.intent.timeline,
      timelineLength: object.intent.timeline.length,
      hasTimeline: !!object.intent.timeline,
    })

    logInfo("llm-intent-extractor", "LLM raw output", { object });

    // Debug timeline extraction specifically
    logInfo("llm-intent-extractor", "Timeline extraction debug", {
      query: userQuery,
      extractedTimeline: object.intent.timeline,
      timelineEmpty: object.intent.timeline === "",
      useEnhancedTimeline,
      shouldUseEnhanced: useEnhancedTimeline && (!object.intent.timeline || object.intent.timeline.trim() === "")
    });

    // Optionally use enhanced timeline extraction for better accuracy
    if (useEnhancedTimeline && (!object.intent.timeline || object.intent.timeline.trim() === "")) {
      logInfo("llm-intent-extractor", "Using enhanced timeline extraction for empty timeline")
      const enhancedTimeline = await extractTimelineWithLLM(userQuery)
      logInfo("llm-intent-extractor", "Enhanced timeline extraction result", {
        original: object.intent.timeline,
        enhanced: enhancedTimeline,
        query: userQuery
      })
      object.intent.timeline = enhancedTimeline
    }

    // Return the LLM result directly - LLM handles timeline extraction
    return object;
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
    const timeline = extractTimelineFromQuery(userQuery) || "";
    return {
      intent: {
        primaryIntent: "General astrological guidance",
        secondaryIntents: [],
        lifeAreas: ["general life"],
        isAskingForRemedies: false,
        specificConcerns: [],
        emotionalTone: "curious",
        timeline
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
    timeline: "", // Fallback doesn't extract timeline - only LLM does
  })

  return {
    intent: {
      primaryIntent,
      secondaryIntents: [],
      lifeAreas,
      isAskingForRemedies,
      specificConcerns: [],
      emotionalTone,
      timeline: "" // Fallback doesn't extract timeline - only LLM does
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

function generateDetailedHouseCharacteristicsPrompt(): string {
  let prompt = "";
  for (let i = 1; i <= 12; i++) {
    const house = HOUSE_CHARACTERISTICS[i];
    if (house) {
      prompt += `\nHouse ${i} - ${house.name}:\n`;
      prompt += `  Physical: ${house.physical.join(", ")}\n`;
      prompt += `  Identity: ${house.identity.join(", ")}\n`;
      prompt += `  Abilities: ${house.abilities.join(", ")}\n`;
      prompt += `  Life Events: ${house.lifeEvents.join(", ")}\n`;
      prompt += `  Material: ${house.material.join(", ")}\n`;
      prompt += `  Family: ${house.family.join(", ")}\n`;
      prompt += `  Body: ${house.body.join(", ")}\n`;
      prompt += `  Skills: ${house.skills.join(", ")}\n`;
      prompt += `  Relationships: ${house.relationships.join(", ")}\n`;
      prompt += `  Personal Traits: ${house.personalTraits.join(", ")}\n`;
      prompt += `  Emotional State: ${house.emotionalState.join(", ")}\n`;
      prompt += `  Education: ${house.education.join(", ")}\n`;
      prompt += `  Spiritual: ${house.spiritual.join(", ")}\n`;
      prompt += `  Emotions: ${house.emotions.join(", ")}\n`;
      prompt += `  Status: ${house.status.join(", ")}\n`;
      prompt += `  Adversity: ${house.adversity.join(", ")}\n`;
      prompt += `  Work: ${house.work.join(", ")}\n`;
      prompt += `  Health: ${house.health.join(", ")}\n`;
      prompt += `  Activities: ${house.activities.join(", ")}\n`;
      prompt += `  Career: ${house.career.join(", ")}\n`;
      prompt += `  Social: ${house.social.join(", ")}\n`;
      prompt += `  Habits: ${house.habits.join(", ")}\n`;
      prompt += `  Travel: ${house.travel.join(", ")}\n`;
    }
  }
  return prompt;
}

function extractTimelineFromQuery(query: string): string | null {
  // Common time-related phrases (expand as needed)
  const patterns = [
    /\bthis year\b/i,
    /\bnext year\b/i,
    /\blast year\b/i,
    /in \d{4}/i,
    /for the year \d{4}/i,
    /in the year \d{4}/i,
    /during \d{4}/i,
    /throughout \d{4}/i,
    /in \d+ (days?|weeks?|months?|years?)/i,
    /for \d+ (days?|weeks?|months?|years?)/i,
    /\bnext month\b/i,
    /\bthis month\b/i,
    /\bnext week\b/i,
    /\bthis week\b/i,
    /in the coming (months?|years?)/i,
    /by \d{4}/i,
    /for a week/i,
    /for a month/i,
    /for a year/i,
    /lifetime/i,
    /in (january|february|march|april|may|june|july|august|september|october|november|december)/i,
    /\bthis (spring|summer|fall|autumn|winter)\b/i,
    /\bnext (spring|summer|fall|autumn|winter)\b/i,
    /\bthis quarter\b/i,
    /\bnext quarter\b/i,
    /\bQ[1-4] \d{4}\b/i,
    /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/i, // dates like 12/31/2024
    /\b\d{1,2}-\d{1,2}-\d{2,4}\b/i, // dates like 12-31-2024
    /\bthis weekend\b/i,
    /\bnext weekend\b/i,
    /\btoday\b/i,
    /\btomorrow\b/i,
    /\btonight\b/i,
    /\bthis evening\b/i,
    /\bthis morning\b/i,
    /\btonight\b/i,
    /\bthis afternoon\b/i,
    /\bnext (monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
    /\bthis (monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
  ];
  for (const pattern of patterns) {
    const match = query.match(pattern);
    if (match) {
      return match[0];
    }
  }
  return null;
}

console.log('API Key in API route:', process.env.OPENAI_API_KEY);
