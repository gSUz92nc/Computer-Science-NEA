<!-- src/components/Dictionary.svelte -->
<script lang="ts">
  import { toKatakana, toHiragana } from 'wanakana'
  import type { SupabaseClient } from '@supabase/supabase-js'
  import { onMount } from 'svelte'
  import pkg from 'lodash'
  const { debounce } = pkg

  export let supabase: SupabaseClient

  let dictionaryEntries: any[] = []
  let dictionarySearchValue = 'nuclear deterrent force'
  let searching = false

  $: fetchDictionary(dictionarySearchValue)

  let counter = 0

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

    const kata = toKatakana(searchTerm)
    const hira = toHiragana(searchTerm)
    searching = true

    try {
      const { data, error } = await supabase.rpc('get_jmdict_entries', {
        gloss_input: searchTerm,
        kanji_input: searchTerm,
        hiragana_input: hira,
        katakana_input: kata,
      })

      if (error) {
        console.error('Error fetching dictionary entries', error)
      } else {
        dictionaryEntries = reorderDictionaryEntries(data)
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

  function reorderDictionaryEntries(entriesToBeReordered: any[]) {
    // Sort dictionary by whether their one of their entry.kana[].common = true and then by whether one of their rentry.senses.glosses[].text is equal to the search term

    entriesToBeReordered.sort((a, b) => {
      const aCommon: boolean = a.kana.some((k: { common: boolean }) => k.common)
      const bCommon: boolean = b.kana.some((k: { common: boolean }) => k.common)

      if (aCommon && !bCommon) {
        return -1
      } else if (!aCommon && bCommon) {
        return 1
      } else {
        const aGlosses: string[] = a.senses
          .map((s: { glosses: { gloss: string }[] }) =>
            s.glosses.map((g: { gloss: string }) => g.gloss),
          )
          .flat()
        const bGlosses: string[] = b.senses
          .map((s: { glosses: { gloss: string }[] }) =>
            s.glosses.map((g: { gloss: string }) => g.gloss),
          )
          .flat()

        const aGlossMatch: boolean = aGlosses.some((g: string) =>
          g.includes(dictionarySearchValue),
        )
        const bGlossMatch: boolean = bGlosses.some((g: string) =>
          g.includes(dictionarySearchValue),
        )

        if (aGlossMatch && !bGlossMatch) {
          return -1
        } else if (!aGlossMatch && bGlossMatch) {
          return 1
        } else {
          return 0
        }
      }
    })

    return entriesToBeReordered
  }

  async function fetchDictionary(searchTerm: string) {
    fetchDictionaryDebounced(searchTerm)
  }

  function formatKanjiReadings(
    kanjiEntries: [{ common: boolean; text: string }],
  ): string {
    kanjiEntries.sort((a, b) =>
      a.common && !b.common ? -1 : !a.common && b.common ? 1 : 0,
    )
    return kanjiEntries.map((entry) => entry.text).join(', ')
  }

  function formatKanaReadings(
    kanaEntries: [{ common: boolean; text: string }],
  ): string {
    kanaEntries.sort((a, b) =>
      a.common && !b.common ? -1 : !a.common && b.common ? 1 : 0,
    )
    return kanaEntries.map((entry) => entry.text).join(', ')
  }

  function formatSenses(
    glossEntries: [{ common: boolean; glosses: { gloss: string }[] }],
  ): string {
    glossEntries.sort((a, b) =>
      a.common && !b.common ? -1 : !a.common && b.common ? 1 : 0,
    )

    return glossEntries
      .map(
        (entry, index) =>
          `${index + 1}. "${entry.glosses.map((g) => g.gloss).join(', ')}"`,
      )
      .join(' ')
  }

  // onMount open the dicitonary dialog
  onMount(() => {
    const dictionaryDialog = document.getElementById(
      'dictionary',
    ) as HTMLDialogElement
    if (dictionaryDialog) {
      dictionaryDialog.showModal()
    } else {
      console.error('Dictionary dialog element not found')
    }
  })
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
            on:change={() => fetchDictionary(dictionarySearchValue)}
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
      {#each dictionaryEntries as entry}
        <div class="mt-2">
          {#if entry.kanji}
            <h2 class="font-bold text-2xl">
              {formatKanjiReadings(entry.kanji)}
            </h2>
            <p>
              {formatKanaReadings(entry.kana)}
            </p>
          {:else}
            <h2 class="font-bold text-2xl">
              {formatKanaReadings(entry.kana)}
            </h2>
          {/if}
          <p class="text-lg font-semibold">
            {formatSenses(entry.senses)}
          </p>
        </div>
        <div class="divider"></div>
      {/each}
    {/if}
  </div>
</dialog>
