import { NextRequest, NextResponse } from 'next/server';
import { convertBirthDetailsToApiFormat } from '@/lib/astrology/api-client';

export async function POST(req: NextRequest) {
  const userId = process.env.ASTROLOGY_API_USER_ID;
  const apiKey = process.env.ASTROLOGY_API_KEY;

  if (!userId || !apiKey) {
    return NextResponse.json({ error: 'Astrology API credentials not set on server.' }, { status: 500 });
  }

  const baseUrl = 'https://json.astrologyapi.com/v1/planets';
  const auth = Buffer.from(`${userId}:${apiKey}`).toString('base64');

  try {
    const body = await req.json();
    console.log("Astrology API request body:", body);
    
    // Convert to the format expected by the external API
    const convertedBody = convertBirthDetailsToApiFormat(body);
    console.log("Converted API body:", convertedBody);
    
    const apiRes = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(convertedBody),
    });

    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      return NextResponse.json({ error: errorText }, { status: apiRes.status });
    }

    const data = await apiRes.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
} 