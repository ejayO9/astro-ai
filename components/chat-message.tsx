"use client"
import { useState } from "react"
import Image from "next/image"
import type { Message } from "ai"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { LogEntry } from "@/lib/logging-service"
import type { IntentAnalysisResult } from "@/lib/astrology/llm-intent-extractor"

export interface MessageWithSystemPrompt extends Message {
  systemPrompt?: string
  topic?: string
  characterId?: string
  logs?: LogEntry[]
  intentAnalysis?: IntentAnalysisResult
}

interface ChatMessageProps {
  message: MessageWithSystemPrompt
  systemPrompt?: string
  characterAvatar?: string
}

export default function ChatMessage({ message, systemPrompt, characterAvatar }: ChatMessageProps) {
  const [showSystemPrompt, setShowSystemPrompt] = useState(false)
  const [showLogs, setShowLogs] = useState(false)
  const [showSteps, setShowSteps] = useState(false)
  const [showIntent, setShowIntent] = useState(false)
  const isUser = message.role === "user"

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

      <div className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
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
          className={`rounded-lg px-4 py-2 max-w-[80%] ${
            isUser ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-800"
          }`}
        >
          {message.content}
        </div>

        {isUser && (
          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
            <span className="text-gray-600 text-sm">U</span>
          </div>
        )}
      </div>

      {/* System prompt dropdown (only for assistant messages) */}
      {!isUser && systemPrompt && (
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
              {systemPrompt}
            </div>
          )}
        </div>
      )}

      {/* Logs dropdown (only for assistant messages) */}
      {!isUser && message.logs && message.logs.length > 0 && (
        <div className="ml-11 mr-4 mt-2">
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showLogs ? (
              <>
                <ChevronUp size={14} className="mr-1" /> Hide logs
              </>
            ) : (
              <>
                <ChevronDown size={14} className="mr-1" /> Show logs
              </>
            )}
          </button>
          {showLogs && (
            <div className="mt-2">
              {message.logs.map((log, i) => (
                <div key={i} className="mb-2 rounded-md border bg-muted p-2">
                  <div className="mb-1 flex items-center space-x-2 text-xs font-medium">
                    <Badge variant="secondary">{log.type}</Badge>
                    <p className="text-xs text-muted-foreground">{log.source}</p>
                  </div>
                  <div className="p-2 rounded-md bg-gray-50 dark:bg-zinc-800 overflow-auto text-xs">
                    <pre>{JSON.stringify(log.message, null, 2)}</pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Response steps dropdown (only for assistant messages) */}
      {!isUser && message.logs && message.logs.length > 0 && (
        <div className="ml-11 mr-4 mt-2">
          <button
            onClick={() => setShowSteps(!showSteps)}
            className="flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showSteps ? (
              <>
                <ChevronUp size={14} className="mr-1" /> Hide response steps
              </>
            ) : (
              <>
                <ChevronDown size={14} className="mr-1" /> Show response steps
              </>
            )}
          </button>
          {showSteps && (
            <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md text-xs">
              <div className="font-semibold mb-1">Response Steps:</div>
              <ol className="list-decimal pl-4 space-y-1">
                {message.logs
                  .filter((log) => log.type === "info")
                  .map((log, i) => (
                    <li key={i}>{typeof log.message === "string" ? log.message : JSON.stringify(log.message)}</li>
                  ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Intent Analysis Dropdown - only show for assistant messages with intent data */}
      {!isUser && message.intentAnalysis && (
        <div className="ml-11 mr-4 mt-2">
          <button
            onClick={() => setShowIntent(!showIntent)}
            className="flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showIntent ? (
              <>
                <ChevronUp size={14} className="mr-1" /> Hide intent analysis
              </>
            ) : (
              <>
                <ChevronDown size={14} className="mr-1" /> Show intent analysis
              </>
            )}
          </button>

          {showIntent && (
            <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-md text-xs">
              <div className="font-semibold mb-2 text-purple-800">🔮 Extracted Intent Analysis</div>

              {/* Primary Intent */}
              <div className="mb-3">
                <div className="font-medium text-purple-700 mb-1">Primary Intent:</div>
                <div className="text-gray-700 bg-white p-2 rounded border">
                  {message.intentAnalysis.intent.primaryIntent}
                </div>
              </div>

              {/* Life Areas */}
              <div className="mb-3">
                <div className="font-medium text-purple-700 mb-1">Life Areas:</div>
                <div className="flex flex-wrap gap-1">
                  {message.intentAnalysis.intent.lifeAreas.map((area, index) => (
                    <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* Astrological Houses */}
              <div className="mb-3">
                <div className="font-medium text-purple-700 mb-1">Relevant Houses:</div>
                <div className="flex flex-wrap gap-1">
                  {message.intentAnalysis.houseMapping.primaryHouses.map((house, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      House {house}
                    </span>
                  ))}
                </div>
              </div>

              {/* Emotional Tone & Remedies */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <div className="font-medium text-purple-700 mb-1">Emotional Tone:</div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                    {message.intentAnalysis.intent.emotionalTone}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-purple-700 mb-1">Asking for Remedies:</div>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      message.intentAnalysis.intent.isAskingForRemedies
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {message.intentAnalysis.intent.isAskingForRemedies ? "Yes" : "No"}
                  </span>
                </div>
              </div>

              {/* Analysis Approach */}
              <div className="mb-3">
                <div className="font-medium text-purple-700 mb-1">Analysis Approach:</div>
                <div className="text-gray-700 bg-white p-2 rounded border text-xs">
                  {message.intentAnalysis.houseMapping.analysisApproach}
                </div>
              </div>

              {/* Confidence Level */}
              <div className="mb-2">
                <div className="font-medium text-purple-700 mb-1">Confidence Level:</div>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${message.intentAnalysis.confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-purple-700">
                    {Math.round(message.intentAnalysis.confidence * 100)}%
                  </span>
                </div>
              </div>

              {/* Categories */}
              <div>
                <div className="font-medium text-purple-700 mb-1">Categories:</div>
                <div className="flex flex-wrap gap-1">
                  {message.intentAnalysis.categories.map((category, index) => (
                    <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
