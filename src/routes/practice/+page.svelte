  <script lang="ts">
    import { writable } from 'svelte/store';
  
    // State to manage chat messages
    //const sceneSelect = document.getElementById("sceneSelect")
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
  
  <!-- Open the modal using ID.showModal() method -->
<!-- <button class="btn" on:click={() => sceneSelect?.showModal()}>open modal</button> -->
<dialog id="sceneSelect" class="modal modal-bottom sm:modal-middle">
  <div class="modal-box">
    <h3 class="text-lg font-bold">Hello!</h3>
    <p class="py-4">Press ESC key or click the button below to close</p>
    <div class="modal-action">
      <form method="dialog">
        <!-- if there is a button in form, it will close the modal -->
        <button class="btn">Close</button>
      </form>
    </div>
  </div>
</dialog>
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
  