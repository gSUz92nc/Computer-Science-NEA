<!-- src/components/Dictionary.svelte -->
<script lang="ts">
  import { toKatakana, toHiragana, toKana } from 'wanakana'
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

  async function fetchDictionary(searchValue: string) {
    const searchId = ++currentSearchId
    try {
      searching = true

      // const { data } = await supabase
      //   .from('entry')
      //   .select(
      //     '*, kana ( *, kana_common (*), kana_tags(*), kana_applies_to_kanji(*)), kanji ( *, kanji_common (*), kanji_tags (*)), sense ( *, sense_info (*), antonym (*), cross_reference (*), sense_applies_to_kanji (*), dialect (*), sense_applies_to_kana (*), field (*), definition (*), misc (*), lang_source (*), part_of_speech (*) ))',
      //   )
      //   .textSearch('sense.definition.value', searchValue, { config: "english", type: "websearch" })


      const { data } = await supabase
        .from('definition')
        .select(
          '*',
        )
        .textSearch('value', searchValue)

      if (searchId === currentSearchId) {
        dictionaryEntries = data ?? []
      }

      console.log('Dictionary entries', dictionaryEntries)
    } catch (error) {
      console.error('Error fetching dictionary', error)
    } finally {
      if (searchId === currentSearchId) {
        searching = false
      }
    }
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
          <!-- @ts-ignore -->
          <span class="badge badge-success">Common</span>
          <p class="text-sm font-semibold">
            {entry.senses}
          </p>
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
