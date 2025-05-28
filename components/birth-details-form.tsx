"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2 } from "lucide-react"
import type { BirthDetails } from "@/types/astrology"
import { getCityCoordinates } from "@/lib/astrology/geocoding"
import { saveBirthDetails, getBirthDetails, clearBirthDetails } from "@/lib/astrology/storage"
import { calculateEnhancedVedicChart } from "@/lib/astrology/enhanced-calculator"

interface BirthDetailsFormProps {
  onSubmit: (birthDetails: BirthDetails, chartData: any) => void
  onCancel: () => void
}

export default function BirthDetailsForm({ onSubmit, onCancel }: BirthDetailsFormProps) {
  const [birthDetails, setBirthDetails] = useState<BirthDetails>({
    date: "",
    time: "",
    latitude: 0,
    longitude: 0,
    timezone: "+05:30", // Default Indian timezone
    city: "",
    country: "",
    name: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isCalculating, setIsCalculating] = useState(false)
  const [hasStoredData, setHasStoredData] = useState(false)

  // Load stored birth details on component mount
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== "undefined") {
      const storedDetails = getBirthDetails()
      if (storedDetails) {
        setBirthDetails(storedDetails)
        setHasStoredData(true)
      }
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setBirthDetails((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!birthDetails.date) newErrors.date = "Birth date is required"
    if (!birthDetails.time) newErrors.time = "Birth time is required"
    if (!birthDetails.city) newErrors.city = "City is required"
    if (!birthDetails.country) newErrors.country = "Country is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsCalculating(true)

    try {
      // Get coordinates for the city
      const coordinates = await getCityCoordinates(birthDetails.city, birthDetails.country)

      // Update birth details with coordinates
      const updatedBirthDetails: BirthDetails = {
        ...birthDetails,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        timezone: "+05:30", // Indian timezone
      }

      // Save to localStorage
      saveBirthDetails(updatedBirthDetails)
      setHasStoredData(true)

      // Calculate the chart
      const chartData = await calculateEnhancedVedicChart(updatedBirthDetails)
      onSubmit(updatedBirthDetails, chartData)
    } catch (error) {
      console.error("Error calculating chart:", error)
      setErrors({ general: "Failed to calculate astrological chart. Please try again." })
    } finally {
      setIsCalculating(false)
    }
  }

  const handleClearStoredData = () => {
    clearBirthDetails()
    setBirthDetails({
      date: "",
      time: "",
      latitude: 0,
      longitude: 0,
      timezone: "+05:30",
      city: "",
      country: "",
      name: "",
    })
    setHasStoredData(false)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Birth Details</CardTitle>
            <CardDescription>Please provide your birth details for an accurate astrological reading</CardDescription>
          </div>
          {hasStoredData && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearStoredData}
              title="Clear stored birth details"
              className="text-gray-500 hover:text-red-500"
            >
              <Trash2 size={18} />
            </Button>
          )}
        </div>
        {hasStoredData && (
          <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded-md">
            Your birth details have been loaded from your previous session
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              name="name"
              value={birthDetails.name}
              onChange={handleInputChange}
              placeholder="Enter your name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Birth Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={birthDetails.date}
              onChange={handleInputChange}
              className={errors.date ? "border-red-500" : ""}
            />
            {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Birth Time (24-hour format)</Label>
            <Input
              id="time"
              name="time"
              type="time"
              value={birthDetails.time}
              onChange={handleInputChange}
              className={errors.time ? "border-red-500" : ""}
            />
            {errors.time && <p className="text-red-500 text-sm">{errors.time}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City of Birth</Label>
              <Input
                id="city"
                name="city"
                value={birthDetails.city}
                onChange={handleInputChange}
                placeholder="e.g., New Delhi"
                className={errors.city ? "border-red-500" : ""}
              />
              {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country of Birth</Label>
              <Input
                id="country"
                name="country"
                value={birthDetails.country}
                onChange={handleInputChange}
                placeholder="e.g., India"
                className={errors.country ? "border-red-500" : ""}
              />
              {errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
            </div>
          </div>

          {errors.general && <div className="bg-red-50 p-3 rounded-md text-red-500 text-sm">{errors.general}</div>}
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isCalculating}>
          {isCalculating ? "Calculating..." : "Generate Chart"}
        </Button>
      </CardFooter>
    </Card>
  )
}
