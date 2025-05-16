export function splitIntoSentences(text: string): string[] {
  // Simple regex to split on sentence-ending punctuation
  const sentences = text.split(/(?<=[.!?])\s+/)

  // Filter out empty sentences and trim each one
  return sentences.map((sentence) => sentence.trim()).filter((sentence) => sentence.length > 0)
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
