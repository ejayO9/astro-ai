import type { Message } from "ai"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex items-start gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
          <span className="text-purple-600 text-sm">S</span>
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
  )
}
