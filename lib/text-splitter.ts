export function splitIntoSentences(text: string): string[] {
  // Simple regex to split on sentence-ending punctuation
  const sentences = text.split(/(?<=[.!?])\s+/)

  // Filter out empty sentences and trim each one
  const trimmedSentences = sentences.map((sentence) => sentence.trim()).filter((sentence) => sentence.length > 0)

  // If we have at least two sentences, check if the last one is just an emoji or ends with an emoji
  if (trimmedSentences.length >= 2) {
    const lastSentence = trimmedSentences[trimmedSentences.length - 1]

    // Simple emoji regex
    const emojiRegex = /[\p{Emoji}]+$/u

    // Check if the last sentence is just an emoji or ends with an emoji
    if (emojiRegex.test(lastSentence)) {
      // Remove the last sentence
      const lastItem = trimmedSentences.pop()

      // If the last sentence is just an emoji or ends with an emoji, combine it with the previous sentence
      if (lastItem) {
        const secondLastIndex = trimmedSentences.length - 1
        trimmedSentences[secondLastIndex] = trimmedSentences[secondLastIndex] + " " + lastItem
      }
    }
  }

  return trimmedSentences
}

export function limitEmojis(text: string, limit = 1): string {
  // Simple emoji regex (not perfect but works for most common emojis)
  const emojiRegex = /[\p{Emoji}]/gu

  const emojis = text.match(emojiRegex) || []

  if (emojis.length <= limit) {
    return text // No change needed
  }

  // Keep track of emojis we've seen
  let emojiCount = 0
  let result = ""

  // Go through the text character by character
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const isEmoji = char.match(emojiRegex)

    if (isEmoji && emojiCount >= limit) {
      // Skip this emoji
      continue
    } else if (isEmoji) {
      emojiCount++
    }

    result += char
  }

  return result
}
