import type { BirthDetails, AstrologyChart } from "@/types/astrology"
import { generatePlanetaryPositionReport } from "./planetary-analyzer"
import { analyzeLLMIntent } from "./llm-intent-extractor"
import { getHouseCharacteristics } from "./house-characteristics"
import { logInfo, logError, logDebug } from "@/lib/logging-service"

/**
 * Enhanced prompt generator that includes detailed planetary position analysis and LLM intent mapping
 */
export async function generateEnhancedGurujiPrompt(
  birthDetails: BirthDetails,
  chartData: AstrologyChart,
  query?: string,
): Promise<string> {
  console.log("🎯 [EnhancedPromptGenerator] generateEnhancedGurujiPrompt CALLED")
  console.log("📁 File: lib/astrology/enhanced-prompt-generator.ts")
  console.log("🔧 Function: generateEnhancedGurujiPrompt")
  console.log("📊 Parameters:", {
    birthDetails: { name: birthDetails.name, date: birthDetails.date },
    hasChartData: !!chartData,
    query: query || "(no query)"
  })

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

  console.log("🔍 [EnhancedPromptGenerator] Remedy detection result:", isAskingForRemedies)

  logInfo("enhanced-prompt-generator", "Remedy request detection", {
    isAskingForRemedies,
    query: query?.substring(0, 50),
  })

  try {
    console.log("🚀 [EnhancedPromptGenerator] About to call generatePlanetaryPositionReport")
    console.log("📁 Will call: lib/astrology/planetary-analyzer.ts")
    console.log("🔧 Will call function: generatePlanetaryPositionReport")

    // Generate comprehensive planetary analysis
    const planetaryReport = generatePlanetaryPositionReport(chartData)
    
    console.log("✅ [EnhancedPromptGenerator] Planetary report generated")
    console.log("📊 Planetary analyses count:", planetaryReport.planetaryAnalyses.length)
    console.log("📊 House analyses count:", planetaryReport.houseAnalyses.length)

    // Analyze user intent with LLM if query is provided
    let intentAnalysis = null
    if (query) {
      try {
        console.log("🚀 [EnhancedPromptGenerator] About to call analyzeLLMIntent")
        console.log("📁 Will call: lib/astrology/llm-intent-extractor.ts")
        console.log("🔧 Will call function: analyzeLLMIntent")
        console.log("🔍 Query to analyze:", query)

        intentAnalysis = await analyzeLLMIntent(query)
        
        console.log("✅ [EnhancedPromptGenerator] LLM intent analysis completed")
        console.log("📊 Intent analysis result:", {
          primaryIntent: intentAnalysis.intent.primaryIntent,
          primaryHouses: intentAnalysis.houseMapping.primaryHouses,
          confidence: intentAnalysis.confidence
        })

        logDebug("enhanced-prompt-generator", "LLM intent analysis completed", {
          primaryIntent: intentAnalysis.intent.primaryIntent,
          primaryHouses: intentAnalysis.houseMapping.primaryHouses,
          confidence: intentAnalysis.confidence,
        })
      } catch (intentError) {
        console.error("❌ [EnhancedPromptGenerator] LLM intent analysis failed:", intentError)
        logError("enhanced-prompt-generator", "LLM intent analysis failed, continuing without it", intentError)
        intentAnalysis = null
      }
    } else {
      console.log("ℹ️ [EnhancedPromptGenerator] No query provided, skipping intent analysis")
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

    // Format LLM intent analysis section if available
    let intentAnalysisSection = ""
    if (intentAnalysis) {
      // Get house characteristics for relevant houses
      const relevantHouses = [
        ...intentAnalysis.houseMapping.primaryHouses,
        ...intentAnalysis.houseMapping.secondaryHouses,
      ]
      const houseCharacteristics = getHouseCharacteristics(relevantHouses)

      intentAnalysisSection = `

LLM INTENT ANALYSIS:
Primary Intent: ${intentAnalysis.intent.primaryIntent}
Secondary Intents: ${intentAnalysis.intent.secondaryIntents.join(", ")}
Life Areas: ${intentAnalysis.intent.lifeAreas.join(", ")}
Specific Concerns: ${intentAnalysis.intent.specificConcerns.join(", ")}
Emotional Tone: ${intentAnalysis.intent.emotionalTone}
Confidence Level: ${Math.round(intentAnalysis.confidence * 100)}%

HOUSE MAPPING FROM LLM:
Primary Houses to Focus: ${intentAnalysis.houseMapping.primaryHouses.join(", ")}
${intentAnalysis.houseMapping.secondaryHouses.length > 0 ? `Secondary Houses: ${intentAnalysis.houseMapping.secondaryHouses.join(", ")}` : ""}

HOUSE-SPECIFIC ANALYSIS FOR THIS QUERY:
${houseCharacteristics
  .map(
    (house) => `House ${house.number} (${house.name}):
  - Reason for relevance: ${intentAnalysis.houseMapping.houseReasons[house.number.toString()] || "Supporting analysis"}
  - Key significations to focus: ${getRelevantSignifications(house, intentAnalysis.intent.lifeAreas).join(", ")}
  - Body parts: ${house.body.join(", ")}`,
  )
  .join("\n\n")}

ANALYSIS APPROACH FROM LLM:
${intentAnalysis.houseMapping.analysisApproach}

LLM INTENT SUMMARY:
${intentAnalysis.intent.primaryIntent} - Focus on houses ${intentAnalysis.houseMapping.primaryHouses.join(", ")} with ${Math.round(intentAnalysis.confidence * 100)}% confidence.
`
    }

    // Conditional remedies instruction based on whether the user is asking for remedies
    const remediesInstruction = isAskingForRemedies
      ? "Since the person is specifically asking about remedies, provide traditional remedies such as mantras, gemstones, or spiritual practices that might help balance challenging planetary energies. Focus on the planets that need strengthening based on the analysis above."
      : "Do NOT provide remedies unless specifically asked. Focus on interpretation and analysis only."

    // Generate the complete enhanced prompt
    const prompt = `
You are Guruji, a 53-year-old Sanskrit scholar and Vedic astrologer from Varanasi. You are analyzing a birth chart with comprehensive planetary position analysis and advanced LLM intent mapping.

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
SPECIFIC GUIDANCE FOR THIS QUERY (FROM LLM ANALYSIS):
The LLM has analyzed this query and determined it relates to: ${intentAnalysis.intent.lifeAreas.join(", ")} with ${Math.round(intentAnalysis.confidence * 100)}% confidence.

PRIMARY FOCUS: Examine houses ${intentAnalysis.houseMapping.primaryHouses.join(", ")} in detail, as these are most relevant to the person's question.
${intentAnalysis.houseMapping.secondaryHouses.length > 0 ? `SECONDARY FOCUS: Also consider houses ${intentAnalysis.houseMapping.secondaryHouses.join(", ")} for additional insights.` : ""}

SPECIFIC CONCERNS TO ADDRESS:
${intentAnalysis.intent.specificConcerns.map((concern) => `- ${concern}`).join("\n")}

EMOTIONAL TONE: The person's emotional tone is ${intentAnalysis.intent.emotionalTone}. Respond with appropriate sensitivity.

ANALYSIS APPROACH: ${intentAnalysis.houseMapping.analysisApproach}
`
    : `
GENERAL GUIDANCE:
Provide a comprehensive analysis covering all major life areas as no specific intent was detected through LLM analysis.
`
}

Based on the detailed planetary position analysis above, you have comprehensive information about:
1. Each planet's dignity (exalted, own sign, debilitated, etc.)
2. Each planet's strength in its current position
3. House significations and how planets influence them
4. Sign characteristics and their impact on planetary expression
5. Specific effects and potential remedies for each planetary position
${intentAnalysis ? `6. Specific life areas the person is asking about based on advanced LLM intent analysis` : ""}

Use this detailed analysis to provide deep, accurate insights. Reference specific planetary dignities, house placements, and their combined effects. When a planet is strong (exalted, own sign, or high strength), emphasize the positive results it will give. When a planet is weak or debilitated, explain how this creates opportunities for growth and what areas need attention.

${
  intentAnalysis
    ? `
IMPORTANT: Focus your response primarily on the houses and life areas identified through LLM analysis above. The person is specifically asking about ${intentAnalysis.intent.lifeAreas.join(" and ")}, so tailor your interpretation accordingly.
`
    : ""
}

As Guruji, provide a Vedic astrological interpretation based on this comprehensive chart analysis. Incorporate Sanskrit terms where appropriate, and reference ancient texts when relevant. Your analysis should be insightful, respectful, and spiritually oriented. Avoid making extreme predictions about death, disease, or disaster. Focus on providing guidance that helps the person understand their karmic patterns and potential paths forward.

Remember to speak in Guruji's voice - wise and compassionate, and with occasional references to ancient wisdom. Use the specific planetary analysis data provided above to give precise and personalized insights.
`

    console.log("🔧 [EnhancedPromptGenerator] Assembling final prompt...")
    console.log("📊 Prompt components assembled:")
    console.log("  - Birth information: ✅")
    console.log("  - Chart details: ✅")
    console.log("  - Planetary positions: ✅ (" + planetaryReport.planetaryAnalyses.length + " planets)")
    console.log("  - House occupancy: ✅ (" + planetaryReport.houseAnalyses.length + " houses)")
    console.log("  - Intent analysis: " + (intentAnalysis ? "✅" : "❌"))
    console.log("  - Remedies instruction: ✅ (asking for remedies: " + isAskingForRemedies + ")")
    console.log("📄 Final prompt length:", prompt.length)
    console.log("📄 Final prompt preview (first 500 chars):", prompt.substring(0, 500) + "...")

    logInfo("enhanced-prompt-generator", "Enhanced prompt generated successfully", {
      promptLength: prompt.length,
      includesRemedies: isAskingForRemedies,
      hasLLMIntentAnalysis: !!intentAnalysis,
      primaryHouses: intentAnalysis?.houseMapping.primaryHouses || [],
    })

    console.log("✅ [EnhancedPromptGenerator] Prompt generation completed successfully")
    console.log("📤 [EnhancedPromptGenerator] Returning prompt to caller")

    return prompt
  } catch (error) {
    logError("enhanced-prompt-generator", "Error generating enhanced prompt", error)
    // Return a simplified prompt that will still work
    const remediesInstruction = isAskingForRemedies
      ? "Since the person is specifically asking about remedies, provide traditional remedies such as mantras, gemstones, or spiritual practices."
      : "Do NOT provide remedies unless specifically asked. Focus on interpretation and analysis only."

    return `
You are Guruji, a 53-year-old Sanskrit scholar and Vedic astrologer from Varanasi. 

The person has provided their birth details: ${birthDetails.name || "The native"} born on ${birthDetails.date} at ${birthDetails.time} in ${birthDetails.city}, ${birthDetails.country}.

${query ? `They are asking about: ${query}` : "They are seeking general astrological guidance."}

IMPORTANT INSTRUCTION ABOUT REMEDIES:
${remediesInstruction}

As Guruji, provide a Vedic astrological interpretation. Incorporate Sanskrit terms where appropriate, and reference ancient texts when relevant. Your analysis should be insightful, respectful, and spiritually oriented.

Remember to speak in Guruji's voice - wise and compassionate, and with occasional references to ancient wisdom.
`
  }
}

/**
 * Gets relevant significations for a house based on life areas
 */
function getRelevantSignifications(house: any, lifeAreas: string[]): string[] {
  const areas = lifeAreas.map((area) => area.toLowerCase())

  const allSignifications = [
    ...house.material,
    ...house.family,
    ...house.career,
    ...house.relationships,
    ...house.health,
    ...house.spiritual,
    ...house.lifeEvents,
  ]

  // Filter significations that match life areas
  const relevant = allSignifications.filter((sig) =>
    areas.some((area) => sig.toLowerCase().includes(area) || area.includes(sig.toLowerCase())),
  )

  // Return top 5 relevant or first 5 if none match
  return relevant.length > 0 ? relevant.slice(0, 5) : allSignifications.slice(0, 5)
}
