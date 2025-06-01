// @ts-check
require('dotenv').config({ path: '.env.local' });
const { createOpenAI } = require('@ai-sdk/openai');
const { generateObject } = require('ai');
const { z } = require('zod');

async function testTimeline() {
  const query = "tell me about my son's health in 2026";
  console.log('🧪 Testing timeline extraction for query:', query);
  
  try {
    // Log API key status
    const apiKey = process.env.OPENAI_API_KEY;
    console.log('🔑 API Key exists:', !!apiKey);
    console.log('🔑 API Key starts with:', apiKey?.substring(0, 7) + '...');
    
    if (!apiKey) {
      throw new Error('OpenAI API key is missing. Please set OPENAI_API_KEY in .env.local');
    }

    console.log('⏳ Starting timeline extraction...');
    
    const openaiProvider = createOpenAI({
      apiKey: apiKey,
      compatibility: "strict",
    });

    const TimelineSchema = z.object({
      timeline: z.string().describe("Exact time reference found in the query"),
      reasoning: z.string().describe("Brief explanation of timeline extraction"),
      confidence: z.number().min(0).max(1).describe("Confidence in timeline extraction")
    });

    const { object } = await generateObject({
      model: openaiProvider("gpt-4.1"),
      schema: TimelineSchema,
      prompt: `TASK: Extract the exact time reference from this query.

Query: "${query}"

INSTRUCTIONS:
1. Find ANY mention of time, period, duration, or date
2. Extract the EXACT phrase as it appears
3. If multiple time references exist, extract the most specific one
4. If no time reference exists, return empty string

EXAMPLES:
- "this year" → "this year"
- "for the year 2030" → "for the year 2030"  
- "in 3 months" → "in 3 months"
- "next summer" → "next summer"
- "by December 2025" → "by December 2025"
- "soon" → "soon"
- "eventually" → "eventually"
- "no time mentioned" → ""

Return JSON with timeline, reasoning, and confidence (0-1).`,
      temperature: 0.6,
    });
    
    console.log('📅 Timeline extracted:', object.timeline);
    console.log('💭 Reasoning:', object.reasoning);
    console.log('🎯 Confidence:', object.confidence);
    console.log('✅ Status:', object.timeline ? 'Found' : 'Not detected');
    
    if (!object.timeline) {
      console.log('⚠️ No timeline was extracted. This could be due to:');
      console.log('   1. API key issues');
      console.log('   2. Model access issues');
      console.log('   3. Query parsing issues');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      responseBody: error.responseBody
    });
    
    if (error.statusCode === 401) {
      console.log('\n🔍 Diagnosis: 401 Unauthorized Error');
      console.log('💡 This usually means:');
      console.log('   1. Invalid API key');
      console.log('   2. API key doesn\'t have access to gpt-4.1');
      console.log('   3. Billing/usage limits reached');
      console.log('   4. Project/organization restrictions');
    }
  }
}

testTimeline(); 