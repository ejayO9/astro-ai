"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Clock, Star, Home } from "lucide-react"
import type { BirthDetails, AstrologyChart } from "@/types/astrology"
import PlanetaryPositionViewer from "./planetary-position-viewer"
import { IntentAnalysisViewer } from "./intent-analysis-viewer"
import { analyzeUserIntent } from "@/lib/astrology/intent-analyzer"
import type { IntentAnalysisResult } from "@/lib/astrology/intent-analyzer"
import { SIGN_CHARACTERISTICS } from "@/lib/astrology/planetary-analyzer"
import { getHouseLordPlacementSignificance } from "@/lib/astrology/planetary-analyzer"
import { analyzeYogas, generateYogaSummary } from "@/lib/astrology/yoga-analyzer"
import type { YogaResult } from "@/lib/astrology/yoga-analyzer"

// Helper function to get the lord of a sign
function getSignLord(sign: string): string {
  const signData = SIGN_CHARACTERISTICS[sign as keyof typeof SIGN_CHARACTERISTICS]
  return signData?.ruler || ""
}

// Planetary significances when placed in different houses
const PLANET_HOUSE_SIGNIFICANCE: Record<string, Record<number, string>> = {
  Sun: {
    1: "Strong willpower, leadership, authoritative personality. Weak Sun can cause low immunity or ego issues.",
    2: "Wealth through government/politics, strong speech, strained family ties.",
    3: "Courageous siblings, success in media/sports, short travels.",
    4: "Property disputes, strained mother relationship, frequent relocations.",
    5: "Intelligent children, leadership in creative fields, speculative gains.",
    6: "Victory over enemies, health-conscious, government job benefits.",
    7: "Dominant spouse, legal partnerships, possible divorce if afflicted.",
    8: "Longevity struggles, inheritance delays, interest in occult.",
    9: "Strong dharma, father's influence, foreign connections.",
    10: "Fame, political success, career recognition.",
    11: "Gains through authority figures, influential friends.",
    12: "Expenses on prestige, spiritual retreats, foreign stays."
  },
  Moon: {
    1: "Emotional, intuitive, fluctuating health (digestive issues).",
    2: "Wealth through liquids (milk, oil), sweet speech, family bonds.",
    3: "Creative siblings, writing talent, short journeys.",
    4: "Happy home, inheritance, strong motherly love.",
    5: "Fertility, artistic children, success in creative arts.",
    6: "Healing abilities, victory in disputes, dietary habits affect health.",
    7: "Attractive spouse, moody relationships, business partnerships.",
    8: "Emotional trauma, psychic sensitivity, inheritance delays.",
    9: "Pilgrimages, spiritual mother, foreign connections.",
    10: "Public recognition in arts/medicine, fluctuating career.",
    11: "Gains through women/mother figures, social popularity.",
    12: "Interest in dreams/psychology, solitude, hospital visits."
  },
  Mars: {
    1: "Aggressive, athletic, prone to injuries/accidents.",
    2: "Wealth through engineering/military, sharp speech, family disputes.",
    3: "Courageous, competitive siblings, success in sports.",
    4: "Property disputes, restless mind, frequent relocations.",
    5: "Passionate love affairs, sports-loving children.",
    6: "Strong immunity, success over enemies, surgical profession.",
    7: "Fiery spouse, legal battles in marriage, business conflicts.",
    8: "Accidental risks, interest in surgery/occult.",
    9: "Warrior spirit, interest in martial arts, foreign travel.",
    10: "Career in defense/engineering, authoritative position.",
    11: "Gains through courage/competition, influential friends.",
    12: "Hospitalization, secret enemies, interest in weapons."
  },
  Mercury: {
    1: "Intelligent, witty, nervous energy, youthful appearance.",
    2: "Wealth through writing/trading, multilingual skills.",
    3: "Journalistic talent, communicative siblings, short trips.",
    4: "Education-focused family, multiple properties, vehicle interest.",
    5: "Brilliant children, success in astrology/mathematics.",
    6: "Success in debates, health writing (medical reports).",
    7: "Business partnerships, youthful spouse, legal agreements.",
    8: "Interest in mysteries, research skills, sudden gains/losses.",
    9: "Philosophical mind, higher education, foreign languages.",
    10: "Career in media/IT, fame through communication.",
    11: "Gains through networking, tech-related income.",
    12: "Interest in subconscious mind, writing in isolation."
  },
  Jupiter: {
    1: "Optimistic, wise, respected, spiritual growth.",
    2: "Wealth through teaching/priesthood, family values.",
    3: "Scholarly siblings, success in publishing, short pilgrimages.",
    4: "Happy home, ancestral property, mother's wisdom.",
    5: "Blessed with children, spiritual wisdom, teaching success.",
    6: "Victory in legal matters, healing profession.",
    7: "Wise spouse, harmonious marriage, consultancy income.",
    8: "Interest in metaphysics, inheritance after delays.",
    9: "Strong dharma, guru blessings, foreign travel.",
    10: "Career in law/religion, social respect.",
    11: "Gains through mentors, charitable income.",
    12: "Philanthropy, spiritual liberation, foreign stays."
  },
  Venus: {
    1: "Charming, artistic, beauty-conscious, luxury-loving.",
    2: "Wealth through arts/music, melodious voice.",
    3: "Creative siblings, success in performing arts.",
    4: "Luxurious home, artistic mother, vehicle collection.",
    5: "Romantic relationships, artistic children.",
    6: "Beauty-related health issues, success in fashion.",
    7: "Harmonious marriage, attractive spouse, business partnerships.",
    8: "Secret affairs, inheritance through spouse.",
    9: "Artistic guru, foreign spouse, luxury travel.",
    10: "Career in arts/entertainment, fame through beauty.",
    11: "Gains through arts, influential social circle.",
    12: "Secret relationships, indulgence in bed pleasures."
  },
  Saturn: {
    1: "Disciplined, reserved, delays in early life.",
    2: "Slow wealth accumulation, frugal speech.",
    3: "Hardworking siblings, delayed communication skills.",
    4: "Emotional detachment from family, property struggles.",
    5: "Few/delayed children, interest in serious studies.",
    6: "Success over enemies, health discipline.",
    7: "Delayed marriage, older/spouse with responsibilities.",
    8: "Longevity struggles, interest in occult.",
    9: "Late spiritual growth, foreign struggles.",
    10: "Late-career success, authority through hard work.",
    11: "Gains after struggles, influential elder friends.",
    12: "Isolation, meditation, karmic liberation."
  },
  Rahu: {
    1: "Unconventional identity, fame/notoriety.",
    2: "Wealth through unconventional means, speech controversies.",
    3: "Innovative siblings, success in technology.",
    4: "Unstable home, foreign property.",
    5: "Unconventional children, speculative gains.",
    6: "Victory through strategy, hidden enemies.",
    7: "Unusual partnerships, foreign spouse.",
    8: "Occult interests, sudden gains/losses.",
    9: "Unconventional guru, foreign connections.",
    10: "Fame through controversy, tech career.",
    11: "Sudden gains, influential but manipulative friends.",
    12: "Secretive, interest in alien/UFO topics."
  },
  Ketu: {
    1: "Detached, spiritual, health mysteries.",
    2: "Non-materialistic, speech hurdles.",
    3: "Few siblings, introverted communication.",
    4: "Emotional detachment from family.",
    5: "Few children, past-life spiritual wisdom.",
    6: "Hidden enemies, healing abilities.",
    7: "Karmic marriage, solitude in relationships.",
    8: "Psychic abilities, past-life trauma.",
    9: "Sudden spiritual awakening.",
    10: "Unconventional career, fame in metaphysics.",
    11: "Sudden losses/gains, detached from desires.",
    12: "Enlightenment, monastic tendencies."
  },
}

