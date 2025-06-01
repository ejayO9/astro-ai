"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import type { Message } from "ai"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"
import ResponseStepsDropdown from "./response-steps-dropdown"
import LogsDropdown from "./logs-dropdown"
import type { LogEntry } from "@/lib/logging-service"
import { analyzeUserIntent, type IntentAnalysisResult } from "@/lib/astrology/intent-analyzer"
import { IntentAnalysisViewer } from "./intent-analysis-viewer"
import type { AstrologyChart } from "@/types/astrology"
import HydrationSafe from "./hydration-safe"

interface ChatMessageProps {
  message: Message & {
    topic?: string
    systemPrompt?: string
    logs?: LogEntry[]
  }
  systemPrompt?: string
  characterAvatar?: string
  chartData?: AstrologyChart
}

export default function ChatMessage({ message, systemPrompt, characterAvatar, chartData }: ChatMessageProps) {
  const [showSystemPrompt, setShowSystemPrompt] = useState(false)
  const isUser = message.role === "user"
  const [showIntent, setShowIntent] = useState(false)
  const [intentAnalysis, setIntentAnalysis] = useState<IntentAnalysisResult | null>(null)

  // Debug: Log chartData for each message
  console.log(`[ChatMessage] chartData for message id ${message.id}:`, chartData);
  
  // Debug: Log systemPrompt to identify object issues
  console.log(`[ChatMessage] systemPrompt for message id ${message.id}:`, {
    type: typeof systemPrompt,
    value: systemPrompt,
    isObject: typeof systemPrompt === 'object',
    keys: typeof systemPrompt === 'object' && systemPrompt ? Object.keys(systemPrompt) : null
  });

  useEffect(() => {
    if (isUser && message.content) {
      analyzeUserIntent(message.content).then(setIntentAnalysis)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUser, message.content])

  return (
    <div className="space-y-2">
      {/* Topic label for assistant messages */}
      {!isUser && message.topic && (
        <div className="ml-11 mb-1">
          <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
            {message.topic}
          </span>
        </div>
      )}

      <div className={cn("flex items-start gap-3", isUser ? "justify-end" : "justify-start")}>
        {!isUser && (
          <div className="relative h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
            {characterAvatar ? (
              <Image src={characterAvatar || "/placeholder.svg"} alt="Character avatar" fill className="object-cover" />
            ) : (
              <div className="h-full w-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 text-sm">A</span>
              </div>
            )}
          </div>
        )}

        <div
          className={cn(
            "rounded-lg px-4 py-2 max-w-[80%]",
            isUser ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-800",
          )}
        >
          {message.content}
        </div>

        {isUser && (
          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
            <span className="text-gray-600 text-sm">U</span>
          </div>
        )}
      </div>

      {/* System prompt dropdown (only for assistant messages) - Wrapped for hydration safety */}
      {!isUser && systemPrompt && (
        <HydrationSafe
          fallback={
            <div className="ml-11 mr-4">
              <div className="flex items-center text-xs text-gray-500">
                <ChevronDown size={14} className="mr-1" /> Show system prompt
              </div>
            </div>
          }
        >
          <div className="ml-11 mr-4">
            <button
              onClick={() => setShowSystemPrompt(!showSystemPrompt)}
              className="flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showSystemPrompt ? (
                <>
                  <ChevronUp size={14} className="mr-1" /> Hide system prompt
                </>
              ) : (
                <>
                  <ChevronDown size={14} className="mr-1" /> Show system prompt
                </>
              )}
            </button>

            {showSystemPrompt && (
              <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-700 whitespace-pre-wrap">
                <div className="font-semibold mb-1">System Prompt:</div>
                {typeof systemPrompt === 'string' 
                  ? systemPrompt 
                  : typeof systemPrompt === 'object' 
                    ? JSON.stringify(systemPrompt, null, 2)
                    : String(systemPrompt || 'No system prompt available')
                }
              </div>
            )}
          </div>
        </HydrationSafe>
      )}

      {/* Response steps dropdown (only for assistant messages) */}
      {!isUser && <ResponseStepsDropdown />}

      {/* Logs dropdown (only for assistant messages) */}
      {!isUser && message.logs && message.logs.length > 0 && <LogsDropdown logs={message.logs} />}

      {/* Intent analysis dropdown (only for user messages) */}
      {isUser && (
        <HydrationSafe
          fallback={
            <div className="flex flex-col items-end">
              <div className="text-xs text-purple-600 mt-1 mb-2">
                Show extracted intent
              </div>
            </div>
          }
        >
          <div className="flex flex-col items-end">
            <button
              className="text-xs text-purple-600 hover:underline mt-1 mb-2"
              onClick={() => setShowIntent((v) => !v)}
            >
              {showIntent ? "Hide extracted intent" : "Show extracted intent"}
            </button>
            {showIntent && intentAnalysis && (
              <div className="w-full max-w-md mt-1">
                <IntentAnalysisViewer analysis={intentAnalysis} chartData={chartData} />
              </div>
            )}
          </div>
        </HydrationSafe>
      )}
    </div>
  )
}
