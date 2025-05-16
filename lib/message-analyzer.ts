/**
 * Checks if a message is a greeting or doesn't contain a question
 */
export function isGreetingOrNonQuestion(message: string): boolean {
  // Normalize the message
  const normalizedMessage = message.toLowerCase().trim()

  // Common greetings
  const greetings = [
    "hi",
    "hello",
    "hey",
    "greetings",
    "howdy",
    "hiya",
    "yo",
    "good morning",
    "good afternoon",
    "good evening",
    "good day",
    "sup",
    "what's up",
    "whats up",
    "wassup",
    "hi there",
    "hello there",
    "hey there",
    "hi shenaya",
    "hello shenaya",
    "hey shenaya",
  ]

  // Check if the message is just a greeting
  if (
    greetings.some(
      (greeting) =>
        normalizedMessage === greeting ||
        normalizedMessage.startsWith(greeting + " ") ||
        normalizedMessage.endsWith(" " + greeting),
    )
  ) {
    return true
  }

  // Check if the message contains a question mark
  if (normalizedMessage.includes("?")) {
    return false
  }

  // Check for common question words/phrases without a question mark
  const questionPhrases = [
    "what",
    "when",
    "where",
    "who",
    "whom",
    "whose",
    "which",
    "why",
    "how",
    "can you",
    "could you",
    "will you",
    "would you",
    "do you",
    "does",
    "is there",
    "are there",
    "tell me",
    "explain",
    "describe",
    "give me",
    "i want to know",
    "i'd like to know",
    "i would like to know",
    "can i",
    "could i",
    "should i",
    "would",
    "will",
    "is",
    "are",
    "was",
    "were",
    "read my",
    "do a reading",
    "tarot reading",
    "tell my fortune",
    "predict",
  ]

  // If any question phrase is found, it's likely a question
  if (questionPhrases.some((phrase) => normalizedMessage.includes(phrase))) {
    return false
  }

  // If we get here, it's likely not a question
  return true
}
