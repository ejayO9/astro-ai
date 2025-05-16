"use client"

import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChatHeaderProps {
  summaryCount: number
  onResetChat: () => void
}

export default function ChatHeader({ summaryCount, onResetChat }: ChatHeaderProps) {
  return (
    <header className="border-b p-4 flex items-center justify-between sticky top-0 bg-white z-10">
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
          <span className="text-purple-600 text-sm">S</span>
        </div>
        <h1 className="font-medium">Shenaya's Tarot</h1>
      </div>
      <Button variant="ghost" size="icon" onClick={onResetChat} aria-label="Reset chat">
        <RefreshCw size={18} />
      </Button>
    </header>
  )
}
