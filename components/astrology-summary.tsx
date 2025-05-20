"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { AstrologyChart } from "@/types/astrology"
import { findActiveDashaPeriodsAtDate } from "@/lib/astrology/dasha-calculator"

interface AstrologySummaryProps {
  chartData: AstrologyChart
}

export default function AstrologySummary({ chartData }: AstrologySummaryProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Find currently active dasha periods
  const activeDashaPeriods = chartData.hierarchicalDashas
    ? findActiveDashaPeriodsAtDate(chartData.hierarchicalDashas, new Date())
    : []

  return (
    <Tabs defaultValue="summary" className="w-full">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="planets">Planets</TabsTrigger>
        <TabsTrigger value="dashas">Dashas</TabsTrigger>
      </TabsList>

      <TabsContent value="summary">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Astrological Summary</CardTitle>
            <CardDescription>
              Birth details for {chartData.native.name || "the native"} on{" "}
              {new Date(chartData.native.birthDate).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Birth Information</h3>
              <div className="bg-slate-50 p-3 rounded-md">
                <p>
                  <span className="font-medium">Date & Time:</span>{" "}
                  {new Date(chartData.native.birthDate).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                  })}
                </p>
                <p>
                  <span className="font-medium">Location:</span> {chartData.native.location.city},{" "}
                  {chartData.native.location.country}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Ascendant</h3>
              <div className="bg-slate-50 p-3 rounded-md">
                <p>
                  <span className="font-semibold">{chartData.ascendant.sign}</span> at{" "}
                  {chartData.ascendant.longitude.toFixed(2)}° in{" "}
                  <span className="italic">{chartData.ascendant.nakshatra}</span> Nakshatra, Pada{" "}
                  {chartData.ascendant.nakshatraPada}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Current Dasha</h3>
              {activeDashaPeriods.length > 0 ? (
                <div className="bg-slate-50 p-3 rounded-md">
                  <div className="space-y-2">
                    {activeDashaPeriods.map((period, index) => (
                      <div key={index} className={index > 0 ? "ml-4" : ""}>
                        <p>
                          <span className="font-semibold">{period.planet}</span>{" "}
                          <Badge variant="outline" className="ml-1">
                            {period.level}
                          </Badge>
                        </p>
                        <p className="text-sm">
                          From {formatDate(period.from)} to {formatDate(period.to)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : chartData.dashas.length > 0 ? (
                <div className="bg-slate-50 p-3 rounded-md">
                  <p>
                    <span className="font-semibold">{chartData.dashas[0].planet}</span> Mahadasha
                  </p>
                  <p className="text-sm">
                    From {formatDate(new Date(chartData.dashas[0].from))} to{" "}
                    {formatDate(new Date(chartData.dashas[0].to))}
                  </p>
                  {chartData.dashas[0].balanceAtBirth && (
                    <p className="text-xs text-slate-500">Balance at birth: {chartData.dashas[0].balanceAtBirth}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Dasha information not available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="planets">
        <Card>
          <CardHeader>
            <CardTitle>Planetary Positions</CardTitle>
            <CardDescription>Positions of planets in your birth chart</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {chartData.planets.map((planet) => (
                <div key={planet.name} className="bg-slate-50 p-2 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{planet.name}</span>
                    <Badge variant={planet.isRetrograde ? "destructive" : "outline"}>
                      {planet.isRetrograde ? "R" : "D"}
                    </Badge>
                  </div>
                  <p className="text-sm">
                    {planet.sign} at {planet.longitude.toFixed(2)}°
                  </p>
                  <p className="text-xs text-slate-500">
                    {planet.nakshatra} Nakshatra, Pada {planet.nakshatraPada}, House {planet.house}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="dashas">
        <Card>
          <CardHeader>
            <CardTitle>Dasha Timeline</CardTitle>
            <CardDescription>Planetary periods and sub-periods</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.hierarchicalDashas && chartData.hierarchicalDashas.length > 0 ? (
              <div className="space-y-4">
                {chartData.hierarchicalDashas.map((mahadasha, index) => (
                  <div key={index} className="border rounded-md p-3">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">{mahadasha.planet} Mahadasha</h3>
                      <Badge>
                        {formatDate(mahadasha.from)} - {formatDate(mahadasha.to)}
                      </Badge>
                    </div>

                    {mahadasha.children && mahadasha.children.length > 0 && (
                      <div className="ml-4 mt-2 space-y-2">
                        {mahadasha.children.slice(0, 3).map((antardasha, idx) => (
                          <div key={idx} className="border-l-2 pl-3 py-1 border-slate-200">
                            <p className="text-sm">
                              <span className="font-medium">{antardasha.planet} Antardasha</span>
                              <span className="text-xs text-slate-500 ml-2">
                                {formatDate(antardasha.from)} - {formatDate(antardasha.to)}
                              </span>
                            </p>
                          </div>
                        ))}
                        {mahadasha.children.length > 3 && (
                          <p className="text-xs text-slate-500 ml-3">
                            + {mahadasha.children.length - 3} more sub-periods
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">Detailed dasha information not available</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
