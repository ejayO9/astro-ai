"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { isGreetingOrNonQuestion } from "@/lib/message-analyzer"

interface DebugPanelProps {
  data: any
}

export default function DebugPanel({ data }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showSystemPrompt, setShowSystemPrompt] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Only enable interactivity after hydration to prevent mismatches
  useEffect(() => {
    setIsHydrated(true)
  }, [])

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

  if (!isHydrated) {
    // Return static version during SSR and initial hydration
    return (
      <Button variant="outline" size="sm" className="fixed bottom-4 right-4 z-50">
        Debug
      </Button>
    )
  }

  if (!isOpen) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className={`fixed bottom-4 right-4 z-50 ${data.isAstrologicalPrompt ? 'bg-purple-100 border-purple-300' : ''}`}
        onClick={() => setIsOpen(true)}
      >
        Debug {data.isAstrologicalPrompt && '🔮'}
      </Button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border rounded-md shadow-lg p-4 max-w-md max-h-96 overflow-auto">
      <div className="flex justify-between mb-2">
        <h3 className="font-bold">Debug Info {data.isAstrologicalPrompt && '🔮'}</h3>
        <div className="flex gap-2">
          {data.hasCustomPrompt && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowSystemPrompt(!showSystemPrompt)}
              className="text-xs"
            >
              {showSystemPrompt ? 'Hide' : 'Show'} System Prompt
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </div>
      </div>
      
      {showSystemPrompt && data.hasCustomPrompt && (
        <div className="mb-4 p-2 bg-gray-50 rounded text-xs max-h-40 overflow-auto">
          <h4 className="font-semibold mb-1">Current System Prompt:</h4>
          <pre className="whitespace-pre-wrap text-xs">{data.customSystemPrompt || 'No custom prompt available'}</pre>
        </div>
      )}
      
      <pre className="text-xs">{JSON.stringify(enhancedData, null, 2)}</pre>
    </div>
  )
}
