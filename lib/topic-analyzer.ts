import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"
import { logInfo, logError, logDebug, logWarn } from "@/lib/logging-service"

export interface TopicSegment {
  topic: string
  content: string
}

/**
 * Analyzes text to identify unique topics and segments the text accordingly
 */
export async function analyzeTopics(text: string): Promise<TopicSegment[]> {
  logInfo("topic-analyzer", "Analyzing text for topics", {
    textLength: text.length,
  })

  try {
    // Define the schema for topic analysis
    const topicSchema = z.object({
      segments: z
        .array(
          z.object({
            topic: z.string().describe("A short descriptive name for this topic"),
            content: z.string().describe("The exact text segment that belongs to this topic"),
          }),
        )
        .describe("Segments of the text divided by unique topics"),
    })
    logDebug("topic-analyzer", "Schema defined")

    // Use a smaller model for efficiency in topic analysis
    logInfo("topic-analyzer", "Starting topic analysis with AI model")
    const startTime = Date.now()

    const generateObjectPromise = generateObject({
      model: openai("gpt-4.1"),
      schema: topicSchema,
      system: `You are a topic analyzer. Your task is to analyze text and identify unique topics or themes.
    Break the text into logical segments based on topic changes. 
    Each segment should contain complete thoughts on a single topic.
    Ensure that the 'content' field contains the EXACT text from the original, with no modifications.
    Do not split mid-sentence unless absolutely necessary.
    If the text is short or only covers one topic, return it as a single segment.`,
      prompt: `Analyze the following text and divide it into segments based on unique topics:

${text}`,
      temperature: 0.2, // Low temperature for more consistent analysis
    }).catch((err) => {
      logError("topic-analyzer", "Error in generateObject", err)
      throw new Error(`Failed to analyze topics: ${err.message || "Unknown error"}`)
    })

    // Add a timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        logError("topic-analyzer", "Topic analysis timed out after 10 seconds")
        reject(new Error("Topic analysis timed out after 10 seconds"))
      }, 10000)
    })

    // Race the promises
    const { object } = (await Promise.race([generateObjectPromise, timeoutPromise])) as {
      object: { segments: TopicSegment[] }
    }

    const analysisTime = Date.now() - startTime
    logInfo("topic-analyzer", `Topic analysis completed in ${analysisTime}ms`, {
      segmentCount: object.segments.length,
    })

    return object.segments
  } catch (error) {
    logError("topic-analyzer", "Error analyzing topics", error)
    // If analysis fails, return the entire text as a single topic
    logWarn("topic-analyzer", "Returning entire text as a single topic")
    return [
      {
        topic: "Complete response",
        content: text,
      },
    ]
  }
}
