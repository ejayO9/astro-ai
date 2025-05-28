"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Pencil, Trash2 } from "lucide-react"
import BirthDetailsForm from "./birth-details-form"
import AstrologySummary from "./astrology-summary"
import type { BirthDetails, AstrologyChart } from "@/types/astrology"
import { generateGurujiAstrologyPrompt } from "@/lib/astrology/prompt-generator"
import { getBirthDetails, clearBirthDetails, saveBirthDetails } from "@/lib/astrology/storage"
import { calculateEnhancedVedicChart } from "@/lib/astrology/enhanced-calculator"

// Add import for logging service at the top of the file
import { logInfo, logDebug, logError, logWarn } from "@/lib/logging-service"
import RasiChartViewer from "./rasi-chart-viewer"

// Default birth details for Guruji character
const DEFAULT_GURUJI_BIRTH_DETAILS: BirthDetails = {
  date: "1997-02-08", // 08/02/1997 in YYYY-MM-DD format
  time: "07:47", // 7:47 AM in 24-hour format
  latitude: 22.5726, // Kolkata coordinates
  longitude: 88.3639,
  timezone: "+05:30", // Indian timezone
  city: "Kolkata",
  country: "India",
  name: "Guruji",
}

interface AstrologyManagerProps {
  onPromptGenerated: (prompt: string) => void
  characterId: string
  currentQuery?: string
}

