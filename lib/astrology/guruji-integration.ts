import type { AstrologyChart, BirthDetails } from "@/types/astrology"
import { generateCompleteGururjiPrompt } from "./guruji-prompt-generator"
import { logInfo, logError } from "@/lib/logging-service"

/**
 * Main integration function that generates a Guruji system prompt from user query and chart data
 */
export async function generateGururjiAnalysisPrompt(
  userQuery: string,
  chartData: AstrologyChart,
  birthDetails: BirthDetails
): Promise<string> {
  logInfo("guruji-integration", "Generating Guruji analysis prompt", {
    userQuery: userQuery.substring(0, 100),
    nativeName: birthDetails.name,
    hasChartData: !!chartData,
    planetCount: chartData.planets?.length || 0
  })

  try {
    const prompt = await generateCompleteGururjiPrompt(userQuery, chartData, birthDetails)
    
    logInfo("guruji-integration", "Guruji prompt generated successfully", {
      promptLength: prompt.length,
      containsKeyElements: {
        nativeInfo: prompt.includes("NATIVE'S INFORMATION"),
        intentAnalysis: prompt.includes("USER'S INTENT ANALYSIS"),
        planetaryPositions: prompt.includes("RELEVANT PLANETARY POSITIONS"),
        dashaHierarchy: prompt.includes("CURRENT DASHA HIERARCHY"),
        yogas: prompt.includes("RELEVANT YOGAS"),
        guidelines: prompt.includes("RESPONSE GUIDELINES")
      }
    })

    return prompt

  } catch (error) {
    logError("guruji-integration", "Error generating Guruji prompt", error)
    
    // Return a fallback basic prompt
    return generateFallbackPrompt(userQuery, birthDetails)
  }
}

/**
 * Fallback prompt generator for when the main system fails
 */
function generateFallbackPrompt(userQuery: string, birthDetails: BirthDetails): string {
  return `
You are Guruji, a wise Vedic astrology master with 40+ years of experience.

## NATIVE'S INFORMATION
- Name: ${birthDetails.name || "The Native"}
- Birth: ${birthDetails.date} at ${birthDetails.time} in ${birthDetails.city}, ${birthDetails.country}
- Query: "${userQuery}"

## INSTRUCTIONS
Please provide traditional Vedic astrological guidance for this native's query. Base your response on classical principles from texts like Brihat Parashara Hora Shastra and Saravali. Be compassionate yet truthful, and provide practical guidance along with spiritual insights.

The chart analysis system is currently processing the detailed planetary positions. Please provide general guidance based on the query while acknowledging that a complete chart analysis would provide more specific insights.

Focus on:
1. General astrological principles relevant to the query
2. Traditional remedial measures
3. Timing considerations based on current planetary transits
4. Spiritual guidance and practical advice
5. Encouragement while being realistic about challenges

Please structure your response clearly and use traditional astrological terminology while explaining concepts clearly.
`
}

/**
 * Validate that the generated prompt contains all required elements
 */
export function validateGururjiPrompt(prompt: string): {
  isValid: boolean
  missingElements: string[]
  recommendations: string[]
} {
  const requiredElements = [
    { key: "NATIVE'S INFORMATION", name: "Native's Information" },
    { key: "USER'S INTENT ANALYSIS", name: "Intent Analysis" },
    { key: "RELEVANT PLANETARY POSITIONS", name: "Planetary Positions" },
    { key: "CURRENT DASHA HIERARCHY", name: "Dasha Hierarchy" },
    { key: "RESPONSE GUIDELINES", name: "Response Guidelines" }
  ]

  const missingElements: string[] = []
  
  for (const element of requiredElements) {
    if (!prompt.includes(element.key)) {
      missingElements.push(element.name)
    }
  }

  const recommendations: string[] = []
  
  if (prompt.length < 1000) {
    recommendations.push("Prompt seems too short - may be missing detailed analysis")
  }
  
  if (!prompt.includes("Guruji")) {
    recommendations.push("Prompt should establish Guruji's identity and expertise")
  }
  
  if (!prompt.includes("classical texts")) {
    recommendations.push("Consider referencing classical Vedic texts for authenticity")
  }

  return {
    isValid: missingElements.length === 0,
    missingElements,
    recommendations
  }
}

/**
 * Example usage function showing how to integrate with the chat system
 */
export async function exampleIntegration(
  userMessage: string,
  chartData: AstrologyChart,
  birthDetails: BirthDetails
): Promise<{
  systemPrompt: string
  validation: ReturnType<typeof validateGururjiPrompt>
}> {
  // Generate the comprehensive system prompt
  const systemPrompt = await generateGururjiAnalysisPrompt(userMessage, chartData, birthDetails)
  
  // Validate the prompt
  const validation = validateGururjiPrompt(systemPrompt)
  
  logInfo("guruji-integration", "Integration example completed", {
    promptValid: validation.isValid,
    missingElements: validation.missingElements.length,
    promptLength: systemPrompt.length
  })

  return {
    systemPrompt,
    validation
  }
} 