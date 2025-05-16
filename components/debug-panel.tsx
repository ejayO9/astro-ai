"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { isGreetingOrNonQuestion } from "@/lib/message-analyzer"

interface DebugPanelProps {
  data: any
}

export default function DebugPanel({ data }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Add message analysis to debug data
  const enhancedData = {
    ...data,
    lastUserMessageAnalysis: data.lastUserMessage
      ? {
          isGreetingOrNonQuestion: isGreetingOrNonQuestion(data.lastUserMessage),
          message: data.lastUserMessage,
        }
      : null,
  }

  if (!isOpen) {
    return (
      <Button variant="outline" size="sm" className="fixed bottom-4 right-4 z-50" onClick={() => setIsOpen(true)}>
        Debug
      </Button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border rounded-md shadow-lg p-4 max-w-md max-h-96 overflow-auto">
      <div className="flex justify-between mb-2">
        <h3 className="font-bold">Debug Info</h3>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
          Close
        </Button>
      </div>
      <pre className="text-xs">{JSON.stringify(enhancedData, null, 2)}</pre>
    </div>
  )
}
