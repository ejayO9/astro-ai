"use client"

import type React from "react"

import { useState, useCallback, useEffect, useRef } from "react"
import type { Message } from "ai"
import type { TopicSegment } from "@/lib/topic-analyzer"
import type { Character } from "@/types/character"
import { getDefaultCharacter } from "@/data/characters"
import type { LogEntry } from "@/lib/logging-service"
import { logInfo, logDebug, logWarn, logError } from "@/lib/logging-service"

interface UseSentenceChatOptions {
  initialMessages?: Message[]
  onFinish?: (message: Message) => void
  onResponse?: (data: any) => void
  onUserMessageSent?: (message: Message) => void
  initialCharacter?: Character
  customSystemPrompt?: string | null
}

// Extended message type to include system prompt and topic
export interface MessageWithSystemPrompt extends Message {
  systemPrompt?: string
  topic?: string
  characterId?: string
  logs?: LogEntry[] // Add logs to the message
}

export function useSentenceChat(options: UseSentenceChatOptions = {}) {
  const [messages, setMessages] = useState<MessageWithSystemPrompt[]>(options.initialMessages || [])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0)
  const [topicSegments, setTopicSegments] = useState<TopicSegment[]>([])
  const [currentSystemPrompt, setCurrentSystemPrompt] = useState<string | undefined>(undefined)
  const [selectedCharacter, setSelectedCharacter] = useState<Character>(
    options.initialCharacter || getDefaultCharacter(),
  )
  const [currentLogs, setCurrentLogs] = useState<LogEntry[]>([])

  // Use a ref to track the previous system prompt to avoid unnecessary updates
  const prevSystemPromptRef = useRef<string | null | undefined>(options.customSystemPrompt)

  // Function to add a new message
  const addMessage = useCallback((message: MessageWithSystemPrompt) => {
    setMessages((prev) => [...prev, message])
  }, [])

  // Function to handle character selection
  const handleSelectCharacter = useCallback((character: Character) => {
    setSelectedCharacter(character)

    // Reset chat when changing characters
    setMessages([
      {
        id: "system-1",
        role: "system",
        content: character.systemPrompt,
        characterId: character.id,
      },
    ])

    setTopicSegments([])
    setCurrentTopicIndex(0)
    setIsTyping(false)
    setCurrentSystemPrompt(undefined)
    setCurrentLogs([])

    // Reset the previous system prompt ref
    prevSystemPromptRef.current = character.systemPrompt
  }, [])

  // Function to safely parse JSON response
  const safelyParseJson = useCallback(async (response: Response): Promise<any> => {
    try {
      // First check if the response is ok
      if (!response.ok) {
        // Try to get the response text first
        const text = await response.text()

        // Try to parse it as JSON
        try {
          return JSON.parse(text)
        } catch (jsonError) {
          // If it's not valid JSON, return an error object with the text
          logError("useSentenceChat", "Failed to parse error response as JSON", {
            status: response.status,
            statusText: response.statusText,
            responseText: text.substring(0, 200), // Log first 200 chars only
          })

          return {
            error: true,
            status: response.status,
            statusText: response.statusText,
            detail: `Server error: ${text.substring(0, 100)}...`, // Include part of the error text
            logs: [
              {
                level: "error",
                module: "API",
                message: "Server returned non-JSON error response",
                timestamp: new Date().toISOString(),
                data: { responseStatus: response.status },
              },
            ],
          }
        }
      }

      // If response is ok, parse as JSON normally
      return await response.json()
    } catch (error) {
      logError("useSentenceChat", "Error parsing response", { error })
      return {
        error: true,
        detail: "Failed to parse server response",
        logs: [
          {
            level: "error",
            module: "API",
            message: "Failed to parse server response",
            timestamp: new Date().toISOString(),
            data: { error: error instanceof Error ? error.message : String(error) },
          },
        ],
      }
    }
  }, [])

  // Function to handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (!input.trim()) return

      // Add user message
      const userMessage: MessageWithSystemPrompt = {
        id: Date.now().toString(),
        role: "user",
        content: input,
        characterId: selectedCharacter.id,
      }

      addMessage(userMessage)

      // Call onUserMessageSent callback if provided
      if (options.onUserMessageSent) {
        options.onUserMessageSent(userMessage)
      }

      setInput("")
      setIsLoading(true)
      // Clear current logs for new request
      setCurrentLogs([])

      try {
        // Prepare messages for API, potentially using custom system prompt
        const messagesToSend = [...messages, userMessage]

        // If we have a custom system prompt, replace the system message
        if (options.customSystemPrompt) {
          const systemMessageIndex = messagesToSend.findIndex((m) => m.role === "system")
          if (systemMessageIndex >= 0) {
            messagesToSend[systemMessageIndex] = {
              ...messagesToSend[systemMessageIndex],
              content: options.customSystemPrompt,
            }
          } else {
            // If no system message exists, add one
            messagesToSend.unshift({
              id: "system-custom",
              role: "system",
              content: options.customSystemPrompt,
              characterId: selectedCharacter.id,
            })
          }
        }

        logInfo("useSentenceChat", "Sending request to API", {
          messageCount: messagesToSend.length,
          characterId: selectedCharacter.id,
        })

        // Send request to API with better error handling
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: messagesToSend,
            characterId: selectedCharacter.id,
          }),
        })

        // Use the safe parsing function instead of direct response.json()
        const data = await safelyParseJson(response)

        // Check if the parsed data indicates an error
        if (data.error) {
          logError("useSentenceChat", "API returned error", {
            detail: data.detail,
            status: data.status,
          })

          // Set logs if they exist in the error response
          if (data.logs && Array.isArray(data.logs)) {
            setCurrentLogs(data.logs)
          }

          throw new Error(data.detail || "API error")
        }

        logInfo("useSentenceChat", "API response received", {
          hasTopicSegments: !!data.topicSegments,
          hasFullResponse: !!data.fullResponse,
          hasLogs: !!data.logs,
        })

        // Store logs from the response
        if (data.logs && Array.isArray(data.logs)) {
          setCurrentLogs(data.logs)
        }

        // Store the system prompt used for this response
        setCurrentSystemPrompt(data.systemPrompt || options.customSystemPrompt)

        // Call onResponse callback if provided
        if (options.onResponse) {
          options.onResponse(data)
        }

        if (data.topicSegments && Array.isArray(data.topicSegments)) {
          // Set topic segments for streaming
          setTopicSegments(data.topicSegments)
          setCurrentTopicIndex(0)

          // Start typing animation for first topic
          setIsTyping(true)
        } else {
          // Fallback if no topic segments
          addMessage({
            id: Date.now().toString(),
            role: "assistant",
            content: data.fullResponse || "I'm not sure how to respond to that.",
            systemPrompt: data.systemPrompt || options.customSystemPrompt,
            characterId: selectedCharacter.id,
            logs: data.logs,
          })
        }
      } catch (error) {
        logError("useSentenceChat", "Error sending message", {
          error: error instanceof Error ? error.message : String(error),
        })

        // Add error message
        addMessage({
          id: Date.now().toString(),
          role: "assistant",
          content:
            error instanceof Error
              ? `Sorry, I encountered an error: ${error.message}. Please try again.`
              : "Sorry, I encountered an error. Please try again.",
          characterId: selectedCharacter.id,
          logs: currentLogs,
        })
      } finally {
        setIsLoading(false)
      }
    },
    [input, messages, addMessage, options, selectedCharacter, currentLogs, safelyParseJson],
  )

  // Effect to handle topic-by-topic streaming with typing indicators
  useEffect(() => {
    if (topicSegments.length === 0 || currentTopicIndex >= topicSegments.length) return

    // Show typing indicator
    if (isTyping) {
      const typingTimeout = setTimeout(
        () => {
          const currentSegment = topicSegments[currentTopicIndex]

          // Add the current topic segment as a message
          addMessage({
            id: `assistant-${Date.now()}-${currentTopicIndex}`,
            role: "assistant",
            content: currentSegment.content,
            systemPrompt: currentSystemPrompt || options.customSystemPrompt,
            topic: currentSegment.topic,
            characterId: selectedCharacter.id,
            logs: currentLogs, // Add logs to the message
          })

          // Move to next topic
          setCurrentTopicIndex((prev) => prev + 1)

          // If there are more topics, show typing again after a pause
          if (currentTopicIndex < topicSegments.length - 1) {
            setTimeout(() => setIsTyping(true), 500)
          } else {
            // We're done with all topics
            if (options.onFinish) {
              options.onFinish({
                id: `assistant-${Date.now()}-complete`,
                role: "assistant",
                content: topicSegments.map((segment) => segment.content).join(" "),
                systemPrompt: currentSystemPrompt || options.customSystemPrompt,
              })
            }
          }

          setIsTyping(false)
        },
        1000 + Math.random() * 1000,
      ) // Random typing time between 1-2 seconds

      return () => clearTimeout(typingTimeout)
    }
  }, [
    topicSegments,
    currentTopicIndex,
    isTyping,
    addMessage,
    options,
    currentSystemPrompt,
    selectedCharacter,
    currentLogs,
  ])

  // Fixed effect to update messages when custom system prompt changes
  // This was causing the infinite loop because it had messages in the dependency array
  useEffect(() => {
    // Skip if the system prompt hasn't changed
    if (options.customSystemPrompt === prevSystemPromptRef.current) {
      return
    }

    // Update the ref with the current value
    prevSystemPromptRef.current = options.customSystemPrompt

    if (options.customSystemPrompt) {
      logInfo("useSentenceChat", "Custom system prompt provided", {
        promptLength: options.customSystemPrompt.length,
      })

      // Find the system message without depending on the messages state
      const systemMessageIndex = messages.findIndex((m) => m.role === "system")

      if (systemMessageIndex >= 0) {
        logDebug("useSentenceChat", "Updating existing system message")

        // Use functional update to avoid dependency on messages
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages]
          updatedMessages[systemMessageIndex] = {
            ...updatedMessages[systemMessageIndex],
            content: options.customSystemPrompt as string,
          }
          return updatedMessages
        })

        logInfo("useSentenceChat", "System message updated successfully")
      } else {
        logWarn("useSentenceChat", "No system message found, adding new one")

        // Use functional update to avoid dependency on messages
        setMessages((prevMessages) => [
          {
            id: "system-custom",
            role: "system",
            content: options.customSystemPrompt as string,
            characterId: selectedCharacter.id,
          },
          ...prevMessages,
        ])
      }
    }
  }, [options.customSystemPrompt, selectedCharacter.id]) // Removed messages from dependencies

  // Function to reset chat
  const resetChat = useCallback(async () => {
    // Call API to reset chat on the server
    await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resetChat: true,
        characterId: selectedCharacter.id,
      }),
    })

    // Reset chat on the client
    setMessages([
      {
        id: "system-1",
        role: "system",
        content: options.customSystemPrompt || selectedCharacter.systemPrompt,
        characterId: selectedCharacter.id,
      },
    ])

    setTopicSegments([])
    setCurrentTopicIndex(0)
    setIsTyping(false)
    setCurrentSystemPrompt(undefined)
    setCurrentLogs([])

    // Update the previous system prompt ref
    prevSystemPromptRef.current = options.customSystemPrompt || selectedCharacter.systemPrompt
  }, [selectedCharacter, options.customSystemPrompt])

  return {
    messages,
    input,
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value),
    handleSubmit,
    isLoading,
    isTyping,
    resetChat,
    setMessages,
    selectedCharacter,
    handleSelectCharacter,
    currentLogs,
  }
}
