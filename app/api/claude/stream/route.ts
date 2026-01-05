import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const runtime = 'edge';

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = streamText({
    model: openrouter('anthropic/claude-3.5-sonnet@20240620'),
    prompt: `Generate perfect ${prompt} code. Preserve ALL details, no skips.`,
    temperature: 0.1,
  });

  return result.toAIStreamResponse();
}
