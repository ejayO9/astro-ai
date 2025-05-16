"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { Send } from "lucide-react"
import ChatHeader from "@/components/chat-header"
import ChatMessage from "@/components/chat-message"
import WelcomeMessage from "@/components/welcome-message"
import TypingIndicator from "@/components/typing-indicator"
import { useSentenceChat } from "@/hooks/use-sentence-chat"
import DebugPanel from "@/components/debug-panel"

export default function ChatPage() {
  const [showWelcome, setShowWelcome] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, isTyping, resetChat } = useSentenceChat({
    initialMessages: [
      {
        id: "system-1",
        role: "system",
        content:
          "You are Shenaya. Shenaya is a 28-year-old trendsetting tarot reader who is fashion-forward and pop-culture savvy. You bring tarot readings with a modern edge and discuss the future with style.",
      },
    ],
  })

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (showWelcome) setShowWelcome(false)
    handleSubmit(e)
  }

  // Scroll to bottom when messages change or typing status changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isTyping])

  return (
    <div className="flex flex-col h-screen bg-white">
      <ChatHeader summaryCount={0} onResetChat={resetChat} />

      <div className="flex-1 overflow-y-auto p-4">
        {showWelcome && messages.length <= 1 && <WelcomeMessage />}

        <div className="space-y-6 pb-20">
          {messages
            .filter((m) => m.role !== "system")
            .map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t sticky bottom-0 bg-white">
        {/* Typing indicator positioned above the input box */}
        {isTyping && (
          <div className="px-4 py-2">
            <TypingIndicator />
          </div>
        )}

        <div className="p-4">
          <form onSubmit={onSubmit} className="flex items-center bg-gray-50 rounded-full border border-gray-200 px-4">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Type a message..."
              className="flex-1 py-3 px-2 bg-transparent focus:outline-none text-gray-700"
              disabled={isLoading || isTyping}
            />
            <button
              type="submit"
              className="ml-2 p-3 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition-colors"
              disabled={isLoading || !input.trim() || isTyping}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>

      <DebugPanel
        data={{
          messageCount: messages.length,
          isLoading,
          isTyping,
          hasSystemMessage: messages.some((m) => m.role === "system"),
        }}
      />
    </div>
  )
}
