"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { Send } from "lucide-react"
import ChatHeader from "@/components/chat-header"
import ChatMessage from "@/components/chat-message"
import CharacterSelectionScreen from "@/components/character-selection-screen"
import TypingIndicator from "@/components/typing-indicator"
import { useSentenceChat, type MessageWithSystemPrompt } from "@/hooks/use-sentence-chat"
import DebugPanel from "@/components/debug-panel"
import { characters } from "@/data/characters"
import AstrologyManager from "@/components/astrology-manager"
import type { LogEntry } from "@/lib/logging-service"
import { logInfo, logDebug, logWarn } from "@/lib/logging-service"

export default function ChatPage() {
  const [showWelcome, setShowWelcome] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [lastResponse, setLastResponse] = useState<string | null>(null)
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null)
  const [lastTopicSegments, setLastTopicSegments] = useState<any[]>([])
  const [customSystemPrompt, setCustomSystemPrompt] = useState<string | null>(null)
  const [responseLogs, setResponseLogs] = useState<LogEntry[]>([])

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    isTyping,
    resetChat,
    selectedCharacter,
    handleSelectCharacter,
    currentLogs,
  } = useSentenceChat({
    initialMessages: [
      {
        id: "system-1",
        role: "system",
        content: characters[0].systemPrompt,
        characterId: characters[0].id,
      },
    ],
    initialCharacter: characters[0],
    onResponse: (data) => {
      if (data.fullResponse) {
        setLastResponse(data.fullResponse)
      }
      if (data.topicSegments) {
        setLastTopicSegments(data.topicSegments)
      }
      if (data.logs) {
        setResponseLogs(data.logs)
      }
    },
    onUserMessageSent: (message) => {
      setLastUserMessage(message.content)
    },
    customSystemPrompt,
  })

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (showWelcome) setShowWelcome(false)
    handleSubmit(e)
  }

  const onSelectCharacter = (character: any) => {
    handleSelectCharacter(character)
    setShowWelcome(false)
    // Reset custom system prompt when changing characters
    setCustomSystemPrompt(null)
  }

  // Update the handleAstrologyPromptGenerated function to include logging
  const handleAstrologyPromptGenerated = (prompt: string) => {
    logInfo("ChatPage", "Received astrological prompt", {
      promptLength: prompt.length,
    })

    setCustomSystemPrompt(prompt)

    // Update the system message in the current messages
    const systemMessageIndex = messages.findIndex((m) => m.role === "system")
    if (systemMessageIndex >= 0) {
      const updatedMessages = [...messages]
      updatedMessages[systemMessageIndex] = {
        ...updatedMessages[systemMessageIndex],
        content: prompt,
      }
      // We would need to add a setMessages function to the hook and expose it
      // For now, we'll rely on the customSystemPrompt for new messages
      logDebug("ChatPage", "System message index found but can't update directly", {
        systemMessageIndex,
      })
    } else {
      logWarn("ChatPage", "No system message found in messages array")
    }

    logInfo("ChatPage", "Custom system prompt set successfully")
  }

  // Scroll to bottom when messages change or typing status changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isTyping])

  return (
    <div className="flex flex-col h-screen bg-white">
      <ChatHeader
        summaryCount={0}
        onResetChat={resetChat}
        selectedCharacter={selectedCharacter}
        characters={characters}
        onSelectCharacter={onSelectCharacter}
      />

      <div className="flex-1 overflow-y-auto p-4">
        {showWelcome && messages.length <= 1 ? (
          <CharacterSelectionScreen characters={characters} onSelectCharacter={onSelectCharacter} />
        ) : (
          <div className="space-y-6 pb-20">
            {/* Astrology Manager - only show for Guruji */}
            {selectedCharacter.id === "guruji" && (
              <AstrologyManager
                onPromptGenerated={handleAstrologyPromptGenerated}
                characterId={selectedCharacter.id}
                currentQuery={input || lastUserMessage || undefined}
              />
            )}

            {messages
              .filter((m) => m.role !== "system")
              .map((message) => {
                // Find the character for this message
                const messageCharacterId = (message as MessageWithSystemPrompt).characterId || selectedCharacter.id
                const messageCharacter = characters.find((c) => c.id === messageCharacterId) || selectedCharacter

                return (
                  <ChatMessage
                    key={message.id}
                    message={{
                      ...message,
                      logs:
                        (message as MessageWithSystemPrompt).logs || (message.role === "assistant" ? currentLogs : []),
                    }}
                    systemPrompt={(message as MessageWithSystemPrompt).systemPrompt}
                    characterAvatar={message.role === "assistant" ? messageCharacter.avatarUrl : undefined}
                  />
                )
              })}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t sticky bottom-0 bg-white">
        {/* Typing indicator positioned above the input box */}
        {isTyping && (
          <div className="px-4 py-2">
            <TypingIndicator characterName={selectedCharacter.name} />
          </div>
        )}

        <div className="p-4">
          <form onSubmit={onSubmit} className="flex items-center bg-gray-50 rounded-full border border-gray-200 px-4">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder={`Ask ${selectedCharacter.name} something...`}
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
          lastResponse,
          lastUserMessage,
          lastTopicSegments,
          selectedCharacter: selectedCharacter.name,
          hasCustomPrompt: !!customSystemPrompt,
          logCount: currentLogs.length,
        }}
      />
    </div>
  )
}
