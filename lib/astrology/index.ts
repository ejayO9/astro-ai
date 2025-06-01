// Re-export all astrology-related utilities
// Use absolute imports instead of relative imports to avoid path issues
import { calculateVedicChart as calculateVedicChartInternal } from "@/lib/astrology/calculator"
import { getCityCoordinates } from "@/lib/astrology/geocoding"
import { generateGurujiAstrologyPrompt } from "@/lib/astrology/prompt-generator"
import { saveBirthDetails, getBirthDetails, clearBirthDetails, updateBirthDetails } from "@/lib/astrology/storage"

// Import the new enhanced calculator
import { calculateEnhancedVedicChart } from "@/lib/astrology/enhanced-calculator"

// Import API client utilities
import {
  AstrologyApiClient,
  createAstrologyApiClient,
  convertBirthDetailsToApiFormat,
} from "@/lib/astrology/api-client"

// Import new utilities
import { generateGurujiInterpretationPrompt } from "@/lib/astrology/interpreter"
import { generateEnhancedGurujiPrompt } from "@/lib/astrology/enhanced-prompt-generator"
import { generatePlanetaryPositionReport } from "@/lib/astrology/planetary-analyzer"
import { analyzeUserIntent, getIntentAnalysisForDisplay } from "@/lib/astrology/intent-analyzer"
import {
  mapIntentToHouses,
  getHouseCharacteristics,
  getAllHouseSignifications,
  findHousesForSignification,
} from "@/lib/astrology/house-characteristics"

// Export the enhanced calculator as the default calculateVedicChart
export { calculateEnhancedVedicChart as calculateVedicChart }

// Also export the original for backward compatibility
export { calculateVedicChartInternal }

export {
  // Original functions
  getCityCoordinates,
  generateGurujiAstrologyPrompt,
  saveBirthDetails,
  getBirthDetails,
  clearBirthDetails,
  updateBirthDetails,
  // Enhanced functions
  // API client
  AstrologyApiClient,
  createAstrologyApiClient,
  convertBirthDetailsToApiFormat,
  // New functions
  generateGurujiInterpretationPrompt,
  generateEnhancedGurujiPrompt,
  generatePlanetaryPositionReport,
  analyzeUserIntent,
  getIntentAnalysisForDisplay,
  mapIntentToHouses,
  getHouseCharacteristics,
  getAllHouseSignifications,
  findHousesForSignification,
}

// Set the enhanced calculator as the default export
export { calculateEnhancedVedicChart as default } from "./enhanced-calculator"
