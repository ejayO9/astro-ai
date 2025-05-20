import { categorizeQuery } from "../lib/query-categorization-service"
import { processAstrologyQuery } from "../lib/astrology/query-processor"
import { getBirthDetails } from "../lib/astrology/storage"
import { calculateVedicChart } from "../lib/astrology/calculator"

async function demonstrateCategorization() {
  // Example queries to categorize
  const queries = [
    "Will I ever find a career that truly fulfills me?",
    "How can I improve my financial situation in the next year?",
    "When will I meet my soulmate?",
    "What does my chart say about my health and longevity?",
    "How can I develop more self-discipline?",
    "What is my spiritual path according to my chart?",
    "Do I have creative talents I haven't discovered yet?",
    "How can I improve my learning abilities?",
    "Will I have a strong social network in the future?",
    "Where is the best place for me to live?",
    "What kind of legacy am I meant to leave?",
    "Will I travel extensively in my lifetime?",
    "How can I better manage my time and energy?",
  ]

  console.log("QUERY CATEGORIZATION EXAMPLES:")
  console.log("==============================")

  // Categorize each query
  for (const query of queries) {
    const result = await categorizeQuery(query)
    console.log(`\nQuery: "${query}"`)
    console.log(`Category: ${result.category}`)
    console.log(`Subcategory: ${result.subcategory}`)
    console.log(`Confidence: ${result.confidence.toFixed(2)}`)
    if (result.alternativeCategory) {
      console.log(`Alternative: ${result.alternativeCategory}`)
    }
    console.log(`Explanation: ${result.explanation}`)
  }

  // Example of full query processing with birth details
  console.log("\n\nFULL QUERY PROCESSING EXAMPLE:")
  console.log("==============================")

  // Get stored birth details (if available)
  const birthDetails = getBirthDetails()

  if (birthDetails) {
    try {
      // Calculate the chart
      const chartData = await calculateVedicChart(birthDetails)

      // Process a sample query
      const sampleQuery = "Will I find success in my career path and what are my natural talents?"
      console.log(`\nProcessing query: "${sampleQuery}"`)

      const enhancedPrompt = await processAstrologyQuery(sampleQuery, birthDetails, chartData)

      console.log("Enhanced prompt generated successfully!")
      console.log("Prompt length:", enhancedPrompt.length, "characters")
      console.log("First 200 characters of prompt:", enhancedPrompt.substring(0, 200) + "...")
    } catch (error) {
      console.error("Error in full query processing:", error)
    }
  } else {
    console.log("No birth details available. Please provide birth details first.")
  }
}

// Run the demonstration
demonstrateCategorization().catch(console.error)
