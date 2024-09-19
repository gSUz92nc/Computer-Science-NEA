// src/routes/api/chat/+server.ts
import type { RequestHandler } from "./$types";
import { streamText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { env } from "$env/dynamic/private";

const anthropic = createAnthropic({ apiKey: env.ANTHROPIC_API_KEY ?? "" });

export const POST = (async ({ request: req }) => {
  // Extract the `messages` from the body of the request
  const { messages } = await req.json();

  // Get a language model
  const model = anthropic("claude-3-haiku-20240307"); //'claude-3-5-sonnet-20240620')

  // Call the language model with the prompt
  const result = await streamText({
    model,
    messages,
    maxTokens: 1024,
  });

  // Respond with a streaming response
  return result.toDataStreamResponse();
}) satisfies RequestHandler;
