<!-- src/components/Dictionary.svelte -->
<script lang="ts">
    import { browser } from "$app/environment";
    import { toKatakana, toHiragana, isJapanese } from "wanakana";
    import { onMount } from "svelte";
    import { supabase } from "./supabaseClientAnon";

    let dictionaryEntries: any[] = [];
    let dictionarySearchValue = "nuclear deterrent force";
    let searching = false;
    const dictionaryModal = browser
        ? (document?.getElementById("dictionary") as HTMLDialogElement)
        : null;

    $: fetchDictionary(dictionarySearchValue);

    async function fetchDictionary(searchTerm: string) {
        if (searchTerm === "") {
            dictionaryEntries = [];
            return;
        }

        const kata = toKatakana(searchTerm);
        const hira = toHiragana(searchTerm);
        let english: boolean = isJapanese(searchTerm);
        searching = true;

        const { data, error } = await supabase.rpc("get_jmdict_entries", {
            gloss_input: searchTerm,
            kanji_input: searchTerm,
            hiragana_input: hira,
            katakana_input: kata,
        });

        if (error) {
            console.error("Error fetching dictionary entries", error);
        } else {
            dictionaryEntries = data;
        }
        searching = false;
    }

    function formatKanjiReadings(kanjiEntries: [{ common: boolean, text: string }]): string {
        kanjiEntries.sort((a, b) => (a.common && !b.common ? -1 : !a.common && b.common ? 1 : 0));
        return kanjiEntries.map((entry) => entry.text).join(", ");
    }

    function formatKanaReadings(kanaEntries: [{ common: boolean, text: string }]): string {
        kanaEntries.sort((a, b) => (a.common && !b.common ? -1 : !a.common && b.common ? 1 : 0));
        return kanaEntries.map((entry) => entry.text).join(", ");
    }

    function formatSenses(glossEntries: [{ common: boolean, text: string }]): string {
        glossEntries.sort((a, b) => (a.common && !b.common ? -1 : !a.common && b.common ? 1 : 0));
        return glossEntries.map((entry, index) => `${index + 1}. "${entry.text}"`).join(" ");
    }

    onMount(() => {
        dictionaryModal?.showModal();
    });
</script>

<dialog id="dictionary" class="modal modal-bottom lg:modal-middle w-full">
    <div class="modal-box min-h-[80vh] lg:min-h-[60vh]">
        <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                </svg>
            </button>
        </form>
        <div class="join w-full">
            <select class="select select-bordered join-item">
                <option selected>All</option>
                <option>Kanji</option>
                <option>Words</option>
            </select>
            <div class="w-full">
                <div class="w-full">
                    <input class="input input-bordered join-item w-full" placeholder="Search" on:change={() => fetchDictionary(dictionarySearchValue)} bind:value={dictionarySearchValue} />
                </div>
            </div>
            <button class="btn join-item" on:click={() => fetchDictionary(dictionarySearchValue)}>Search</button>
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
                        <h2 class="font-bold text-2xl">{formatKanjiReadings(entry.kanji)}</h2>
                        <p>{formatKanaReadings(entry.kana)}</p>
                    {:else}
                        <h2 class="font-bold text-2xl">{formatKanaReadings(entry.kana)}</h2>
                    {/if}
                    <p class="text-lg font-semibold">{formatSenses(entry.senses)}</p>
                </div>
                <div class="divider"></div>
            {/each}
        {/if}
    </div>
</dialog>