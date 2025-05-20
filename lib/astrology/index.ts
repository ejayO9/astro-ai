// Re-export all astrology-related utilities
// Use absolute imports instead of relative imports to avoid path issues
import { calculateVedicChart } from "@/lib/astrology/calculator"
import { getCityCoordinates } from "@/lib/astrology/geocoding"
import { generateGurujiAstrologyPrompt } from "@/lib/astrology/prompt-generator"
import { saveBirthDetails, getBirthDetails, clearBirthDetails, updateBirthDetails } from "@/lib/astrology/storage"

export {
  calculateVedicChart,
  getCityCoordinates,
  generateGurujiAstrologyPrompt,
  saveBirthDetails,
  getBirthDetails,
  clearBirthDetails,
  updateBirthDetails,
}
