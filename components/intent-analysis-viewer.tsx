"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Target, Home, TrendingUp, Lightbulb, AlertCircle } from "lucide-react"
import type { IntentAnalysisResult } from "@/lib/astrology/intent-analyzer"

interface IntentAnalysisViewerProps {
  analysis: IntentAnalysisResult
}

export function IntentAnalysisViewer({ analysis }: IntentAnalysisViewerProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.7) return "bg-green-500"
    if (confidence >= 0.4) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.7) return "High"
    if (confidence >= 0.4) return "Medium"
    return "Low"
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          LLM Intent Analysis
        </CardTitle>
        <CardDescription>AI-powered analysis of your question mapped to astrological houses</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="intent">Intent</TabsTrigger>
            <TabsTrigger value="houses">Houses</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="recommendations">Guidance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Confidence Level</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getConfidenceColor(analysis.confidence)}`} />
                    <span className="text-lg font-semibold">{Math.round(analysis.confidence * 100)}%</span>
                    <span className="text-sm text-muted-foreground">({getConfidenceText(analysis.confidence)})</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Primary Houses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {analysis.primaryHouses.map((house) => (
                      <Badge key={house} variant="default">
                        {house}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Remedies Needed</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={analysis.isAskingForRemedies ? "destructive" : "secondary"}>
                    {analysis.isAskingForRemedies ? "Yes" : "No"}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{analysis.summary}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="intent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Primary Intent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">{analysis.primaryIntent}</p>
              </CardContent>
            </Card>

            {analysis.secondaryIntents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Secondary Intents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.secondaryIntents.map((intent, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span className="text-sm">{intent}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {analysis.specificConcerns.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Specific Concerns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.specificConcerns.map((concern, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        <span className="text-sm">{concern}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="houses" className="space-y-4">
            <div className="grid gap-4">
              {analysis.houseAnalysis.map((house) => (
                <Card key={house.house}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      House {house.house}: {house.name}
                    </CardTitle>
                    <CardDescription>{house.reason}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Relevant Significations</h4>
                      <div className="flex flex-wrap gap-1">
                        {house.relevantSignifications.map((sig, index) => (
                          <Badge key={index} variant="outline">
                            {sig}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Body Parts</h4>
                      <div className="flex flex-wrap gap-1">
                        {house.bodyParts.map((part, index) => (
                          <Badge key={index} variant="secondary">
                            {part}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Life Areas</h4>
                      <div className="flex flex-wrap gap-1">
                        {house.lifeAreas.map((area, index) => (
                          <Badge key={index} variant="default">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="grid gap-3">
              {analysis.matchedCategories.map((category, index) => (
                <Card key={category}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      {category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={index === 0 ? "default" : "secondary"}>
                      {index === 0 ? "Primary Category" : "Related Category"}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Analysis Approach
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{analysis.recommendations.analysisApproach}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Focus Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.recommendations.focusAreas.map((area, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-sm">{area}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Key Questions to Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.recommendations.keyQuestions.map((question, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-xs bg-muted rounded-full w-5 h-5 flex items-center justify-center mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-sm">{question}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
