import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

export interface TopicSegment {
  topic: string
  content: string
}

/**
 * Analyzes text to identify unique topics and segments the text accordingly
 */
export async function analyzeTopics(text: string): Promise<TopicSegment[]> {
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

    // Use a smaller model for efficiency in topic analysis
    const { object } = await generateObject({
      model: openai("gpt-3.5-turbo"),
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
    })

    return object.segments
  } catch (error) {
    console.error("Error analyzing topics:", error)
    // If analysis fails, return the entire text as a single topic
    return [
      {
        topic: "Complete response",
        content: text,
      },
    ]
  }
}
