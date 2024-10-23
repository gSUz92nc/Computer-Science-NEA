<!-- src/components/Dictionary.svelte -->
<script lang="ts">
  import { isJapanese } from 'wanakana'
  import type { SupabaseClient } from '@supabase/supabase-js'
  import { onMount } from 'svelte'
  import pkg from 'lodash'
  const { debounce } = pkg

  export let supabase: SupabaseClient

  let dictionaryEntries: any[] = []
  let dictionarySearchValue = ''
  let searching = false

  $: fetchDictionary(dictionarySearchValue)

  let currentSearchId = 0

  $: console.log(counter)

  let lastRequestTimestamp = 0
  let pendingRequest: AbortController | null = null

  const fetchDictionaryDebounced = debounce(async (searchTerm: string) => {
    const currentTimestamp = Date.now()
    if (currentTimestamp - lastRequestTimestamp < 200) {
      if (pendingRequest) {
        pendingRequest.abort()
      }
    }
    lastRequestTimestamp = currentTimestamp

    const controller = new AbortController()
    pendingRequest = controller

    counter++

    if (searchTerm === '') {
      dictionaryEntries = []
      return
    }

    let japanese = isJapanese(searchTerm)

    searching = true

    try {
      const { data, error } = await supabase.rpc('search_entries', {
        p_definition: japanese ? searchTerm : '',
        p_kana: japanese ? '' : searchTerm,
        p_kanji: japanese ? searchTerm : '',
      })

      console.log(data)

      if (error) {
        console.error('Error fetching dictionary entries', error)
      } else {
        dictionaryEntries = data
        console.log(dictionaryEntries)
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        console.log('Request aborted')
      } else {
        console.error('Error fetching dictionary entries', err)
      }
    } finally {
      searching = false
      pendingRequest = null
    }
  }, 200)

  async function fetchDictionary(searchTerm: string) {
    fetchDictionaryDebounced(searchTerm)
  }
</script>

<dialog id="dictionary" class="modal modal-bottom lg:modal-middle w-full">
  <div class="modal-box min-h-[80vh] lg:min-h-[60vh]">
    <div class="join w-full">
      <select class="select select-bordered join-item">
        <option selected>All</option>
        <option>Words</option>
      </select>
      <div class="w-full">
        <div class="w-full">
          <input
            class="input input-bordered join-item w-full"
            placeholder="Search"
            bind:value={dictionarySearchValue}
          />
        </div>
      </div>
      <button
        class="btn rounded-l-none rounded-r-md mr-2"
        on:click={() => fetchDictionary(dictionarySearchValue)}>Search</button
      >
      <form method="dialog">
        <button class="btn btn-md btn-circle btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-x-lg"
            viewBox="0 0 16 16"
          >
            <path
              d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"
            />
          </svg>
        </button>
      </form>
    </div>
    {#if searching}
      <div class="mt-2">
        <h2 class="font-bold text-2xl">Searching...</h2>
      </div>
    {:else if dictionaryEntries.length == 0}
      {#if dictionarySearchValue.length > 0}
        <div class="mt-2">
          <h2 class="font-bold text-2xl">No results found</h2>
          <p class="text-lg font-semibold">Try searching for something else</p>
        </div>
      {/if}
      <div></div>
    {:else}
      <div class="mt-2">
        <h2 class="font-semibold text-md">
          Entries found: {dictionaryEntries.length}
        </h2>
      </div>
      {#each dictionaryEntries as entry}
        <div class="mt-2">
          {#if entry.kanji}
            <h2 class="font-bold text-2xl">
              {entry.kanji}
            </h2>
            <p>
              {entry.kana}
            </p>
          {:else}
            <h2 class="font-bold text-2xl">
              {entry.kana}
            </h2>
          {/if}
          {#each entry.senses as sense}
            <li>
              <p class="text-lg font-semibold">
                {sense.definition}
              </p>
              {#if sense.info.length > 0}
                <p class="text-sm text-gray-500">
                  Info: {sense.info.join(', ')}
                </p>
              {/if}
              {#if sense.misc.length > 0}
                <p class="text-sm text-gray-500">
                  Misc: {sense.misc.join(', ')}
                </p>
              {/if}
              {#if sense.field.length > 0}
                <p class="text-sm text-gray-500">
                  Field: {sense.field.join(', ')}
                </p>
              {/if}
              {#if sense.dialect.length > 0}
                <p class="text-sm text-gray-500">
                  Dialect: {sense.dialect.join(', ')}
                </p>
              {/if}
            </li>
          {/each}
        </div>
        <div class="divider"></div>
      {/each}
    {/if}
  </div>
</dialog>

<style>
  .modal-box {
    overflow-y: auto;
  }
</style>
