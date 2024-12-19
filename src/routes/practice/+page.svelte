<script lang="ts">
  import { onMount } from 'svelte'
  import { useChat } from '@ai-sdk/svelte'

  const { input, handleSubmit, messages, setMessages } = useChat()

  const scenario = 'You are a Highschool teacher and the user is a student'
  
  let tip: HTMLDialogElement

  onMount(() => {
    
    tip = document.getElementById('tipModal') as HTMLDialogElement
    
  type Scenario = {
    scenarioTitle: string
    scenarioPrompt: string
    firstMessage: string
  } | null

  let showScenarioSelector = true
  let selectedScenario: Scenario = null
  let selectedLevel: number = 0

  const scenarios: Scenario[] = [
    {
      scenarioTitle: 'Ordering Food at a Restaurant',
      scenarioPrompt:
        'You are a customer at a Japanese restaurant, and you need to order food.',
      firstMessage: 'こんにちは、メニューを見せていただけますか？',
    },
    {
      scenarioTitle: 'Asking for Directions',
      scenarioPrompt:
        'You are lost in Tokyo and need to ask a local for directions to the nearest train station.',
      firstMessage: 'すみません、駅はどこですか？',
    },
    {
      scenarioTitle: 'Shopping for Groceries',
      scenarioPrompt:
        'You are at a Japanese supermarket and need to find certain items.',
      firstMessage: 'すみません、りんごはどこにありますか？',
    },
  ]

  function toggleScenarioSelector() {
    showScenarioSelector = !showScenarioSelector
  }

  function selectScenario(scenario: Scenario) {
    if (selectedLevel === 0) {
      alert('Please select a level first')
      return
    }

    setMessages([
      {
        id: 'System',
        role: 'system',
        content: `You are a Japanese tutor who helps students learn the language by roleplaying different scenarios. Right now you are going to act out this scenario: ${scenario}. Respond in natural Japanese, using Kanji/Hiragana/Katakana. Your message response format should look like this: \n\n(First address anything incorrect that occured in the user's last message in English. make sure you correct anything that is wrong or give them guidance on how to better improve their sentences and make them sound more natural)\n\n(Everything in Kanji when possible or when it makes sense)\n\n(Rewrite with no kanji, replace all the kanji with the appropriate hiragana)\n\nTranslation in English`,
        id: '', // This is here for ts, not sure why it doesn't like not including it
      },
    ])
  })
        content: `You are going to help users practice their Japanese. You will roleplay different scenarios with them. They have selected the scenario: ${scenario?.scenarioTitle} at level N${selectedLevel}. Before you respond to them in Japanese you should critque their responses and provide feedback. If there is nothing you should start your conversation with "Looks good!\n...*Continue the conversation in Japanese*"`,
      },
      {
        id: 'Message',
        role: 'assistant',
        content: scenario?.firstMessage || '',
      },
    ])

    selectedScenario = scenario
    toggleScenarioSelector()
  }

  function selectLevel(level: number) {
    selectedLevel = level
  }

  let showTranslation: boolean = false
  let translation: string = ''
  let breakdown: string = ''

  function parseJsonResponse(jsonString: string) {
    try {
      // Remove any leading/trailing whitespace and newlines
      const cleanString = jsonString.trim()
      // Try to extract JSON if it's wrapped in text
      const jsonMatch = cleanString.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      return JSON.parse(cleanString)
    } catch (e) {
      console.error('Failed to parse JSON:', e)
      return {
        translation: 'Error parsing translation',
        breakdown: 'Unable to parse response'
      }
    }
  }

  async function loadTranslationAndBreakdown(originalText: string) {
    showTranslation = true

    try {
      const response = await fetch('/api/gen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { 
              id: 'System', 
              role: 'system', 
              content: "Translate the Japanese text to English and provide a grammatical breakdown. Return ONLY a JSON object in this format: {\"translation\": \"English translation here\", \"breakdown\": \"Breakdown explanation here\"}" 
            },
            {
              id: 'Message',
              role: 'user',
              content: `Translate and breakdown: ${originalText}`,
            },
          ],
        }),
      })

      const data = await response.json()
      console.log('Raw AI response:', data[0].text) // Debug log
      
      const parsedResponse = parseJsonResponse(data[0].text)
      translation = parsedResponse.translation
      breakdown = parsedResponse.breakdown
    } catch (error) {
      console.error('Error:', error)
      translation = 'Error getting translation'
      breakdown = 'An error occurred while processing the request'
    }
  }
</script>

<div class="flex flex-col h-screen">
  <div class="flex-1 navbar bg-base-100">
    <div class="btn btn-ghost text-xl">Practice</div>
  </div>
  <dialog id="tipModal" class="modal">
{#if showScenarioSelector}
  <dialog class="modal modal-open modal-bottom sm:modal-middle">
    <div class="modal-box">
      <div class="flex justify-around">
        <h3 class="text-lg font-bold mt-2">Pick A Scenario To Get Started</h3>
        <select class="select select-bordered w-full max-w-[10rem]">
          <option disabled selected>Select a level</option>
          {#each [1, 2, 3, 4, 5] as level}
            <option value={level} on:click={() => selectLevel(level)}
              >N{level}</option
            >
          {/each}
        </select>
      </div>
      {#each scenarios as scenario}
        <div class="mt-4 shadow-lg min-h-20 rounded-xl p-4 flex justify-around">
          <p class="flex-grow">{scenario?.scenarioTitle}</p>
          <button class="btn w-20" on:click={() => selectScenario(scenario)}
            >Select</button
          >
        </div>
      {/each}
    </div>
  </dialog>
{/if}
{#if showTranslation}
  <dialog class="modal modal-open modal-bottom sm:modal-middle">
    <div class="modal-box">
      <h3 class="text-lg font-bold mt-2">Translation and Breakdown</h3>
      <div class="mt-4">
        <h4 class="font-semibold">Translation:</h4>
        <p class="mt-2">{translation}</p>
      </div>
      <div class="mt-4">
        <h4 class="font-semibold">Breakdown:</h4>
        <p class="mt-2 whitespace-pre-line">{breakdown}</p>
      </div>
      <div class="modal-action">
        <button class="btn" on:click={() => showTranslation = false}>Close</button>
      </div>
    </div>
  </dialog>
{/if}
<div class="flex flex-col h-full">
  <div class="flex-grow overflow-y-auto p-4">
    {#each $messages as message (message.id)}
      {#if message.role !== 'system'}
        <div
          class={`chat ${message.role === 'user' ? 'chat-end' : 'chat-start'}`}
        >
          <div class="chat-bubble whitespace-pre-line">
            {message.content}
            {#if message.role === 'assistant'}
                <button on:click={() => tip.showModal()}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-box-arrow-up-right"
                viewBox="0 0 16 16"
              >
                <path
                  fill-rule="evenodd"
                  d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"
                />
                <path
                  fill-rule="evenodd"
                  d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"
                />
              </svg>
                </button>
              <button on:click={() => loadTranslationAndBreakdown(message.content)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-box-arrow-up-right"
                  viewBox="0 0 16 16"
                >
                  <path
                    fill-rule="evenodd"
                    d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"
                  />
                  <path
                    fill-rule="evenodd"
                    d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"
                  />
                </svg>
              </button>
            {/if}
          </div>
        </div>
      {/if}
    {/each}
  </div>
  <form on:submit={handleSubmit} class="join w-full p-2 sm:p-5 max-sm:pb-10">
    <input
      class="input input-bordered join-item w-full"
      bind:value={$input}
      placeholder="Type a message..."
    />
    <button type="submit" class="btn join-item">Send</button>
  </form>
</div>
