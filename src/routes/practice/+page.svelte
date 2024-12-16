<script lang="ts">
  import { onMount } from 'svelte'
  import { useChat } from '@ai-sdk/svelte'

  const mainChat = useChat()
  const explanationChat = useChat()

  const { input, handleSubmit, messages, setMessages } = mainChat
  let selectedMessage = ''

  const scenario = 'You are a Highschool teacher and the user is a student'

  let tip: HTMLDialogElement

  async function getExplanation(message: string) {
    selectedMessage = message
    tip = document.getElementById('tipModal') as HTMLDialogElement

    await explanationChat.setMessages([
      {
        role: 'system',
        content: 'You are a Japanese tutor. Provide a detailed grammar explanation and translation for the following Japanese text.',
        id: ''
      },
      {
        role: 'user', 
        content: message,
        id: ''
      }
    ])

    tip.showModal()
  }

  onMount(() => {
    tip = document.getElementById('tipModal') as HTMLDialogElement

    setMessages([
      {
        role: 'system',
        content: `You are a Japanese tutor who helps students learn the language by roleplaying different scenarios. Right now you are going to act out this scenario: ${scenario}. Respond in natural Japanese, using Kanji/Hiragana/Katakana. Your message response format should look like this: \n\n(First address anything incorrect that occured in the user's last message in English. make sure you correct anything that is wrong or give them guidance on how to better improve their sentences and make them sound more natural)\n\n(Everything in Kanji when possible or when it makes sense)\n\n(Rewrite with no kanji, replace all the kanji with the appropriate hiragana)\n\nTranslation in English`,
        id: ''
      },
    ])
  })
</script>

<div class="flex flex-col h-screen">
  <div class="flex-1 navbar bg-base-100">
    <div class="btn btn-ghost text-xl">Practice</div>
  </div>
  <dialog id="tipModal" class="modal">
    <div class="modal-box">
      <h3 class="text-lg font-bold">Grammar Explanation</h3>
      <div class="py-4">
        {#each $explanationChat.messages as message}
          {#if message.role === 'assistant'}
            <p class="whitespace-pre-line">{message.content}</p>
          {/if}
        {/each}
      </div>
      <div class="modal-action">
        <form method="dialog">
          <button class="btn">Close</button>
        </form>
      </div>
    </div>
  </dialog>
  <div class="flex-grow overflow-y-auto p-4">
    {#each $messages as message (message.id)}
      {#if message.role !== 'system'}
        <div
          class={`chat ${message.role === 'user' ? 'chat-end' : 'chat-start'}`}
        >
          <div 
            class="chat-bubble whitespace-pre-line"
            role="button"
            tabindex="0"
            on:click={() => message.role === 'assistant' && getExplanation(message.content)}
            on:keydown={(e) => e.key === 'Enter' && message.role === 'assistant' && getExplanation(message.content)}
          >
            {message.content}
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
