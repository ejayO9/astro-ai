import type { BirthDetails } from "@/types/astrology"

const STORAGE_KEY = "user_birth_details"

/**
 * Saves birth details to localStorage
 */
export function saveBirthDetails(details: BirthDetails): void {
  try {
    // Don't store sensitive data in localStorage in a production app
    // For a real app, consider encrypting the data or using a more secure storage method
    localStorage.setItem(STORAGE_KEY, JSON.stringify(details))
  } catch (error) {
    console.error("Failed to save birth details to localStorage:", error)
  }
}

/**
 * Retrieves birth details from localStorage
 */
export function getBirthDetails(): BirthDetails | null {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY)
    if (!storedData) return null

    return JSON.parse(storedData) as BirthDetails
  } catch (error) {
    console.error("Failed to retrieve birth details from localStorage:", error)
    return null
  }
}

/**
 * Clears birth details from localStorage
 */
export function clearBirthDetails(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error("Failed to clear birth details from localStorage:", error)
  }
}

/**
 * Updates specific fields in the stored birth details
 */
export function updateBirthDetails(updates: Partial<BirthDetails>): void {
  try {
    const currentDetails = getBirthDetails()
    if (!currentDetails) {
      saveBirthDetails(updates as BirthDetails)
      return
    }

    saveBirthDetails({
      ...currentDetails,
      ...updates,
    })
  } catch (error) {
    console.error("Failed to update birth details in localStorage:", error)
  }
}
