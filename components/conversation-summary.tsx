"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ConversationSummaryProps {
  summary: string
  onContinue: () => void
}

export default function ConversationSummary({ summary, onContinue }: ConversationSummaryProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4">Conversation Summary</h2>
          <div className="bg-purple-50 p-4 rounded-md text-gray-800">{summary}</div>
        </CardContent>
        <CardFooter>
          <Button onClick={onContinue} className="w-full bg-purple-500 hover:bg-purple-600">
            Continue with New Reading
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
