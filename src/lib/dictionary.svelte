<!-- src/components/Dictionary.svelte -->
<script lang="ts">
  import { toKana } from 'wanakana'
  import type { SupabaseClient } from '@supabase/supabase-js'
  import type { Entry } from '$lib/types'
  import { onMount } from 'svelte'
  export let supabase: SupabaseClient

  let dictionaryEntries: any[] = []
  let dictionarySearchValue = 'hello'
  let searching = false

  $: fetchDictionaryDebounced(dictionarySearchValue)

  let currentSearchId = 0

  let lastRequestTimestamp = 0
  let pendingRequest: AbortController | null = null

  async function fetchDictionaryDebounced(searchTerm: string) {
    const searchId = ++currentSearchId

    if (searchTerm.length < 1) {
      dictionaryEntries = []
      searching = false
      return
    }

    const timestamp = Date.now()
    lastRequestTimestamp = timestamp

    if (pendingRequest) {
      pendingRequest.abort()
    }

    // remove any trailing spaces from the search term
    searchTerm = searchTerm.trim()

    searching = true

    pendingRequest = new AbortController()

    console.log({
      p_kana: toKana(searchTerm),
      p_kanji: searchTerm,
      p_definition: searchTerm.toLowerCase(),
    })

    const { data: dictionaryData, error: dictionaryError } = await supabase.rpc(
      'search_entries',
      {
        p_kana: toKana(searchTerm),
        p_kanji: toKana(searchTerm),
        p_definition: searchTerm.toLowerCase(),
      },
    )

    if (dictionaryError) {
      console.error(dictionaryError)
      return
    }

    if (searchId !== currentSearchId) {
      return
    }

    searching = false

    dictionaryEntries = reorderEntriesByFrequency(dictionaryData)
  }

  function reorderEntriesByFrequency(entries: Entry[]) {
    // The kanji key has a kana_common array that contains how common the kanji is. The kana key has a kana_common array that contains how common the kana is.
    // We can use this to sort the entries by frequency.

    //The order of the commonness is as follows:

    /*
    news1/2: appears in the "wordfreq" file compiled by Alexandre Girardi from the Mainichi Shimbun. (See the ftp archive for a copy.) Words in the first 12,000 in that file are marked "news1" and words in the second 12,000 are marked "news2".
    ichi1/2: appears in the "Ichimango goi bunruishuu", Senmon Kyouiku Publishing, Tokyo, 1998. (The entries marked "ichi2" were demoted from ichi1 because they were observed to have low frequencies in the WWW and newspapers.)
    spec1 and spec2: a small number of words use this marker when they are detected as being common, but are not included in other lists.
    gai1/2: common loanwords, also based on the wordfreq file.
    nfxx: this is an indicator of frequency-of-use ranking in the wordfreq file. "xx" is the number of the set of 500 words in which the entry can be found, with "01" assigned to the first 500, "02" to the second, and so on. Entries with news1, ichi1, spec1/2 and gai1 values are marked with a "(P)" in the EDICT and EDICT2 files.While the priority markings accurately reflect the status of entries with regard to the various sources, they must be seen as only providing a crude indication of how common a word or expression actually is in Japanese. The "(P)" markings in the EDICT and EDICT2 files appear to identify a useful subset of "common" words, but there are clearly some marked entries which are not very common, and there are clearly unmarked entries which are in common use, particularly in the spoken language.
    */

    const priorityOrder = {
      news1: 1,
      news2: 3,
      ichi1: 2,
      ichi2: 4,
      spec1: 5,
      spec2: 6,
      gai1: 7,
      gai2: 8,
    }

    function getPriority(entry: Entry) {
      for (const kanji of entry.kanji) {
        if (kanji.kanji_common) {
          for (const common of kanji.kanji_common) {
            if (priorityOrder[common as keyof typeof priorityOrder]) {
              return priorityOrder[common as keyof typeof priorityOrder]
            }
          }
        }
      }
      for (const kana of entry.kana) {
        if (kana.kana_common) {
          for (const common of kana.kana_common) {
            if (priorityOrder[common as keyof typeof priorityOrder]) {
              return priorityOrder[common as keyof typeof priorityOrder]
            }
          }
        }
      }
      return Infinity
    }
    entries.sort((a, b) => getPriority(a) - getPriority(b));

    // Check if there is a definition that perfectly matches the search term
    const exactMatch = entries.find(entry => 
      entry.senses.some(sense => sense.definition.some(def => def.value.toLowerCase() === dictionarySearchValue.toLowerCase()))
    );

    if (exactMatch) {
      // Move the exact match to the top
      entries = entries.filter(entry => entry !== exactMatch);
      entries.unshift(exactMatch);
    }

    console.log(entries)

    return entries
  }

  function formatDefinitions(definition: { value: string }[]) {
    return definition.map((def) => def.value).join('; ')
  }

  function formatKanji(kanji: { value: string }[]) {
    return kanji.map((k) => k.value).join(', ')
  }

  onMount(() => {
    fetchDictionaryDebounced('hello')
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
            bind:value={dictionarySearchValue}
          />
        </div>
      </div>
      <button class="btn rounded-l-none rounded-r-md mr-2">Search</button>
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
      {#if dictionarySearchValue.length > 1}
        <div class="mt-2">
          <h2 class="font-bold text-2xl">No results found</h2>
          <p class="text-lg font-semibold">Try searching for something else</p>
        </div>
      {/if}
    {:else}
      <div class="mt-2">
        <h2 class="font-semibold text-md">
          Entries found: {dictionaryEntries.length}
        </h2>
      </div>
      {#each dictionaryEntries as entry}
        <div
          class="entry-card bg-base-100 rounded-lg shadow-md mb-4 overflow-hidden"
        >
          <div class="entry-header border-b border-base-300 bg-base-200 py-3">
            <h2 class="entry-title">
              <span class="kanji text-3xl font-bold ml-4">
                {#if entry.kanji.length > 0}
                  {entry.kanji[0].value}
                  {#if entry.kanji.length > 1}
                    <span class="text-xl"
                      >{formatKanji(entry.kanji.slice(1))}</span
                    >
                  {/if}
                {:else}
                  {formatKanji(entry.kana)}
                {/if}
              </span>
            </h2>
            <span class="kana ml-4 text-xl text-base-content/70">
              {formatKanji(entry.kana)}
            </span>
          </div>
          <div class="entry-content p-4">
            {#each entry.senses as sense, index (sense.id)}
              <div class="sense mb-3">
                <div
                  class="sense-header flex items-center flex-wrap gap-2 mb-1"
                >
                  <span class="sense-number font-semibold">{index + 1}.</span>
                  {#each sense.part_of_speech as pos}
                    <span class="badge badge-primary">{pos.value}</span>
                  {/each}
                  {#each sense.misc as misc}
                    <span class="badge badge-secondary">{misc.value}</span>
                  {/each}
                </div>
                <ul class="definition-list pl-6 list-disc">
                  <li>{formatDefinitions(sense.definition)}</li>
                </ul>
              </div>
              {#if sense.field.length > 0}
                <div class="sense-field mb-2">
                  <span class="font-semibold">Field:</span>
                  {#each sense.field as field}
                    <span class="badge badge-info ml-2">{field.value}</span>
                  {/each}
                </div>
              {/if}
              {#if sense.antonym.length > 0}
                <div class="sense-antonym mb-2">
                  <span class="font-semibold">Antonym:</span>
                  {#each sense.antonym as antonym}
                    <span class="badge badge-info ml-2">{antonym.value}</span>
                  {/each}
                </div>
              {/if}
              {#if sense.dialect.length > 0}
                <div class="sense-dialect mb-2">
                  <span class="font-semibold">Dialect:</span>
                  {#each sense.dialect as dialect}
                    <span class="badge badge-info ml-2">{dialect.value}</span>
                  {/each}
                </div>
              {/if}
              {#if sense.lang_source.length > 0}
                <div class="sense-lang-source mb-2">
                  <span class="font-semibold">Language Source:</span>
                  {#each sense.lang_source as lang_source}
                    <span class="badge badge-info ml-2"
                      >{lang_source.value}</span
                    >
                  {/each}
                </div>
              {/if}
              {#if sense.cross_reference.length > 0}
                <div class="sense-cross-reference mb-2">
                  <span class="font-semibold">Also see:</span>
                  {#each sense.cross_reference as cross_reference}
                    <span class="badge badge-info ml-2"
                      >{cross_reference.value}</span
                    >
                  {/each}
                </div>
              {/if}
              <div class="divider"></div>
            {/each}
          </div>
        </div>
      {/each}
    {/if}
  </div>
</dialog>
