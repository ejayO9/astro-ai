import type { BirthDetails, AstrologyChart } from "@/types/astrology"
import { generatePlanetaryPositionReport } from "./planetary-analyzer"
import { analyzeUserIntent } from "./intent-analyzer" // Fixed import name
import { getHouseCharacteristics } from "./house-characteristics"
import { logInfo, logError, logDebug } from "@/lib/logging-service"

/**
 * Enhanced prompt generator that includes detailed planetary position analysis and LLM intent mapping
 */
export async function generateEnhancedGurujiPrompt(
  birthDetails: BirthDetails,
  chartData: AstrologyChart,
  query?: string,
): Promise<{
  prompt: string
  intentAnalysis: any
}> {
  logInfo("enhanced-prompt-generator", "Generating enhanced Guruji prompt with LLM intent analysis", {
    hasQuery: !!query,
    birthDetailsProvided: !!birthDetails,
    chartDataProvided: !!chartData,
  })

  // Check if the user is asking for remedies
  const isAskingForRemedies = query
    ? /remed(y|ies)|solution|fix|help|what (can|should) (i|we) do|how (can|should) (i|we)|suggestion|advice|upay|mantra|gemstone|stone|ratna/i.test(
        query,
      )
    : false

  logInfo("enhanced-prompt-generator", "Remedy request detection", {
    isAskingForRemedies,
    query: query?.substring(0, 50),
  })

  let intentAnalysis = null

  try {
    // Generate comprehensive planetary analysis
    const planetaryReport = generatePlanetaryPositionReport(chartData)

    // Analyze user intent with LLM if query is provided
    if (query) {
      try {
        intentAnalysis = await analyzeUserIntent(query) // Fixed function name
        logDebug("enhanced-prompt-generator", "Intent analysis completed", {
          primaryIntent: intentAnalysis.primaryIntent,
          primaryHouses: intentAnalysis.primaryHouses,
          confidence: intentAnalysis.confidence,
        })
      } catch (intentError) {
        logError("enhanced-prompt-generator", "Intent analysis failed, continuing without it", intentError)
        intentAnalysis = null
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

    // Format detailed planetary positions with analysis
    const detailedPlanetaryPositions = planetaryReport.planetaryAnalyses
      .map((analysis) => {
        let planetInfo = `${analysis.planet}: ${analysis.sign} at ${analysis.degree.toFixed(2)}° in ${analysis.nakshatra} Nakshatra, Pada ${analysis.nakshatraPada}`
        planetInfo += `${analysis.isRetrograde ? " (Retrograde)" : ""}, in House ${analysis.house}`
        planetInfo += `\n  - Dignity: ${analysis.dignity}`
        planetInfo += `\n  - Strength: ${analysis.strength}`
        planetInfo += `\n  - House Significations: ${analysis.houseSignifications.significations.slice(0, 3).join(", ")}`
        planetInfo += `\n  - Planet Significations: ${analysis.planetCharacteristics.significations.slice(0, 3).join(", ")}`

        if (analysis.effects.length > 0) {
          planetInfo += `\n  - Key Effects: ${analysis.effects.slice(0, 2).join("; ")}`
        }

        if (analysis.remedies.length > 0 && isAskingForRemedies) {
          planetInfo += `\n  - Remedies: ${analysis.remedies.slice(0, 2).join("; ")}`
        }

        return planetInfo
      })
      .join("\n\n")

    // Format house occupancy analysis
    const houseOccupancyDetails = planetaryReport.houseAnalyses
      .map((analysis) => {
        let houseInfo = `House ${analysis.house} (${analysis.houseSignifications.name}): ${analysis.sign}`
        houseInfo += `\n  - Planets: ${analysis.isEmpty ? "Empty" : analysis.planets.join(", ")}`
        houseInfo += `\n  - Strength: ${analysis.houseStrength}`
        houseInfo += `\n  - Significations: ${analysis.houseSignifications.significations.slice(0, 3).join(", ")}`
        houseInfo += `\n  - Sign Characteristics: ${analysis.signCharacteristics.characteristics.slice(0, 2).join(", ")}`

        return houseInfo
      })
      .join("\n\n")

    // Format query context
    const queryContext = query
      ? `The person is asking about: ${query}`
      : "The person is seeking general astrological guidance"

    // Format intent analysis section if available
    let intentAnalysisSection = ""
    if (intentAnalysis) {
      // Get house characteristics for relevant houses
      const relevantHouses = [...intentAnalysis.primaryHouses, ...intentAnalysis.secondaryHouses]
      const houseCharacteristics = getHouseCharacteristics(relevantHouses)

      intentAnalysisSection = `

INTENT ANALYSIS:
Primary Intent: ${intentAnalysis.primaryIntent}
Secondary Intents: ${intentAnalysis.secondaryIntents.join(", ")}
Primary Houses to Focus: ${intentAnalysis.primaryHouses.join(", ")}
${intentAnalysis.secondaryHouses.length > 0 ? `Secondary Houses: ${intentAnalysis.secondaryHouses.join(", ")}` : ""}
Confidence Level: ${Math.round(intentAnalysis.confidence * 100)}%
Is Asking for Remedies: ${intentAnalysis.isAskingForRemedies ? "Yes" : "No"}
Specific Concerns: ${intentAnalysis.specificConcerns.join(", ")}

HOUSE-SPECIFIC ANALYSIS FOR THIS QUERY:
${houseCharacteristics
  .map(
    (house) => `House ${house.number} (${house.name}):
  - Key significations to focus: ${getRelevantSignifications(house, intentAnalysis.specificConcerns).join(", ")}
  - Body parts: ${house.body.join(", ")}`,
  )
  .join("\n\n")}

ANALYSIS APPROACH:
${intentAnalysis.recommendations.analysisApproach}

INTENT SUMMARY:
${intentAnalysis.summary}
`
    }

    // Conditional remedies instruction based on whether the user is asking for remedies
    const remediesInstruction = isAskingForRemedies
      ? "Since the person is specifically asking about remedies, provide traditional remedies such as mantras, gemstones, or spiritual practices that might help balance challenging planetary energies. Focus on the planets that need strengthening based on the analysis above."
      : "Do NOT provide remedies unless specifically asked. Focus on interpretation and analysis only."

    // Generate the complete enhanced prompt
    const prompt = `
You are Guruji, a 53-year-old Sanskrit scholar and Vedic astrologer from Varanasi. You are analyzing a birth chart with comprehensive planetary position analysis and advanced intent mapping.

BIRTH INFORMATION:
Name: ${birthDetails.name || "The native"}
Birth Date and Time: ${birthDateStr}
Birth Place: ${birthDetails.city || ""}, ${birthDetails.country || ""}
Coordinates: ${birthDetails.latitude}° N, ${birthDetails.longitude}° E
Timezone: ${birthDetails.timezone}

CHART DETAILS:
${ascendantDetails}

DETAILED PLANETARY POSITIONS WITH ANALYSIS:
${detailedPlanetaryPositions}

HOUSE OCCUPANCY ANALYSIS:
${houseOccupancyDetails}

PLANETARY POSITION SUMMARY:
${planetaryReport.summary}

QUERY CONTEXT:
${queryContext}
${intentAnalysisSection}

IMPORTANT INSTRUCTION ABOUT REMEDIES:
${remediesInstruction}

ANALYSIS GUIDELINES:
${
  intentAnalysis
    ? `
SPECIFIC GUIDANCE FOR THIS QUERY:
The analysis has determined this query relates to: ${intentAnalysis.primaryIntent} with ${Math.round(intentAnalysis.confidence * 100)}% confidence.

PRIMARY FOCUS: Examine houses ${intentAnalysis.primaryHouses.join(", ")} in detail, as these are most relevant to the person's question.
${intentAnalysis.secondaryHouses.length > 0 ? `SECONDARY FOCUS: Also consider houses ${intentAnalysis.secondaryHouses.join(", ")} for additional insights.` : ""}

SPECIFIC CONCERNS TO ADDRESS:
${intentAnalysis.specificConcerns.map((concern) => `- ${concern}`).join("\n")}

ANALYSIS APPROACH: ${intentAnalysis.recommendations.analysisApproach}
`
    : `
GENERAL GUIDANCE:
Provide a comprehensive analysis covering all major life areas as no specific intent was detected.
`
}

Based on the detailed planetary position analysis above, you have comprehensive information about:
1. Each planet's dignity (exalted, own sign, debilitated, etc.)
2. Each planet's strength in its current position
3. House significations and how planets influence them
4. Sign characteristics and their impact on planetary expression
5. Specific effects and potential remedies for each planetary position
${intentAnalysis ? `6. Specific life areas the person is asking about based on intent analysis` : ""}

Use this detailed analysis to provide deep, accurate insights. Reference specific planetary dignities, house placements, and their combined effects. When a planet is strong (exalted, own sign, or high strength), emphasize the positive results it will give. When a planet is weak or debilitated, explain how this creates opportunities for growth and what areas need attention.

${
  intentAnalysis
    ? `
IMPORTANT: Focus your response primarily on the houses and life areas identified through intent analysis above. The person is specifically asking about ${intentAnalysis.primaryIntent}, so tailor your interpretation accordingly.
`
    : ""
}

As Guruji, provide a Vedic astrological interpretation based on this comprehensive chart analysis. Incorporate Sanskrit terms where appropriate, and reference ancient texts when relevant. Your analysis should be insightful, respectful, and spiritually oriented. Avoid making extreme predictions about death, disease, or disaster. Focus on providing guidance that helps the person understand their karmic patterns and potential paths forward.

Remember to speak in Guruji's voice - wise and compassionate, and with occasional references to ancient wisdom. Use the specific planetary analysis data provided above to give precise and personalized insights.
`

    logInfo("enhanced-prompt-generator", "Enhanced prompt generated successfully", {
      promptLength: prompt.length,
      includesRemedies: isAskingForRemedies,
      hasIntentAnalysis: !!intentAnalysis,
      primaryHouses: intentAnalysis?.primaryHouses || [],
    })

    return {
      prompt,
      intentAnalysis,
    }
  } catch (error) {
    logError("enhanced-prompt-generator", "Error generating enhanced prompt", error)
    // Return a simplified prompt that will still work
    const remediesInstruction = isAskingForRemedies
      ? "Since the person is specifically asking about remedies, provide traditional remedies such as mantras, gemstones, or spiritual practices."
      : "Do NOT provide remedies unless specifically asked. Focus on interpretation and analysis only."

    return {
      prompt: `
You are Guruji, a 53-year-old Sanskrit scholar and Vedic astrologer from Varanasi. 

The person has provided their birth details: ${birthDetails.name || "The native"} born on ${birthDetails.date} at ${birthDetails.time} in ${birthDetails.city}, ${birthDetails.country}.

${query ? `They are asking about: ${query}` : "They are seeking general astrological guidance."}

IMPORTANT INSTRUCTION ABOUT REMEDIES:
${remediesInstruction}

As Guruji, provide a Vedic astrological interpretation. Incorporate Sanskrit terms where appropriate, and reference ancient texts when relevant. Your analysis should be insightful, respectful, and spiritually oriented.

Remember to speak in Guruji's voice - wise and compassionate, and with occasional references to ancient wisdom.
`,
      intentAnalysis: null,
    }
  }
}

/**
 * Gets relevant significations for a house based on specific concerns
 */
function getRelevantSignifications(house: any, specificConcerns: string[]): string[] {
  const concerns = specificConcerns.map((concern) => concern.toLowerCase())

  const allSignifications = [
    ...house.material,
    ...house.family,
    ...house.career,
    ...house.relationships,
    ...house.health,
    ...house.spiritual,
    ...house.lifeEvents,
  ]

  // Filter significations that match specific concerns
  const relevant = allSignifications.filter((sig) =>
    concerns.some((concern) => sig.toLowerCase().includes(concern) || concern.includes(sig.toLowerCase())),
  )

  // Return top 5 relevant or first 5 if none match
  return relevant.length > 0 ? relevant.slice(0, 5) : allSignifications.slice(0, 5)
}
