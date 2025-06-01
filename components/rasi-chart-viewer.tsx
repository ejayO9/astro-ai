"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  ChevronDown,
  ChevronRight,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  TestTube,
} from "lucide-react"
import type { BirthDetails } from "@/types/astrology"
import type { PlanetData } from "@/lib/astrology/api-client"
import { logInfo, logError } from "@/lib/logging-service"

interface RasiChartViewerProps {
  birthDetails: BirthDetails
}

export function RasiChartViewer({ birthDetails }: RasiChartViewerProps) {
  const [chartData, setChartData] = useState<PlanetData[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [apiStatus, setApiStatus] = useState<"live" | "demo" | "error">("demo")
  const [dataSource, setDataSource] = useState<string>("")

  // Check API availability and fetch chart data on component mount
  useEffect(() => {
    fetchChartData()
  }, [birthDetails])

  const testApiCredentials = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/astrology/test-credentials")
      const result = await response.json()

      if (result.status === "success") {
        alert(`✅ API Test Successful!\n\nMessage: ${result.message}\n\nCredentials working properly!`)
      } else {
        alert(`❌ API Test Failed!\n\nMessage: ${result.message}`)
      }
    } catch (err) {
      alert(`❌ API Test Error!\n\nError: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchChartData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      logInfo("RasiChartViewer", "Fetching planetary positions", {
        birthDate: birthDetails.date,
        birthTime: birthDetails.time,
        location: `${birthDetails.city}, ${birthDetails.country}`,
      })

      // Use server API route to fetch chart data
      const response = await fetch("/api/astrology/planets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(birthDetails),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `API request failed: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()

      // Check if we got an array of planetary data
      if (!Array.isArray(result)) {
        throw new Error("Invalid response format - expected array of planetary data")
      }

      // Validate that we have planetary data
      if (result.length < 9) {
        throw new Error(`Insufficient planetary data - received ${result.length} objects, expected at least 9`)
      }

      // Set API status - since we're using the new endpoint, it's always live if successful
      setApiStatus("live")
      setDataSource("planets-api")

      // Set chart data from response
      setChartData(result)
      logInfo("RasiChartViewer", "Planetary data received", {
        planetCount: result.length,
        planets: result.map((p: PlanetData) => p.name).join(", "),
        dataSource: "planets-api",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch planetary data"
      logError("RasiChartViewer", "Error fetching planetary data", err)
      setError(errorMessage)
      setApiStatus("error")
      setChartData(null) // Clear any invalid data
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = () => {
    if (isLoading) return <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
    if (chartData && apiStatus === "live") return <CheckCircle className="h-5 w-5 text-green-600" />
    if (chartData && apiStatus === "demo") return <AlertTriangle className="h-5 w-5 text-yellow-600" />
    if (error) return <XCircle className="h-5 w-5 text-red-600" />
    return <Settings className="h-5 w-5 text-gray-600" />
  }

  const getStatusDescription = () => {
    if (isLoading) return "Fetching planetary data..."
    if (error) return `Error: ${error}`
    if (chartData && apiStatus === "live") return "Live planetary data from astrology API - Click to expand"
    if (chartData && apiStatus === "demo") return "Demo planetary data (API issue or not configured) - Click to expand"
    return "Click to fetch planetary data"
  }

  // Helper function to get ascendant data
  const getAscendantData = () => {
    if (!chartData) return null
    return chartData.find((planet) => planet.name === "Ascendant")
  }

  // Helper function to get planets (excluding ascendant)
  const getPlanetsData = () => {
    if (!chartData) return []
    return chartData.filter((planet) => planet.name !== "Ascendant")
  }

  // Helper function to format degree
  const formatDegree = (degree: number) => {
    return `${degree.toFixed(2)}°`
  }

  // Auto-open the collapsible when data is loaded
  useEffect(() => {
    if (chartData && !isOpen) {
      setIsOpen(true)
    }
  }, [chartData])

  const ascendantData = getAscendantData()
  const planetsData = getPlanetsData()

  return (
    <Card className="w-full mt-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">
                  Rasi Chart (D1) - {apiStatus === "live" ? "Live API Data" : "Demo Data"}
                </CardTitle>
                {getStatusIcon()}
              </div>
              {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </div>
            <CardDescription>{getStatusDescription()}</CardDescription>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* API Status Controls */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {apiStatus === "live" ? (
                  <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" /> Live API Data
                  </Badge>
                ) : apiStatus === "demo" ? (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                    <AlertTriangle className="h-3 w-3 mr-1" /> Demo Data
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-200">
                    <XCircle className="h-3 w-3 mr-1" /> Error
                  </Badge>
                )}
                {dataSource && (
                  <Badge variant="secondary" className="text-xs">
                    Source: {dataSource}
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={testApiCredentials} disabled={isLoading}>
                  <TestTube className="h-4 w-4 mr-2" />
                  Test API
                </Button>
                <Button variant="outline" size="sm" onClick={fetchChartData} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </div>

            {/* API Success Banner */}
            {apiStatus === "live" && chartData && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-medium text-green-800">Live Planetary Data Active</h3>
                </div>
                <div className="text-sm text-green-700">
                  <p>Successfully connected to the astrology API! You're getting real-time planetary calculations.</p>
                  <div className="bg-green-100 p-3 rounded border mt-2">
                    <p className="font-medium mb-1">API Details:</p>
                    <p className="text-xs">Endpoint: https://json.astrologyapi.com/v1/planets</p>
                    <p className="text-xs">User ID: {process.env.NEXT_PUBLIC_ASTROLOGY_API_USER_ID || "640843"}</p>
                    <p className="text-xs">Response: {chartData?.length || 0} planetary objects</p>
                    <p className="text-xs">Status: ✅ Live API connection established</p>
                  </div>
                </div>
              </div>
            )}

            {/* API Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <h3 className="font-medium text-red-800">API Connection Error</h3>
                </div>
                <p className="text-sm text-red-700 mb-3">{error}</p>
                <div className="bg-red-100 p-3 rounded border text-xs text-red-700">
                  <p className="font-medium mb-1">Troubleshooting Information:</p>
                  <p>Endpoint: https://json.astrologyapi.com/v1/planets</p>
                  <p>User ID: {process.env.NEXT_PUBLIC_ASTROLOGY_API_USER_ID || "Not configured"}</p>
                  <p>Method: POST with birth details</p>
                  <p className="mt-2">
                    <strong>Note:</strong> This endpoint provides detailed planetary positions including exact degrees,
                    nakshatras, houses, and retrograde status.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchChartData} className="mt-3" disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  Retry Connection
                </Button>
              </div>
            )}

            {/* Chart Data Display */}
            {chartData && (
              <>
                {/* Ascendant Information */}
                {ascendantData && (
                  <div>
                    <h3 className="text-md font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Ascendant (Lagna)
                    </h3>
                    <div className="bg-blue-50 p-4 rounded-md">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <span className="text-sm font-medium">Sign:</span>
                          <Badge variant="default" className="ml-2">
                            {ascendantData.sign}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Degree:</span>
                          <span className="ml-2 text-sm">{formatDegree(ascendantData.fullDegree)}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Nakshatra:</span>
                          <span className="ml-2 text-sm">{ascendantData.nakshatra}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Pada:</span>
                          <span className="ml-2 text-sm">{ascendantData.nakshatra_pad}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Planetary Positions */}
                {planetsData.length > 0 && (
                  <div>
                    <h3 className="text-md font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Planetary Positions ({planetsData.length} planets)
                    </h3>
                    <div className="grid gap-3">
                      {planetsData.map((planet, index) => (
                        <div key={planet.id || index} className="bg-slate-50 p-3 rounded-md">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{planet.name}</span>
                              {(planet.isRetro === "true" || planet.isRetro === true) && (
                                <Badge variant="destructive" className="text-xs">
                                  R
                                </Badge>
                              )}
                            </div>
                            <Badge variant="outline">House {planet.house}</Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Sign:</span>
                              <span className="ml-1 font-medium">{planet.sign}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Degree:</span>
                              <span className="ml-1">{formatDegree(planet.fullDegree)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Nakshatra:</span>
                              <span className="ml-1">{planet.nakshatra}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Pada:</span>
                              <span className="ml-1">{planet.nakshatra_pad}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs mt-2 pt-2 border-t">
                            <div>
                              <span className="text-muted-foreground">Speed:</span>
                              <span className="ml-1">{planet.speed.toFixed(4)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Sign Lord:</span>
                              <span className="ml-1">{planet.signLord}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Awastha:</span>
                              <span className="ml-1">{planet.planet_awastha}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* API Response Summary */}
                <div className="p-4 rounded-md bg-green-50">
                  <h3 className="text-md font-semibold mb-2 text-green-800">
                    Live Planetary Data from /v1/planets Endpoint
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-green-700">Total Objects:</span>
                      <span className="ml-2">✓ {chartData.length}</span>
                    </div>
                    <div>
                      <span className="font-medium text-green-700">Planets:</span>
                      <span className="ml-2">✓ {planetsData.length}</span>
                    </div>
                    <div>
                      <span className="font-medium text-green-700">Ascendant:</span>
                      <span className="ml-2">✓ {ascendantData?.sign || "Unknown"}</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-green-600">
                    <p>✅ Real-time data with exact degrees, nakshatras, and planetary speeds</p>
                    <p>✅ Retrograde status and planetary awastha included</p>
                    <p>✅ Direct house assignments from API calculations</p>
                  </div>
                </div>
              </>
            )}

            {/* Loading State */}
            {isLoading && !chartData && (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p>Connecting to astrology API...</p>
                <p className="text-sm text-gray-500 mt-2">Fetching planetary positions from /v1/planets endpoint</p>
              </div>
            )}

            {/* No Data State */}
            {!isLoading && !chartData && !error && (
              <div className="text-center py-8">
                <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-4" />
                <p>No planetary data available. Click "Refresh" to try again.</p>
                <p className="text-sm text-gray-500 mt-2">Using endpoint: https://json.astrologyapi.com/v1/planets</p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

export default RasiChartViewer
