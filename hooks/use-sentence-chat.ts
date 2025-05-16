"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import type { Message } from "ai"
import type { TopicSegment } from "@/lib/topic-analyzer"

interface UseSentenceChatOptions {
  initialMessages?: Message[]
  onFinish?: (message: Message) => void
  onResponse?: (data: any) => void
  onUserMessageSent?: (message: Message) => void
}

// Extended message type to include system prompt and topic
export interface MessageWithSystemPrompt extends Message {
  systemPrompt?: string
  topic?: string
}

export function useSentenceChat(options: UseSentenceChatOptions = {}) {
  const [messages, setMessages] = useState<MessageWithSystemPrompt[]>(options.initialMessages || [])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0)
  const [topicSegments, setTopicSegments] = useState<TopicSegment[]>([])
  const [currentSystemPrompt, setCurrentSystemPrompt] = useState<string | undefined>(undefined)

  // Function to add a new message
  const addMessage = useCallback((message: MessageWithSystemPrompt) => {
    setMessages((prev) => [...prev, message])
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
      }

      addMessage(userMessage)

      // Call onUserMessageSent callback if provided
      if (options.onUserMessageSent) {
        options.onUserMessageSent(userMessage)
      }

      setInput("")
      setIsLoading(true)

      try {
        // Send request to API
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
          }),
        })

        if (!response.ok) {
          throw new Error(`Failed to send message: ${response.status}`)
        }

        const data = await response.json()
        console.log("API response:", data)

        // Store the system prompt used for this response
        setCurrentSystemPrompt(data.systemPrompt)

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
            systemPrompt: data.systemPrompt,
          })
        }
      } catch (error) {
        console.error("Error sending message:", error)
        // Add error message
        addMessage({
          id: Date.now().toString(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [input, messages, addMessage, options],
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
            systemPrompt: currentSystemPrompt,
            topic: currentSegment.topic,
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
                systemPrompt: currentSystemPrompt,
              })
            }
          }

          setIsTyping(false)
        },
        1000 + Math.random() * 1000,
      ) // Random typing time between 1-2 seconds

      return () => clearTimeout(typingTimeout)
    }
  }, [topicSegments, currentTopicIndex, isTyping, addMessage, options, currentSystemPrompt])

  // Function to reset chat
  const resetChat = useCallback(async () => {
    // Call API to reset chat on the server
    await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ resetChat: true }),
    })

    // Reset chat on the client
    setMessages(
      options.initialMessages || [
        {
          id: "system-1",
          role: "system",
          content:
            "You are Shenaya. Shenaya is a 28-year-old trendsetting tarot reader who is fashion-forward and pop-culture savvy. You bring tarot readings with a modern edge and discuss the future with style.",
        },
      ],
    )

    setTopicSegments([])
    setCurrentTopicIndex(0)
    setIsTyping(false)
    setCurrentSystemPrompt(undefined)
  }, [options.initialMessages])

  return {
    messages,
    input,
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value),
    handleSubmit,
    isLoading,
    isTyping,
    resetChat,
    setMessages,
  }
}
