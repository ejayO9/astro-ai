"use client"

import Image from "next/image"
import type { Character } from "@/types/character"

interface CharacterSelectionScreenProps {
  characters: Character[]
  onSelectCharacter: (character: Character) => void
}

export default function CharacterSelectionScreen({ characters, onSelectCharacter }: CharacterSelectionScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-10">
      <Image
        src="/placeholder.svg?height=80&width=80&query=lotus flower"
        alt="Lotus icon"
        width={80}
        height={80}
        className="mb-6"
      />

      <div className="space-y-2 max-w-md mb-8">
        <h2 className="text-4xl font-bold mb-4">Choose your guide</h2>
        <p className="text-slate-600">Select a guide from the dropdown in the top right to start your journey</p>
      </div>

      <button
        onClick={() => onSelectCharacter(characters[0])}
        className="px-6 py-3 bg-black text-white rounded-full font-medium"
      >
        Select a guide
      </button>

      {/* Character selection panel */}
      <div className="w-full max-w-md mt-8 border rounded-lg overflow-hidden">
        {characters.map((character) => (
          <div
            key={character.id}
            className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors border-b last:border-b-0 cursor-pointer"
            onClick={() => onSelectCharacter(character)}
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
  )
}
