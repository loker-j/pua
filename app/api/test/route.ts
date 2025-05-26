import { NextResponse } from 'next/server';

export async function GET() {
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  
  return NextResponse.json({
    hasDeepseekKey: !!deepseekKey,
    hasOpenaiKey: !!openaiKey,
    deepseekKeyPrefix: deepseekKey ? deepseekKey.substring(0, 8) + '...' : 'not found',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
} 