export default function AstrologyManager({ onPromptGenerated, characterId, currentQuery }: AstrologyManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [birthDetails, setBirthDetails] = useState<BirthDetails | null>(null)
  const [chartData, setChartData] = useState<AstrologyChart | null>(null)
  const [showSummary, setShowSummary] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasStoredData, setHasStoredData] = useState(false)

  // Use refs to track if we've already loaded data and generated prompts
  const hasLoadedRef = useRef(false)
  const lastQueryRef = useRef<string | undefined>(undefined)

  // Memoize the prompt generation function to prevent unnecessary re-renders
  const generatePrompt = useCallback(
    async (details: BirthDetails, chart: AstrologyChart, query?: string) => {
      if (characterId !== "guruji") return

      try {
        logInfo("AstrologyManager", "Generating interpretation prompt for Guruji", {
          name: details.name,
          birthDate: details.date,
          hasQuery: !!query,
        })

        const prompt = generateGurujiAstrologyPrompt(details, chart, query)
        logDebug("AstrologyManager", "Prompt generated successfully", {
          promptLength: prompt.length,
        })

        onPromptGenerated(prompt)
        logInfo("AstrologyManager", "Prompt passed to parent component")
      } catch (error) {
        logError("AstrologyManager", "Error generating prompt", error)
        // Generate a simplified prompt
        const fallbackPrompt = `
You are Guruji, a 53-year-old Sanskrit scholar and Vedic astrologer from Varanasi.
The person has provided their birth details: ${details.name || "The native"} born on ${details.date} at ${details.time} in ${details.city}, ${details.country}.
${query ? `They are asking about: ${query}` : "They are seeking general astrological guidance."}
Provide a Vedic astrological interpretation that is insightful, respectful, and spiritually oriented.
`
        logWarn("AstrologyManager", "Using fallback prompt", { fallbackPrompt })
        onPromptGenerated(fallbackPrompt)
      }
    },
    [characterId, onPromptGenerated],
  )

  // Load stored birth details on component mount - only run once
  useEffect(() => {
    async function loadStoredDetails() {
      // Only run in browser environment and if we haven't loaded yet
      if (typeof window === "undefined" || hasLoadedRef.current) {
        setIsLoading(false)
        return
      }

      try {
        const storedDetails = getBirthDetails()
        let detailsToUse = storedDetails

        // If no stored details and character is Guruji, use default details
        if (!storedDetails && characterId === "guruji") {
          detailsToUse = DEFAULT_GURUJI_BIRTH_DETAILS
          // Save default details to localStorage for consistency
          saveBirthDetails(DEFAULT_GURUJI_BIRTH_DETAILS)
          setHasStoredData(true)
        }

        if (detailsToUse && characterId === "guruji") {
          setBirthDetails(detailsToUse)

          try {
            // Calculate chart from stored details
            const chart = await calculateEnhancedVedicChart(detailsToUse)
            setChartData(chart)

            // Generate prompt for Guruji
            await generatePrompt(detailsToUse, chart, currentQuery)
            lastQueryRef.current = currentQuery
          } catch (chartError) {
            console.error("Error calculating chart:", chartError)
            // Notify the user but don't break the application
            setChartData(null)
          }
        }

        // Mark as loaded to prevent re-running
        hasLoadedRef.current = true
      } catch (error) {
        console.error("Error loading stored birth details:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStoredDetails()
  }, [characterId]) // Only depend on characterId, not the functions

  // Separate effect to handle query changes after initial load
  useEffect(() => {
    if (
      hasLoadedRef.current &&
      birthDetails &&
      chartData &&
      characterId === "guruji" &&
      currentQuery !== lastQueryRef.current
    ) {
      generatePrompt(birthDetails, chartData, currentQuery)
      lastQueryRef.current = currentQuery
    }
  }, [currentQuery, generatePrompt, birthDetails, chartData, characterId])

  const handleOpenForm = () => {
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
  }

  // Update the handleBirthDetailsSubmit function
  const handleBirthDetailsSubmit = async (details: BirthDetails, chart: AstrologyChart) => {
    setBirthDetails(details)
    setChartData(chart)
    setIsFormOpen(false)
    setShowSummary(true)

    // Generate the prompt for Guruji
    await generatePrompt(details, chart, currentQuery)
    lastQueryRef.current = currentQuery
  }

  const handleCloseSummary = () => {
    setShowSummary(false)
  }

  const handleClearBirthDetails = () => {
    clearBirthDetails()
    setBirthDetails(null)
    setChartData(null)
    hasLoadedRef.current = false
    lastQueryRef.current = undefined

    // Reset the prompt to default
    if (characterId === "guruji") {
      onPromptGenerated("")
    }
  }

  if (isLoading) {
    return (
      <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-md animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      </div>
    )
  }

  return (
    <>
      {characterId === "guruji" && !birthDetails && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800 mb-2">
            Guruji is using default birth details (Kolkata, 08/02/1997, 7:47 AM) for demonstration.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleOpenForm}>
              Use Your Birth Details
            </Button>
          </div>
        </div>
      )}

      {birthDetails && chartData && (
        <>
          {/* Existing birth chart summary */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Your Birth Chart</h3>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowSummary(true)}>
                  View Details
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleOpenForm}
                  title="Edit birth details"
                  className="text-gray-500 hover:text-blue-500"
                >
                  <Pencil size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearBirthDetails}
                  title="Clear birth details"
                  className="text-gray-500 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-md text-sm">
              <p>
                <span className="font-medium">Birth:</span> {new Date(chartData.native.birthDate).toLocaleDateString()}{" "}
                at {new Date(chartData.native.birthDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
              <p>
                <span className="font-medium">Location:</span> {birthDetails.city}, {birthDetails.country}
              </p>
              <p>
                <span className="font-medium">Ascendant:</span> {chartData.ascendant.sign} in{" "}
                {chartData.ascendant.nakshatra}
              </p>
            </div>
          </div>

          {/* Add the new Rasi Chart Viewer */}
          <RasiChartViewer birthDetails={birthDetails} />
        </>
      )}

      {/* Birth Details Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{birthDetails ? "Update Birth Details" : "Enter Your Birth Details"}</DialogTitle>
            <DialogDescription>
              Provide accurate birth information for a precise astrological reading.
            </DialogDescription>
          </DialogHeader>
          <BirthDetailsForm onSubmit={handleBirthDetailsSubmit} onCancel={handleCloseForm} />
        </DialogContent>
      </Dialog>

      {/* Astrology Summary Dialog */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Your Astrological Chart</DialogTitle>
            <DialogDescription>Detailed information about your birth chart.</DialogDescription>
          </DialogHeader>
          {chartData && <AstrologySummary chartData={chartData} />}
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleCloseSummary}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
