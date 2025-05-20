"use client"

import { useState } from "react"
import Image from "next/image"
import type { Character } from "@/types/character"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface CharacterSelectorProps {
  characters: Character[]
  selectedCharacter: Character
  onSelectCharacter: (character: Character) => void
}

export default function CharacterSelector({
  characters,
  selectedCharacter,
  onSelectCharacter,
}: CharacterSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleDropdown = () => setIsOpen(!isOpen)

  const handleSelectCharacter = (character: Character) => {
    onSelectCharacter(character)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Dropdown button */}
      <button onClick={toggleDropdown} className="flex items-center gap-2 px-4 py-2 rounded-full border bg-white">
        <Image src="/placeholder.svg?height=24&width=24&query=lotus flower" alt="Lotus icon" width={24} height={24} />
        <span>Talk to your favourite guide</span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border overflow-hidden z-50">
          <div className="max-h-[70vh] overflow-y-auto">
            {characters.map((character) => (
              <div
                key={character.id}
                className={cn(
                  "flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors border-b last:border-b-0 cursor-pointer",
                  selectedCharacter.id === character.id && "bg-slate-50",
                )}
                onClick={() => handleSelectCharacter(character)}
              >
                <div className="relative h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={character.avatarUrl || "/placeholder.svg"}
                    alt={`${character.name}'s avatar`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{character.name}</span>
                  <span className="text-sm text-slate-500">{character.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
