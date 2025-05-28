"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Clock, Star, Home } from "lucide-react"
import type { BirthDetails, AstrologyChart } from "@/types/astrology"
import PlanetaryPositionViewer from "./planetary-position-viewer"
import { IntentAnalysisViewer } from "./intent-analysis-viewer"
import { analyzeUserIntent } from "@/lib/astrology/intent-analyzer"

interface AstrologySummaryProps {
  birthDetails: BirthDetails
  chartData: AstrologyChart
  userQuery?: string
}

export function AstrologySummary({ birthDetails, chartData, userQuery }: AstrologySummaryProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Generate intent analysis if user query is provided
  const intentAnalysis = userQuery ? analyzeUserIntent(userQuery) : null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Astrological Analysis
        </CardTitle>
        <CardDescription>Comprehensive birth chart analysis for {birthDetails.name || "the native"}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="houses">Houses</TabsTrigger>
            {intentAnalysis && <TabsTrigger value="intent">Intent</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Birth Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Birth Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Date:</strong> {formatDate(birthDetails.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Time:</strong> {formatTime(birthDetails.time)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Place:</strong> {birthDetails.city}, {birthDetails.country}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      <strong>Coordinates:</strong> {birthDetails.latitude.toFixed(2)}°N,{" "}
                      {birthDetails.longitude.toFixed(2)}°E
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ascendant Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ascendant (Lagna)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">{chartData.ascendant.sign}</Badge>
                    <span className="text-sm text-muted-foreground">
                      at {chartData.ascendant.longitude.toFixed(2)}°
                    </span>
                  </div>
                  <div className="text-sm">
                    <strong>Nakshatra:</strong> {chartData.ascendant.nakshatra}, Pada{" "}
                    {chartData.ascendant.nakshatraPada}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Dasha */}
            {chartData.dashas && chartData.dashas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Dasha</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{chartData.dashas[0].planet} Mahadasha</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(chartData.dashas[0].from).toLocaleDateString()} to{" "}
                      {new Date(chartData.dashas[0].to).toLocaleDateString()}
                    </div>
                    {chartData.dashas[0].duration && (
                      <div className="text-sm">
                        <strong>Duration:</strong> {chartData.dashas[0].duration}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Planet Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Planetary Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {chartData.planets.map((planet) => (
                    <div key={planet.name} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm font-medium">{planet.name}</span>
                      <div className="text-right">
                        <div className="text-xs">{planet.sign}</div>
                        <div className="text-xs text-muted-foreground">H{planet.house}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="positions">
            <PlanetaryPositionViewer chartData={chartData} />
          </TabsContent>

          <TabsContent value="houses" className="space-y-4">
            <div className="grid gap-4">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((houseNum) => {
                const house = chartData.rashiChart[houseNum]
                if (!house) return null

                return (
                  <Card key={houseNum}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        House {houseNum} - {house.sign}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <strong>Planets:</strong>{" "}
                          {house.planets.length > 0 ? (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {house.planets.map((planet) => (
                                <Badge key={planet.name} variant="outline">
                                  {planet.name}
                                  {planet.isRetrograde && " (R)"}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Empty</span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <strong>Sign:</strong> {house.sign} (starts at {house.startLongitude.toFixed(2)}°)
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {intentAnalysis && (
            <TabsContent value="intent">
              <IntentAnalysisViewer analysis={intentAnalysis} />
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default AstrologySummary
