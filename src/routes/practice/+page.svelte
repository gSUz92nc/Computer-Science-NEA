<script lang="ts">
  import { onMount } from 'svelte'
  import { useChat } from '@ai-sdk/svelte'

  const { input, handleSubmit, messages, setMessages } = useChat()

  const scenario = 'You are a Highschool teacher and the user is a student'

  let selectedMessage: string | null = null;
  let tip: HTMLDialogElement

  onMount(() => {
    tip = document.getElementById('tipModal') as HTMLDialogElement

    setMessages([
      {
        role: 'system',
        content: `You are a Japanese tutor who helps students learn the language by roleplaying different scenarios. Right now you are going to act out this scenario: ${scenario}. Respond in natural Japanese, using Kanji/Hiragana/Katakana. Your message response format should look like this: \n\n(First address anything incorrect that occured in the user's last message in English. make sure you correct anything that is wrong or give them guidance on how to better improve their sentences and make them sound more natural)\n\n(Everything in Kanji when possible or when it makes sense)\n\n(Rewrite with no kanji, replace all the kanji with the appropriate hiragana)\n\nTranslation in English`,
        id: '',
      },
    ])
  })

  const showTranslation = async (content: string) => {
    selectedMessage = content;
    const response = await fetch('/api/explain', {
      method: 'POST',
      body: JSON.stringify({ message: content }),
    });
    const explanation = await response.json();
    tip.querySelector('.modal-content').innerHTML = `
      <h3 class="text-lg font-bold">Translation & Grammar</h3>
      <div class="py-4">
        <p class="font-bold">Original:</p>
        <p>${content}</p>
        <p class="font-bold mt-4">Translation:</p>
        <p>${explanation.translation}</p>
        <p class="font-bold mt-4">Grammar Notes:</p>
        <p>${explanation.grammar}</p>
      </div>
    `;
    tip.showModal();
  }
</script>

<div class="flex flex-col h-screen">
  <div class="flex-1 navbar bg-base-100">
    <div class="btn btn-ghost text-xl">Practice</div>
  </div>
  <dialog id="tipModal" class="modal">
    <div class="modal-box">
      <div class="modal-content">
        <h3 class="text-lg font-bold">Hello!</h3>
        <p class="py-4">Press ESC key or click the button below to close</p>
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
          <div class="chat-bubble whitespace-pre-line cursor-pointer" on:click={() => showTranslation(message.content)}>
            {message.content}
            {#if message.role === 'assistant'}
              <button>
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
