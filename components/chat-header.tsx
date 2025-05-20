"use client"

import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import type { Character } from "@/types/character"
import CharacterSelector from "./character-selector"

interface ChatHeaderProps {
  summaryCount: number
  onResetChat: () => void
  selectedCharacter: Character
  characters: Character[]
  onSelectCharacter: (character: Character) => void
}

export default function ChatHeader({
  summaryCount,
  onResetChat,
  selectedCharacter,
  characters,
  onSelectCharacter,
}: ChatHeaderProps) {
  return (
    <header className="border-b p-4 flex items-center justify-between sticky top-0 bg-white z-10">
      <div className="flex items-center space-x-2">
        <div className="relative h-8 w-8 rounded-full overflow-hidden">
          <Image
            src={selectedCharacter.avatarUrl || "/placeholder.svg"}
            alt={`${selectedCharacter.name}'s avatar`}
            fill
            className="object-cover"
          />
        </div>
        <h1 className="font-medium">{selectedCharacter.name}</h1>
      </div>
      <div className="flex items-center gap-4">
        <CharacterSelector
          characters={characters}
          selectedCharacter={selectedCharacter}
          onSelectCharacter={onSelectCharacter}
        />
        <Button variant="ghost" size="icon" onClick={onResetChat} aria-label="Reset chat">
          <RefreshCw size={18} />
        </Button>
      </div>
    </header>
  )
}
