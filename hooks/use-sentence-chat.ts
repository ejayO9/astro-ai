"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import type { Message } from "ai"

interface UseSentenceChatOptions {
  initialMessages?: Message[]
  onFinish?: (message: Message) => void
}

export function useSentenceChat(options: UseSentenceChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>(options.initialMessages || [])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)
  const [sentences, setSentences] = useState<string[]>([])

  // Function to add a new message
  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message])
  }, [])

  // Function to handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (!input.trim()) return

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: input,
      }

      addMessage(userMessage)
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

        if (data.sentences && Array.isArray(data.sentences)) {
          // Set sentences for streaming
          setSentences(data.sentences)
          setCurrentSentenceIndex(0)

          // Start typing animation for first sentence
          setIsTyping(true)
        } else {
          // Fallback if no sentences
          addMessage({
            id: Date.now().toString(),
            role: "assistant",
            content: data.fullResponse || "I'm not sure how to respond to that.",
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
    [input, messages, addMessage],
  )

  // Effect to handle sentence-by-sentence streaming with typing indicators
  useEffect(() => {
    if (sentences.length === 0 || currentSentenceIndex >= sentences.length) return

    // Show typing indicator
    if (isTyping) {
      const typingTimeout = setTimeout(
        () => {
          // Add the current sentence as a message
          addMessage({
            id: `assistant-${Date.now()}-${currentSentenceIndex}`,
            role: "assistant",
            content: sentences[currentSentenceIndex],
          })

          // Move to next sentence
          setCurrentSentenceIndex((prev) => prev + 1)

          // If there are more sentences, show typing again after a pause
          if (currentSentenceIndex < sentences.length - 1) {
            setTimeout(() => setIsTyping(true), 500)
          } else {
            // We're done with all sentences
            if (options.onFinish) {
              options.onFinish({
                id: `assistant-${Date.now()}-complete`,
                role: "assistant",
                content: sentences.join(" "),
              })
            }
          }

          setIsTyping(false)
        },
        1000 + Math.random() * 1000,
      ) // Random typing time between 1-2 seconds

      return () => clearTimeout(typingTimeout)
    }
  }, [sentences, currentSentenceIndex, isTyping, addMessage, options])

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

    setSentences([])
    setCurrentSentenceIndex(0)
    setIsTyping(false)
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