/**
 * Gets the significance of a planet placed in a specific house
 */
function getPlanetHouseSignificance(planetName: string, houseNumber: number): string {
  const planetSignificances = PLANET_HOUSE_SIGNIFICANCE[planetName]
  if (!planetSignificances) {
    return `No significance data available for ${planetName}.`
  }
  
  const significance = planetSignificances[houseNumber]
  if (!significance) {
    return `No significance data available for ${planetName} in House ${houseNumber}.`
  }
  
  return significance
}

interface AstrologySummaryProps {
  birthDetails: BirthDetails
  chartData: AstrologyChart
  userQuery?: string
}

export function AstrologySummary({ birthDetails, chartData, userQuery }: AstrologySummaryProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [intentAnalysis, setIntentAnalysis] = useState<IntentAnalysisResult | null>(null)
  const [showChartJson, setShowChartJson] = useState(false)
  const [showRawApiJson, setShowRawApiJson] = useState(false)
  const [yogaAnalysis, setYogaAnalysis] = useState<YogaResult[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const [currentDate, setCurrentDate] = useState<Date | null>(null)

  // Debug: Show raw planets API response if available
  let rawApiJson = null;
  if (chartData && (chartData as any)._rawPlanetsApiResponse) {
    rawApiJson = (chartData as any)._rawPlanetsApiResponse;
  }

  useEffect(() => {
    if (userQuery) {
      analyzeUserIntent(userQuery).then(setIntentAnalysis)
    } else {
      setIntentAnalysis(null)
    }
  }, [userQuery])

  useEffect(() => {
    // Analyze yogas when chart data changes
    if (chartData) {
      const yogas = analyzeYogas(chartData)
      setYogaAnalysis(yogas)
    }
  }, [chartData])

  useEffect(() => {
    setCurrentDate(new Date())
    setIsHydrated(true)
  }, [])

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

  const DasasTab = () => {
    if (!isHydrated || !currentDate) {
      // Return static content during SSR and initial hydration
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Period</CardTitle>
              <p className="text-sm text-gray-600">Loading current dasha information...</p>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8 text-gray-500">
                <p>Loading dasha analysis...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Current Period Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Period</CardTitle>
            <p className="text-sm text-gray-600">Your active dasha periods as of {currentDate.toLocaleDateString()}</p>
          </CardHeader>
          <CardContent>
            {chartData?.hierarchicalDashas && chartData.hierarchicalDashas.length > 0 ? (
              <div className="space-y-4">
                {(() => {
                  // Find active Mahadasha
                  const activeMahadasha = chartData.hierarchicalDashas.find(dasha => 
                    currentDate >= dasha.from && currentDate <= dasha.to
                  )
                  
                  if (!activeMahadasha) {
                    return (
                      <div className="text-center p-8 text-gray-500">
                        <p>No active dasha found for current date</p>
                      </div>
                    )
                  }

                  // Find active Antardasha
                  const activeAntardasha = activeMahadasha.children?.find(antardasha =>
                    currentDate >= antardasha.from && currentDate <= antardasha.to
                  )

                  // Find active Pratyantardasha
                  const activePratyantardasha = activeAntardasha?.children?.find(pratyantardasha =>
                    currentDate >= pratyantardasha.from && currentDate <= pratyantardasha.to
                  )

                  return (
                    <div className="space-y-4">
                      {/* Mahadasha */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-blue-800">{activeMahadasha.planet} Mahadasha</h3>
                            <p className="text-sm text-blue-600">Primary Period</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-blue-600">
                              {activeMahadasha.from.toLocaleDateString()} → {activeMahadasha.to.toLocaleDateString()}
                            </div>
                            <div className="text-sm font-medium text-blue-700">{activeMahadasha.duration}</div>
                          </div>
                        </div>
                        
                        {activeMahadasha.balanceAtBirth && (
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <div className="text-sm text-yellow-800">
                              <strong>Balance at Birth:</strong> {activeMahadasha.balanceAtBirth}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Antardasha */}
                      {activeAntardasha && (
                        <div className="ml-8 bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-lg border-2 border-green-200">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="text-lg font-bold text-green-800">{activeAntardasha.planet} Antardasha</h4>
                              <p className="text-sm text-green-600">Secondary Period</p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-green-600">
                                {activeAntardasha.from.toLocaleDateString()} → {activeAntardasha.to.toLocaleDateString()}
                              </div>
                              <div className="text-sm font-medium text-green-700">{activeAntardasha.duration}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Pratyantardasha */}
                      {activePratyantardasha && (
                        <div className="ml-16 bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border-2 border-orange-200">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h5 className="text-md font-bold text-orange-800">{activePratyantardasha.planet} Pratyantardasha</h5>
                              <p className="text-sm text-orange-600">Tertiary Period</p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-orange-600">
                                {activePratyantardasha.from.toLocaleDateString()} → {activePratyantardasha.to.toLocaleDateString()}
                              </div>
                              <div className="text-sm font-medium text-orange-700">{activePratyantardasha.duration}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Hierarchical Display */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm font-semibold text-gray-700 mb-2">Current Hierarchy:</div>
                        <div className="text-lg font-mono text-gray-800">
                          {activeMahadasha.planet}
                          {activeAntardasha && ` > ${activeAntardasha.planet}`}
                          {activePratyantardasha && ` > ${activePratyantardasha.planet}`}
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            ) : chartData?.dashas && chartData.dashas.length > 0 ? (
              // Fallback to simple dasha display
              <div className="space-y-4">
                {(() => {
                  const activeDasa = chartData.dashas.find(dasa => 
                    currentDate >= dasa.from && currentDate <= dasa.to
                  )
                  
                  if (activeDasa) {
                    const totalDuration = activeDasa.to.getTime() - activeDasa.from.getTime()
                    const elapsed = currentDate.getTime() - activeDasa.from.getTime()
                    const percentComplete = Math.round((elapsed / totalDuration) * 100)
                    const remaining = activeDasa.to.getTime() - currentDate.getTime()
                    const remainingYears = remaining / (365.25 * 24 * 60 * 60 * 1000)
                    
                    return (
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-blue-800">{activeDasa.planet} Dasa</h3>
                            <p className="text-sm text-blue-600">Currently Active Period</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-700">{percentComplete}%</div>
                            <div className="text-sm text-purple-600">Complete</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="font-semibold text-gray-700">Started</div>
                            <div className="text-gray-600">{activeDasa.from.toLocaleDateString()}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-700">Ends</div>
                            <div className="text-gray-600">{activeDasa.to.toLocaleDateString()}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-700">Remaining</div>
                            <div className="text-gray-600">{remainingYears.toFixed(1)} years</div>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${percentComplete}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        {activeDasa.balanceAtBirth && (
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <div className="text-sm text-yellow-800">
                              <strong>Balance at Birth:</strong> {activeDasa.balanceAtBirth}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  } else {
                    return (
                      <div className="text-center p-8 text-gray-500">
                        <p>No active dasa found for current date</p>
                      </div>
                    )
                  }
                })()}
              </div>
            ) : (
              <div className="text-center p-8 text-gray-500">
                <p>Dasa calculation not available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Complete Dasa Sequence */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Complete Dasa Sequence (120 Years)</CardTitle>
            <p className="text-sm text-gray-600">Vimshottari Dasa system based on Moon's Nakshatra position</p>
          </CardHeader>
          <CardContent>
            {chartData?.dashas && chartData.dashas.length > 0 ? (
              <div className="space-y-3">
                {chartData.dashas.map((dasa, index) => {
                  const isActive = currentDate >= dasa.from && currentDate <= dasa.to
                  const isPast = currentDate > dasa.to
                  const isFuture = currentDate < dasa.from
                  
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${
                        isActive 
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300' 
                          : isPast 
                            ? 'bg-gray-50 border-gray-200' 
                            : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={`text-lg font-bold ${
                              isActive ? 'text-green-800' : isPast ? 'text-gray-600' : 'text-blue-800'
                            }`}>
                              {dasa.planet} Dasa
                            </h4>
                            {isActive && <Badge variant="default" className="bg-green-600">Active</Badge>}
                            {isPast && <Badge variant="secondary">Completed</Badge>}
                            {isFuture && <Badge variant="outline" className="border-blue-400 text-blue-600">Future</Badge>}
                          </div>
                          <p className={`text-sm ${
                            isActive ? 'text-green-600' : isPast ? 'text-gray-500' : 'text-blue-600'
                          }`}>
                            {dasa.from.toLocaleDateString()} → {dasa.to.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${
                            isActive ? 'text-green-700' : isPast ? 'text-gray-600' : 'text-blue-700'
                          }`}>
                            {dasa.duration}
                          </div>
                          {dasa.balanceAtBirth && (
                            <div className="text-xs text-gray-500">
                              Balance: {dasa.balanceAtBirth}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {isActive && (
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                              style={{ 
                                width: `${Math.round(((currentDate.getTime() - dasa.from.getTime()) / (dasa.to.getTime() - dasa.from.getTime())) * 100)}%` 
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            {Math.round(((currentDate.getTime() - dasa.from.getTime()) / (dasa.to.getTime() - dasa.from.getTime())) * 100)}% complete
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center p-8 text-gray-500">
                <p>No dasa information available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
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
        {/* Collapsible debug section for raw planets API response, just below the Rasi Chart header */}
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={() => setShowRawApiJson((v) => !v)}
            style={{
              background: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: 4,
              padding: '6px 12px',
              fontSize: 13,
              cursor: 'pointer',
              marginBottom: 4,
            }}
          >
            {showRawApiJson ? 'Hide' : 'Show'} Raw Planets API Response
          </button>
          {showRawApiJson && (
            <pre style={{
              maxWidth: '100%',
              width: '100%',
              boxSizing: 'border-box',
              maxHeight: '60vh',
              overflow: 'auto',
              fontSize: 12,
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: 4,
              padding: 12,
              margin: 0,
            }}>
              {rawApiJson ? JSON.stringify(rawApiJson, null, 2) : 'No raw API response found in chartData.'}
            </pre>
          )}
        </div>

        {/* API Status Box (green) is rendered above this in your UI */}

        {/* Collapsible debug section for full chartData */}
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={() => setShowChartJson((v) => !v)}
            style={{
              background: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: 4,
              padding: '6px 12px',
              fontSize: 13,
              cursor: 'pointer',
              marginBottom: 4,
            }}
          >
            {showChartJson ? 'Hide' : 'Show'} Full Chart JSON
          </button>
          {showChartJson && (
            <pre style={{ maxHeight: 400, overflow: 'auto', fontSize: 12, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 4, padding: 12 }}>
              {JSON.stringify(chartData, null, 2)}
            </pre>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="houses">Houses</TabsTrigger>
            <TabsTrigger value="yogas">Yogas</TabsTrigger>
            <TabsTrigger value="dasas">Dasas</TabsTrigger>
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

          <TabsContent value="houses">
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
                      <div className="space-y-3">
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
                        
                        {/* Planetary Significances */}
                        {house.planets.length > 0 && (
                          <div className="space-y-2">
                            <strong className="text-sm font-semibold">Planetary Significances:</strong>
                            {house.planets.map((planet) => {
                              const significance = getPlanetHouseSignificance(planet.name, houseNum)
                              return (
                                <div key={planet.name} className="bg-gray-50 p-3 rounded-md border-l-4 border-blue-500">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="secondary" className="text-xs">
                                      {planet.name}{planet.isRetrograde && " (R)"}
                                    </Badge>
                                    <span className="text-xs text-gray-500">in House {houseNum}</span>
                                  </div>
                                  <p className="text-sm text-gray-700">{significance}</p>
                                </div>
                              )
                            })}
                          </div>
                        )}
                        
                        {/* House Lordship Analysis */}
                        <div className="space-y-2">
                          <strong className="text-sm font-semibold">House Lordship:</strong>
                          {(() => {
                            const houseLord = getSignLord(house.sign)
                            // Find where this house lord is placed
                            const lordPlanet = chartData.planets.find(p => p.name === houseLord)
                            const lordPlacedInHouse = lordPlanet?.house
                            
                            if (houseLord && lordPlacedInHouse) {
                              const lordshipSignificance = getHouseLordPlacementSignificance(houseNum, lordPlacedInHouse)
                              
                              return (
                                <div className="bg-amber-50 p-3 rounded-md border-l-4 border-amber-500">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="default" className="text-xs bg-amber-600">
                                      {houseLord} - Lord of House {houseNum}
                                    </Badge>
                                    <span className="text-xs text-amber-700">placed in House {lordPlacedInHouse}</span>
                                  </div>
                                  {lordshipSignificance && (
                                    <>
                                      <p className="text-sm text-amber-800 mb-1">{lordshipSignificance.effect}</p>
                                      <p className="text-xs text-amber-600 italic">Reference: {lordshipSignificance.reference}</p>
                                    </>
                                  )}
                                </div>
                              )
                            }
                            return (
                              <p className="text-xs text-gray-500">House lord analysis not available</p>
                            )
                          })()}
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

          <TabsContent value="yogas">
            <div className="space-y-6">
              {/* Yoga Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Yoga Analysis Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{yogaAnalysis.length}</div>
                        <div className="text-sm text-blue-800">Total Yogas Found</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {yogaAnalysis.filter(y => y.strength === "Strong").length}
                        </div>
                        <div className="text-sm text-green-800">Strong Yogas</div>
                      </div>
                      <div className="text-center p-4 bg-amber-50 rounded-lg">
                        <div className="text-2xl font-bold text-amber-600">
                          {[...new Set(yogaAnalysis.map(y => y.category))].length}
                        </div>
                        <div className="text-sm text-amber-800">Categories</div>
                      </div>
                    </div>
                    
                    {yogaAnalysis.length > 0 && (
                      <div className="text-sm text-gray-600">
                        <strong>Categories found:</strong> {[...new Set(yogaAnalysis.map(y => y.category))].join(", ")}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Individual Yogas */}
              {yogaAnalysis.length > 0 ? (
                <div className="grid gap-4">
                  {yogaAnalysis.map((yoga, index) => (
                    <Card key={index} className="border-l-4 border-l-purple-500">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-purple-600" />
                            {yoga.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={yoga.strength === "Strong" ? "default" : 
                                     yoga.strength === "Moderate" ? "secondary" : "outline"}
                            >
                              {yoga.strength}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {yoga.category}
                            </Badge>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <strong className="text-sm font-semibold">Definition:</strong>
                            <p className="text-sm text-gray-700 mt-1">{yoga.definition}</p>
                          </div>
                          
                          <div>
                            <strong className="text-sm font-semibold">Results:</strong>
                            <p className="text-sm text-gray-700 mt-1">{yoga.results}</p>
                          </div>
                          
                          {yoga.notes && (
                            <div>
                              <strong className="text-sm font-semibold">Notes:</strong>
                              <p className="text-sm text-gray-600 italic mt-1">{yoga.notes}</p>
                            </div>
                          )}
                          
                          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                            <div>
                              <strong>Planets:</strong> {yoga.planets.join(", ")}
                            </div>
                            <div>
                              <strong>Houses:</strong> {yoga.houses.join(", ")}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No Yogas Detected</h3>
                    <p className="text-sm text-gray-500">
                      No specific planetary yogas were found in this chart based on the current analysis criteria.
                      This doesn't mean the chart lacks significance - individual planetary positions and house lordships 
                      still provide valuable insights.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="dasas">
            <DasasTab />
          </TabsContent>

          {intentAnalysis && (
            <TabsContent value="intent">
              <IntentAnalysisViewer analysis={intentAnalysis} chartData={chartData} />
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default AstrologySummary
