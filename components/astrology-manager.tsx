"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Pencil, Trash2 } from "lucide-react"
import BirthDetailsForm from "./birth-details-form"
import AstrologySummary from "./astrology-summary"
import type { BirthDetails, AstrologyChart } from "@/types/astrology"
import { generateGurujiAstrologyPrompt } from "@/lib/astrology/prompt-generator"
import { getBirthDetails, clearBirthDetails } from "@/lib/astrology/storage"
import { calculateVedicChart } from "@/lib/astrology/calculator"

// Add import for logging service at the top of the file
import { logInfo, logDebug, logError, logWarn } from "@/lib/logging-service"

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

  // Load stored birth details on component mount
  useEffect(() => {
    async function loadStoredDetails() {
      // Only run in browser environment
      if (typeof window === "undefined") {
        setIsLoading(false)
        return
      }

      try {
        const storedDetails = getBirthDetails()
        if (storedDetails && characterId === "guruji") {
          setBirthDetails(storedDetails)

          try {
            // Calculate chart from stored details
            const chart = await calculateVedicChart(storedDetails)
            setChartData(chart)

            try {
              // Generate prompt for Guruji
              const prompt = generateGurujiAstrologyPrompt(storedDetails, chart, currentQuery)
              onPromptGenerated(prompt)
            } catch (promptError) {
              console.error("Error generating prompt:", promptError)
              // Generate a simplified prompt
              const fallbackPrompt = `
You are Guruji, a 53-year-old Sanskrit scholar and Vedic astrologer from Varanasi.
The person has provided their birth details: ${storedDetails.name || "The native"} born on ${storedDetails.date} at ${storedDetails.time} in ${storedDetails.city}, ${storedDetails.country}.
${currentQuery ? `They are asking about: ${currentQuery}` : "They are seeking general astrological guidance."}
Provide a Vedic astrological interpretation that is insightful, respectful, and spiritually oriented.
`
              onPromptGenerated(fallbackPrompt)
            }
          } catch (chartError) {
            console.error("Error calculating chart:", chartError)
            // Notify the user but don't break the application
            setChartData(null)
          }
        }
      } catch (error) {
        console.error("Error loading stored birth details:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadStoredDetails()
  }, [characterId, onPromptGenerated, currentQuery])

  const handleOpenForm = () => {
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
  }

  // Update the handleBirthDetailsSubmit function to include better logging
  const handleBirthDetailsSubmit = async (details: BirthDetails, chart: AstrologyChart) => {
    setBirthDetails(details)
    setChartData(chart)
    setIsFormOpen(false)
    setShowSummary(true)

    // Generate the prompt for Guruji
    if (characterId === "guruji") {
      try {
        logInfo("AstrologyManager", "Generating interpretation prompt for Guruji", {
          name: details.name,
          birthDate: details.date,
          hasQuery: !!currentQuery,
        })

        const prompt = generateGurujiAstrologyPrompt(details, chart, currentQuery)
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
${currentQuery ? `They are asking about: ${currentQuery}` : "They are seeking general astrological guidance."}
Provide a Vedic astrological interpretation that is insightful, respectful, and spiritually oriented.
`
        logWarn("AstrologyManager", "Using fallback prompt", { fallbackPrompt })
        onPromptGenerated(fallbackPrompt)
      }
    }
  }

  const handleCloseSummary = () => {
    setShowSummary(false)
  }

  const handleClearBirthDetails = () => {
    clearBirthDetails()
    setBirthDetails(null)
    setChartData(null)

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
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-sm text-amber-800 mb-2">
            For a personalized astrological reading, Guruji needs your birth details.
          </p>
          <Button variant="outline" size="sm" onClick={handleOpenForm}>
            Provide Birth Details
          </Button>
        </div>
      )}

      {birthDetails && chartData && (
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
              <span className="font-medium">Birth:</span> {new Date(chartData.native.birthDate).toLocaleDateString()} at{" "}
              {new Date(chartData.native.birthDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
