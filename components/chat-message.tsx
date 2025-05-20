"use client"

import { useState } from "react"
import Image from "next/image"
import type { Message } from "ai"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"
import ResponseStepsDropdown from "./response-steps-dropdown"
import LogsDropdown from "./logs-dropdown"
import type { LogEntry } from "@/lib/logging-service"

interface ChatMessageProps {
  message: Message & {
    topic?: string
    systemPrompt?: string
    logs?: LogEntry[]
  }
  systemPrompt?: string
  characterAvatar?: string
}

export default function ChatMessage({ message, systemPrompt, characterAvatar }: ChatMessageProps) {
  const [showSystemPrompt, setShowSystemPrompt] = useState(false)
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

      {/* Response steps dropdown (only for assistant messages) */}
      {!isUser && <ResponseStepsDropdown />}

      {/* Logs dropdown (only for assistant messages) */}
      {!isUser && message.logs && message.logs.length > 0 && <LogsDropdown logs={message.logs} />}
    </div>
  )
}
