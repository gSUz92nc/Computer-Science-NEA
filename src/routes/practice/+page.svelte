<script lang="ts">
    import { writable } from 'svelte/store';
  
    // State to manage chat messages
    const messages = writable<{ text: string, isUser: boolean }[]>([]);
  
    let inputMessage: string = '';
  
    const sendMessage = () => {
      if (inputMessage.trim() !== '') {
        // Add user's message
        messages.update(currentMessages => [
          ...currentMessages,
          { text: inputMessage, isUser: true }
        ]);
        inputMessage = '';
  
        // Simulate a response (you can replace this with an actual API call)
        setTimeout(() => {
          messages.update(currentMessages => [
            ...currentMessages,
            { text: "This is a response from the system.", isUser: false }
          ]);
        }, 1000);
      }
    };
  
    // Handle Enter key press
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        sendMessage();
      }
    };
  </script>
  
  <div class="flex flex-col h-full p-4">
    <div class="flex-grow overflow-y-auto">
      {#each $messages as message (message.text)}
        <div class="chat {message.isUser ? 'chat-end' : 'chat-start'}">
          <div class="chat-bubble">{message.text}</div>
        </div>
      {/each}
    </div>
    <div class="join w-full p-2 sm:p-5 max-sm:pb-10">
      <input
        class="input input-bordered join-item w-full"
        bind:value={inputMessage}
        placeholder="Type a message..."
        on:keypress={handleKeyPress}
      />
      <button class="btn join-item" on:click={sendMessage}>Send</button>
    </div>
  </div>
  