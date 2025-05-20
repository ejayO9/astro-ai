import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

// Define the schema for query categorization
const categorizationSchema = z.object({
  category: z.string().describe("The main category that best matches the user's query"),
  subcategory: z.string().describe("The most relevant subcategory within the main category"),
  confidence: z.number().min(0).max(1).describe("Confidence level in this categorization (0-1)"),
  alternativeCategory: z.string().optional().describe("A secondary category that might also apply"),
  explanation: z.string().describe("Brief explanation of why this category was chosen"),
})

export type QueryCategorization = z.infer<typeof categorizationSchema>

/**
 * Categorizes a user query into one of the predefined life areas and subcategories
 * @param userQuery The user's query text
 * @returns A categorization object with category, subcategory, confidence, etc.
 */
export async function categorizeQuery(userQuery: string): Promise<QueryCategorization> {
  try {
    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: categorizationSchema,
      system: `You are a specialized categorization assistant for Vedic astrology queries. Your task is to analyze user questions and categorize them into one of the following life areas and subcategories:

1. Career and Professional Life
   - Career path alignment and natural aptitudes
   - Leadership potential and management style
   - Professional relationships and workplace dynamics
   - Work-life balance tendencies
   - Career satisfaction and fulfillment
   - Entrepreneurial abilities
   - Professional growth trajectory
   - Decision-making approach in professional settings
   - Workplace communication style
   - Response to professional challenges

2. Financial Well-being
   - Money management tendencies
   - Relationship with wealth and abundance
   - Financial decision-making patterns
   - Risk tolerance with investments
   - Long-term financial planning approach
   - Wealth accumulation potential
   - Financial security needs
   - Spending and saving habits
   - Financial independence pathway
   - Attitudes toward material possessions

3. Personal Relationships
   - Romantic partnership dynamics
   - Friendship patterns and needs
   - Family relationships and roles
   - Communication style in close relationships
   - Conflict resolution approach
   - Intimacy needs and expression
   - Trust development patterns
   - Loyalty and commitment tendencies
   - Relationship expectations
   - Balance of giving and receiving

4. Health and Well-being
   - Physical vitality and energy management
   - Mental health tendencies
   - Emotional balance and regulation
   - Stress response patterns
   - Health maintenance approach
   - Healing capacity and resilience
   - Self-care tendencies
   - Physical activity preferences
   - Rest and recovery needs
   - Relationship with food and nutrition

5. Personal Development
   - Self-awareness and growth patterns
   - Life purpose alignment
   - Personal values and principles
   - Identity development
   - Character strengths and challenges
   - Goal-setting approach
   - Personal transformation capacity
   - Self-discipline tendencies
   - Personal boundaries management
   - Adaptability to change

6. Spiritual Life
   - Spiritual path tendencies
   - Connection to higher meaning
   - Meditation and contemplative practices
   - Faith and belief systems
   - Intuitive development
   - Spiritual community involvement
   - Life philosophy development
   - Inner wisdom access
   - Transcendent experiences
   - Spiritual growth patterns

7. Creativity and Self-expression
   - Creative talents and natural abilities
   - Artistic expression tendencies
   - Creative problem-solving approach
   - Innovation capacity
   - Self-expression style
   - Creative blocks and challenges
   - Artistic development potential
   - Relationship with beauty and aesthetics
   - Creative fulfillment needs
   - Originality and uniqueness expression

8. Intellectual Life
   - Learning style and preferences
   - Intellectual curiosity patterns
   - Critical thinking approach
   - Knowledge acquisition tendencies
   - Information processing style
   - Mental flexibility
   - Analytical abilities
   - Wisdom development
   - Educational pursuits
   - Intellectual challenges and growth

9. Social Life and Community
   - Social network development
   - Community involvement tendencies
   - Leadership in group settings
   - Social communication style
   - Group dynamics navigation
   - Social contribution patterns
   - Cultural engagement
   - Social responsibility approach
   - Public perception management
   - Belonging and connection needs

10. Home and Living Environment
   - Home environment preferences
   - Living space organization tendencies
   - Domestic harmony needs
   - Family life development
   - Rootedness and stability needs
   - Relationship with physical surroundings
   - Home as sanctuary development
   - Geographical location preferences
   - Personal space requirements
   - Home-based activities and interests

11. Legacy and Life Purpose
   - Life mission alignment
   - Contribution to future generations
   - Values transmission
   - Knowledge and wisdom sharing
   - Meaningful impact creation
   - Long-term vision development
   - Personal legend creation
   - Historical context awareness
   - Generational healing potential
   - Ethical and moral legacy

12. Adventure and Travel
   - Exploration tendencies
   - Risk-taking in new experiences
   - Cultural adaptation abilities
   - Travel preferences and patterns
   - Geographic interests
   - Experience-seeking tendencies
   - Comfort with unfamiliarity
   - Travel learning style
   - Adventure planning approach
   - Balance between exploration and security

13. Time Management and Life Balance
   - Priority setting tendencies
   - Efficiency and effectiveness patterns
   - Balance between life areas
   - Time perception and relationship
   - Long-term vs. short-term focus
   - Procrastination tendencies
   - Productivity patterns
   - Rest and activity cycles
   - Life rhythm development
   - Presence and mindfulness capacity

Analyze the user's query carefully and identify the most appropriate category and subcategory.`,
      prompt: `Categorize this user query into one of the predefined life areas and subcategories:

"${userQuery}"`,
      temperature: 0.3, // Lower temperature for more consistent categorization
    })

    return object
  } catch (error) {
    console.error("Error categorizing query:", error)
    // Return a default categorization if there's an error
    return {
      category: "Personal Development",
      subcategory: "Life purpose alignment",
      confidence: 0.5,
      explanation: "Failed to categorize query due to an error. Defaulting to general life purpose category.",
    }
  }
}
