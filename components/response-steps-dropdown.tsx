"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

export default function ResponseStepsDropdown() {
  const [showSteps, setShowSteps] = useState(false)

  return (
    <div className="ml-11 mr-4 mt-2">
      <button
        onClick={() => setShowSteps(!showSteps)}
        className="flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors"
      >
        {showSteps ? (
          <>
            <ChevronUp size={14} className="mr-1" /> Hide response generation steps
          </>
        ) : (
          <>
            <ChevronDown size={14} className="mr-1" /> Show response generation steps
          </>
        )}
      </button>

      {showSteps && (
        <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-700">
          <div className="font-semibold mb-1">Response Generation Steps:</div>
          <ol className="list-decimal pl-4 space-y-1">
            <li>
              <span className="font-medium">Client-side initialization</span> (hooks/use-sentence-chat.ts):
              <ul className="list-disc pl-4 mt-1">
                <li>useSentenceChat hook initializes the chat state and handlers</li>
                <li>handleSubmit function captures user input and prepares the API request</li>
              </ul>
            </li>
            <li>
              <span className="font-medium">API request processing</span> (app/api/chat/route.ts):
              <ul className="list-disc pl-4 mt-1">
                <li>POST function receives the message and character ID</li>
                <li>getMessageStore retrieves or initializes the message history</li>
                <li>detectLanguageAndScript (lib/language-detector.ts) identifies the language and script</li>
                <li>For Guruji: birth details and chart data are retrieved if available</li>
                <li>
                  For astrological queries: generateGurujiAstrologyPrompt (lib/astrology/prompt-generator.ts) creates a
                  specialized prompt
                </li>
              </ul>
            </li>
            <li>
              <span className="font-medium">Response generation</span> (app/api/chat/route.ts):
              <ul className="list-disc pl-4 mt-1">
                <li>System prompt is enhanced with language instructions</li>
                <li>generateText function calls OpenAI with the prepared messages</li>
                <li>limitEmojis (lib/text-splitter.ts) processes the response text</li>
                <li>analyzeTopics (lib/topic-analyzer.ts) breaks the response into topic segments</li>
              </ul>
            </li>
            <li>
              <span className="font-medium">Response rendering</span> (app/page.tsx):
              <ul className="list-disc pl-4 mt-1">
                <li>Topic segments are received and stored in state</li>
                <li>isTyping state triggers the typing animation</li>
                <li>Each topic segment is rendered as a separate message with typing effect</li>
                <li>ChatMessage component displays the message with proper styling</li>
              </ul>
            </li>
          </ol>
        </div>
      )}
    </div>
  )
}
