import type { BirthDetails, AstrologyChart } from "@/types/astrology"
import { generateEnhancedGurujiPrompt } from "./enhanced-prompt-generator"
import { logInfo, logError } from "@/lib/logging-service"

/**
 * Generates a personalized prompt for Guruji based on the birth chart and query
 * Now uses the enhanced prompt generator with detailed planetary analysis
 */
export function generateGurujiInterpretationPrompt(
  birthDetails: BirthDetails,
  chartData: AstrologyChart,
  query?: string,
): string {
  logInfo("prompt-generator", "Generating Guruji interpretation prompt (using enhanced generator)", {
    hasQuery: !!query,
    birthDetailsProvided: !!birthDetails,
    chartDataProvided: !!chartData,
  })

  try {
    // Use the enhanced prompt generator for better analysis
    return generateEnhancedGurujiPrompt(birthDetails, chartData, query)
  } catch (error) {
    logError("prompt-generator", "Error in enhanced prompt generation, falling back to basic prompt", error)

    // Fallback to basic prompt if enhanced generation fails
    const isAskingForRemedies = query
      ? /remed(y|ies)|solution|fix|help|what (can|should) (i|we) do|how (can|should) (i|we)|suggestion|advice|upay|mantra|gemstone|stone|ratna/i.test(
          query,
        )
      : false

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
