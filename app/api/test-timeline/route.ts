import { NextRequest, NextResponse } from 'next/server'
import { extractTimelineWithLLM } from '@/lib/astrology/llm-intent-extractor'

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    console.log(`🧪 Testing timeline extraction for: "${query}"`)
    
    const startTime = Date.now()
    const timeline = await extractTimelineWithLLM(query)
    const endTime = Date.now()
    
    const result = {
      query,
      timeline,
      status: timeline ? 'Found' : 'Not detected',
      executionTime: `${endTime - startTime}ms`,
      timestamp: new Date().toISOString()
    }
    
    console.log(`📅 Result:`, result)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ Timeline extraction test failed:', error)
    return NextResponse.json({ 
      error: 'Timeline extraction failed', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Timeline extraction test endpoint',
    usage: 'POST with { "query": "your test query" }'
  })
} 