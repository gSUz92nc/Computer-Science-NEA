// src/routes/api/chat/+server.ts
import type { RequestHandler } from '../gen/$types'
import { generateText } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { env } from '$env/dynamic/private'

const anthropic = createAnthropic({ apiKey: env.ANTHROPIC_API_KEY ?? '' })

export const POST = (async ({ request: req }) => {
  // Extract the `messages` from the body of the request
  const { messages } = await req.json()

  // Get a language model
  const model = anthropic('claude-3-5-sonnet-latest') //claude-3-haiku-20240307

  // Call the language model with the prompt
  const result = await generateText({
    model,
    messages,
    maxTokens: 1024,
    temperature: 1,
    topP: 1,
    frequencyPenalty: 1,
    presencePenalty: 1,
  })

  // Extract the text content from the response
  const textContent = result.response.messages[0].content

  console.log('textContent:', textContent)

  // Convert content to string and respond
  return new Response(JSON.stringify(textContent))
})
