import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  
  const result = await streamText({
    model: openrouter('anthropic/claude-3.5-sonnet@20240620'),
    prompt: `Generate PERFECT ${prompt} code. Preserve ALL details.`,
  });

  return result.toTextStreamResponse();  // ✅ FIXED: toTextStreamResponse()
}
