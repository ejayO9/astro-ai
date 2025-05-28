"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { AstrologyChart } from "@/types/astrology"
import {
  generatePlanetaryPositionReport,
  type PlanetaryPositionAnalysis,
  type HouseOccupancyAnalysis,
} from "@/lib/astrology/planetary-analyzer"
import { useState, useEffect } from "react"

interface PlanetaryPositionViewerProps {
  chartData: AstrologyChart
}

export default function PlanetaryPositionViewer({ chartData }: PlanetaryPositionViewerProps) {
  const [planetaryReport, setPlanetaryReport] = useState<{
    planetaryAnalyses: PlanetaryPositionAnalysis[]
    houseAnalyses: HouseOccupancyAnalysis[]
    summary: string
  } | null>(null)

  useEffect(() => {
    try {
      const report = generatePlanetaryPositionReport(chartData)
      setPlanetaryReport(report)
    } catch (error) {
      console.error("Error generating planetary report:", error)
    }
  }, [chartData])

  if (!planetaryReport) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getDignityColor = (dignity: string) => {
    switch (dignity) {
      case "Exalted":
        return "bg-green-100 text-green-800"
      case "Own Sign":
        return "bg-blue-100 text-blue-800"
      case "Mool Trikona":
        return "bg-purple-100 text-purple-800"
      case "Friend's Sign":
        return "bg-cyan-100 text-cyan-800"
      case "Debilitated":
        return "bg-red-100 text-red-800"
      case "Enemy's Sign":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "Very Strong":
        return "bg-green-100 text-green-800"
      case "Strong":
        return "bg-blue-100 text-blue-800"
      case "Average":
        return "bg-yellow-100 text-yellow-800"
      case "Weak":
        return "bg-orange-100 text-orange-800"
      case "Very Weak":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Tabs defaultValue="planets" className="w-full">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="planets">Planetary Positions</TabsTrigger>
        <TabsTrigger value="houses">House Analysis</TabsTrigger>
        <TabsTrigger value="summary">Summary</TabsTrigger>
      </TabsList>

      <TabsContent value="planets">
        <div className="space-y-4">
          {planetaryReport.planetaryAnalyses.map((analysis) => (
            <Card key={analysis.planet}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{analysis.planet}</CardTitle>
                    <CardDescription>
                      {analysis.sign} • House {analysis.house} • {analysis.nakshatra} Nakshatra
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge className={getDignityColor(analysis.dignity)}>{analysis.dignity}</Badge>
                    <Badge className={getStrengthColor(analysis.strength)}>{analysis.strength}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm mb-1">Position Details</h4>
                    <p className="text-sm text-gray-600">
                      {analysis.degree.toFixed(2)}° in {analysis.sign}, Pada {analysis.nakshatraPada}
                      {analysis.isRetrograde && " (Retrograde)"}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-1">Interpretation</h4>
                    <p className="text-sm text-gray-700">{analysis.interpretation}</p>
                  </div>

                  {analysis.effects.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-1">Key Effects</h4>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {analysis.effects.map((effect, index) => (
                          <li key={index}>{effect}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.remedies.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-1">Suggested Remedies</h4>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {analysis.remedies.map((remedy, index) => (
                          <li key={index}>{remedy}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="houses">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {planetaryReport.houseAnalyses.map((analysis) => (
            <Card key={analysis.house}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">House {analysis.house}</CardTitle>
                    <CardDescription>
                      {analysis.houseSignifications.name} • {analysis.sign}
                    </CardDescription>
                  </div>
                  <Badge className={getStrengthColor(analysis.houseStrength)}>{analysis.houseStrength}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm mb-1">Occupants</h4>
                    <p className="text-sm text-gray-600">
                      {analysis.isEmpty ? "Empty house" : analysis.planets.join(", ")}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-1">Significations</h4>
                    <p className="text-sm text-gray-600">
                      {analysis.houseSignifications.significations.slice(0, 4).join(", ")}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-1">Interpretation</h4>
                    <p className="text-sm text-gray-700">{analysis.interpretation}</p>
                  </div>

                  {analysis.effects.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-1">Effects</h4>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {analysis.effects.map((effect, index) => (
                          <li key={index}>{effect}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="summary">
        <Card>
          <CardHeader>
            <CardTitle>Planetary Position Analysis Summary</CardTitle>
            <CardDescription>Overview of planetary strengths and key insights from your chart</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">{planetaryReport.summary}</pre>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
