/**
 * Detects if text contains Hindi script (Devanagari)
 */
export function containsHindiScript(text: string): boolean {
  // Hindi Unicode range (Devanagari script)
  const hindiRegex = /[\u0900-\u097F]/
  return hindiRegex.test(text)
}

/**
 * Detects if text is likely Hinglish (Hindi words in Latin script)
 */
export function isLikelyHinglish(text: string): boolean {
  // Common Hinglish words and patterns
  const hinglishPatterns = [
    /\b(kya|kaise|kaisa|mera|tera|apna|hai|hoga|honge|acha|theek|nahi|nahin|maine|mujhe|tumhe|aap|tum)\b/i,
    /\b(karenge|karunga|karo|karna|karna|kiya|diya|liya|gaya|aaya|jaana|aana)\b/i,
    /\b(bahut|thoda|zyada|kam|jyada|phir|lekin|magar|aur|par|fir|kyunki|isliye)\b/i,
  ]

  // Check if text contains English characters (to exclude pure Hindi)
  const hasLatinChars = /[a-zA-Z]/.test(text)

  // Check if text matches any Hinglish patterns
  const matchesHinglishPatterns = hinglishPatterns.some((pattern) => pattern.test(text))

  return hasLatinChars && matchesHinglishPatterns
}

/**
 * Determines the language and script of the text
 */
export function detectLanguageAndScript(text: string): {
  language: "english" | "hindi" | "hinglish"
  script: "latin" | "devanagari"
} {
  if (containsHindiScript(text)) {
    return { language: "hindi", script: "devanagari" }
  } else if (isLikelyHinglish(text)) {
    return { language: "hinglish", script: "latin" }
  } else {
    return { language: "english", script: "latin" }
  }
}
