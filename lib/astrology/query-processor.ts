import type { BirthDetails, AstrologyChart } from "@/types/astrology"
import { categorizeQuery } from "../query-categorization-service"
import { generateGurujiInterpretationPrompt } from "./prompt-generator"
import { LIFE_AREA_INDICATORS } from "./interpreter"

/**
 * Processes a user query by categorizing it and generating an appropriate astrological interpretation
 * @param query The user's query text
 * @param birthDetails The user's birth details
 * @param chartData The calculated astrological chart
 * @returns An enhanced prompt for interpretation
 */
export async function processAstrologyQuery(
  query: string,
  birthDetails: BirthDetails,
  chartData: AstrologyChart,
): Promise<string> {
  // First, categorize the query
  const categorization = await categorizeQuery(query)

  // Log the categorization for debugging
  console.log("Query categorization:", categorization)

  // Map the category name to the key in LIFE_AREA_INDICATORS
  const categoryKey = mapCategoryToKey(categorization.category)

  // Generate the base interpretation prompt
  let prompt = generateGurujiInterpretationPrompt(birthDetails, chartData, query)

  // Enhance the prompt with categorization information
  prompt += `\n\nADDITIONAL CONTEXT:
The user's query has been categorized as primarily about "${categorization.category}" 
and specifically related to "${categorization.subcategory}" (confidence: ${(categorization.confidence * 100).toFixed(1)}%).
${categorization.alternativeCategory ? `It may also relate to "${categorization.alternativeCategory}".` : ""}

Please focus your interpretation on this specific area while still providing a holistic view.
`

  // If we have a matching category in our LIFE_AREA_INDICATORS, add specific guidance
  if (categoryKey && LIFE_AREA_INDICATORS[categoryKey]) {
    const areaInfo = LIFE_AREA_INDICATORS[categoryKey]

    prompt += `\n\nFOR THIS SPECIFIC CATEGORY:
- Focus on houses: ${areaInfo.houses.join(", ")}
- Key planets: ${areaInfo.planets.join(", ")}
- Primary chart: ${areaInfo.divisionalChart}
- D1 chart elements to analyze: ${areaInfo.d1Elements}
- D9 chart elements to analyze: ${areaInfo.d9Elements}
`
  }

  return prompt
}

/**
 * Maps a category name to the corresponding key in LIFE_AREA_INDICATORS
 */
function mapCategoryToKey(category: string): string | null {
  const categoryMap: Record<string, string> = {
    "Career and Professional Life": "careerProfessional",
    "Financial Well-being": "financialWellbeing",
    "Personal Relationships": "personalRelationships",
    "Health and Well-being": "healthWellbeing",
    "Personal Development": "personalDevelopment",
    "Spiritual Life": "spiritualLife",
    "Creativity and Self-expression": "creativitySelfExpression",
    "Intellectual Life": "intellectualLife",
    "Social Life and Community": "socialLifeCommunity",
    "Home and Living Environment": "homeLivingEnvironment",
    "Legacy and Life Purpose": "legacyLifePurpose",
    "Adventure and Travel": "adventureTravel",
    "Time Management and Life Balance": "timeManagementBalance",
  }

  return categoryMap[category] || null
}
