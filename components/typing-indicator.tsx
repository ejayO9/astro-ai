"use client"

interface TypingIndicatorProps {
  characterName: string
}

export default function TypingIndicator({ characterName }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-gray-500">
      <div className="flex space-x-1">
        <div className="w-2 h-2 rounded-full bg-gray-500 animate-typing-dot" style={{ animationDelay: "0ms" }}></div>
        <div className="w-2 h-2 rounded-full bg-gray-500 animate-typing-dot" style={{ animationDelay: "300ms" }}></div>
        <div className="w-2 h-2 rounded-full bg-gray-500 animate-typing-dot" style={{ animationDelay: "600ms" }}></div>
      </div>
      <span className="text-sm font-medium">{characterName} is typing...</span>
    </div>
  )
}
