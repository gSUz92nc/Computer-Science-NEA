<!-- src/components/Dictionary.svelte -->
<script lang="ts">
  import { toKatakana, toHiragana } from 'wanakana'
  import type { SupabaseClient } from '@supabase/supabase-js'
  import { onMount } from 'svelte'
  import pkg from 'lodash'
  const { debounce } = pkg

  export let supabase: SupabaseClient

  type Sense = {
    id: string
    word_id: number
    antonym: JSON
    applies_to_kana: string[] | null
    applies_to_kanji: string[] | null
    dialect: string[]
    field: string[]
    info: string[]
    language_source: JSON | null
    misc: string[]
    part_of_speech: string[] | null
    related: JSON
    glosses: Glosses[]
  }

  // Define the Kanji type
  type Kanji = {
    id: string
    word_id: number
    common: boolean
    tags: string[]
    text: string
  }

  // Define the Kana type
  type Kana = {
    id: string
    word_id: number
    common: boolean
    applies_to_kanji: string[] | null
    tags: string[]
    text: string
  }

  // Define the Glosses type
  type Glosses = {
    id: string
    gloss: string
    type: string | null
  }

  let dictionaryEntries: any[] = []
  let dictionarySearchValue = '開く'
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
        gloss_input: searchTerm.toLowerCase(),
        kanji_input: searchTerm.toLowerCase(),
        hiragana_input: hira,
        katakana_input: kata,
      })

      if (error) {
        console.error('Error fetching dictionary entries', error)
      } else {
        dictionaryEntries = reorderDictionaryEntries(data, searchTerm)
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

  function reorderDictionaryEntries(
    entriesToBeReordered: any[],
    searchTerm: string,
  ) {
    // Sort dictionary by whether their one of their entry.kana[].common = true and then by whether one of their entry.senses.glosses[].text is equal to the search term

    entriesToBeReordered.sort((a, b) => {
      const aCommon: boolean = a.kana.some((k: { common: boolean }) => k.common)
      const bCommon: boolean = b.kana.some((k: { common: boolean }) => k.common)

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
        g.includes(searchTerm),
      )
      const bGlossMatch: boolean = bGlosses.some((g: string) =>
        g.includes(searchTerm),
      )

      // Combine commonality and relevance scores
      const aScore = (aCommon ? 1 : 0) + (aGlossMatch ? 2 : 0)
      const bScore = (bCommon ? 1 : 0) + (bGlossMatch ? 2 : 0)

      return bScore - aScore
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

  function removeDuplicateGlossesFromSenses(sense: Sense[]) {
    const glossMap = new Map<string, boolean>()

    const newSenses = sense.filter((s) => {
      s.glosses = s.glosses.filter((g) => {
        if (glossMap.has(g.gloss)) {
          return false
        } else {
          glossMap.set(g.gloss, true)
          return true
        }
      })
      return s.glosses.length > 0
    })

    return newSenses
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
          {#each removeDuplicateGlossesFromSenses(entry.senses) as sense}
            <li>
              <p class="text-lg font-semibold">
                {sense.glosses.map((g) => g.gloss).join(', ')}
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
  .text-gray-500 {
    color: #6b7280;
  }
</style>
