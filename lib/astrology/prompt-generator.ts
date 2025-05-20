import type { BirthDetails, AstrologyChart } from "@/types/astrology"
import { logInfo, logError } from "@/lib/logging-service"

/**
 * Generates a personalized prompt for Guruji based on the birth chart and query
 */
export function generateGurujiInterpretationPrompt(
  birthDetails: BirthDetails,
  chartData: AstrologyChart,
  query?: string,
): string {
  logInfo("prompt-generator", "Generating Guruji interpretation prompt", {
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

  logInfo("prompt-generator", "Remedy request detection", {
    isAskingForRemedies,
    query: query?.substring(0, 50),
  })

  try {
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

    // Format query context
    const queryContext = query
      ? `The person is asking about: ${query}`
      : "The person is seeking general astrological guidance"

    // Conditional remedies instruction based on whether the user is asking for remedies
    const remediesInstruction = isAskingForRemedies
      ? "Since the person is specifically asking about remedies, provide traditional remedies such as mantras, gemstones, or spiritual practices that might help balance challenging planetary energies."
      : "Do NOT provide remedies unless specifically asked. Focus on interpretation and analysis only."

    // Generate the complete prompt
    const prompt = `
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

QUERY CONTEXT:
${queryContext}

IMPORTANT INSTRUCTION ABOUT REMEDIES:
${remediesInstruction}

As Guruji, provide a Vedic astrological interpretation based on this chart. Incorporate Sanskrit terms where appropriate, and reference ancient texts when relevant. Your analysis should be insightful, respectful, and spiritually oriented. Avoid making extreme predictions about death, disease, or disaster. Focus on providing guidance that helps the person understand their karmic patterns and potential paths forward.

Remember to speak in Guruji's voice - wise and compassionate, and with occasional references to ancient wisdom.
`

    return prompt
  } catch (error) {
    logError("prompt-generator", "Error generating prompt", error)
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
 * Export the function with the name that's being imported elsewhere
 * This is the function that's being imported in astrology-manager.tsx
 */
export const generateGurujiAstrologyPrompt = generateGurujiInterpretationPrompt
