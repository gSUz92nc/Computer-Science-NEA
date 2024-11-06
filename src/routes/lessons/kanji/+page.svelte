<script lang="ts">
  import { onMount } from 'svelte'

  export let data
  let { supabase, session } = data

  let level: number = 5

  interface Entry {
    entry_id: number
    kana: Kana[]
    kanji: Kanji[]
    senses: Sense[]
  }
  
  interface Kana {
    id: number
    tags: any[]
    value: string
    common: Common[]
    no_kanji: boolean
    applies_to_kanji: any[]
  }
  
  interface Kanji {
    id: number
    tags: Common[]
    value: string
    common: any[]
  }
  
  interface Common {
    id: number
    value: string
  }
  
  interface Sense {
    id: number
    info: any[]
    misc: Common[]
    field: any[]
    antonym: any[]
    dialect: any[]
    definition: Definition[]
    lang_source: any[]
    part_of_speech: Common[]
    applies_to_kana: any[]
    cross_reference: any[]
    applies_to_kanji: any[]
  }
  
  interface Definition {
    id: number
    lang: string
    type: null
    value: string
  }

  // Update the level of the user and load the kanji for that level
  function updateLevel(newLevel: number) {
    level = newLevel
    loadForLevel()
  }

  let progress: number = 0

  // Calculate the progress of the user
  function calculateProgress(numOfKanjiSeen: number, totalKanji: number) {
    progress = numOfKanjiSeen == 0 ? 0 : (numOfKanjiSeen / totalKanji) * 100

    if (progress === 100) {
      currentKanji = null
    }
  }

  let showAbout: boolean = false

  function loadShowAbout() {
    const about = localStorage.getItem('showAboutKanji')
    if (about) {
      showAbout = JSON.parse(about)
    } else {
      showAbout = true
      saveShowAbout()
    }
  }

  function saveShowAbout() {
    localStorage.setItem('showAboutKanji', JSON.stringify(showAbout))
  }

  function toggleShowAbout() {
    showAbout = !showAbout
    saveShowAbout()
  }

  let kanjiNotSeen: { id: number; jlpt_level: number }[] = []

  async function loadForLevel() {
    const [
      { data: kanjiData, error: kanjiError },
      { data: lessonData, error: lessonError },
    ] = await Promise.all([
      supabase
        .from('jlpt_kanji')
        .select('*')
        .eq('jlpt_level', level)
        .order('id', { ascending: true }),
      supabase
        .from('jlpt_kanji_lessons')
        .select('*, kanji_id ( jlpt_level, id )')
        .eq('kanji_id.jlpt_level', level)
        .order('id', { ascending: true }),
    ])

    if (kanjiError) {
      alert(`Error loading kanji data: ${kanjiError.message}`)
    } else {
      console.log(kanjiData)
    }

    if (lessonError) {
      alert(`Error loading lesson data: ${lessonError.message}`)
    } else {
      console.log(lessonData)
    }

    if (lessonData && kanjiData) {
      calculateProgress(lessonData.length, kanjiData.length)

      const kanjiSeen = lessonData.map((lesson) => lesson.kanji_id.id)
      kanjiNotSeen = kanjiData.filter((kanji) => !kanjiSeen.includes(kanji.id))

      loadKanji()
    }
  }

  let currentKanji: Entry | null = null

  async function loadKanji() {
    if (kanjiNotSeen.length === 0) {
      return
    }

    const { data, error } = await supabase.rpc('get_entry_by_id', {
      p_entry_id: kanjiNotSeen[0].id,
    })

    if (error) {
      alert(`Error loading kanji: ${error.message}`)
    } else {
      currentKanji = data[0]
      console.log('Current kanji:', currentKanji)
    }
  }

  function loadLevel() {
    const urlParams = new URLSearchParams(window.location.search)
    const urlLevel = urlParams.get('level')
    if (urlLevel) {
      level = parseInt(urlLevel)
    }
  }

  function nextKanji() {
    uploadLesson()
    kanjiNotSeen.shift()
    loadKanji()
  }

  async function uploadLesson() {
    if (currentKanji == null) {
      return
    }

    const { error } = await supabase.from('jlpt_kanji_lessons').insert({
      kanji_id: currentKanji.entry_id,
    })

    if (error) {
      alert(`Error uploading lesson: ${error.message}`)
    } else {
      console.log('Uploaded lesson')
    }
  }

  onMount(() => {
    loadLevel()
    loadForLevel()
    loadShowAbout()
    loadKanji()
  })
</script>

<div class="flex w-full overflow-y-auto sm:h-screen">
  <div class="flex flex-col w-full">
    <div class="flex justify-center">
      <ul class="menu menu-horizontal bg-base-200 mt-2 rounded-xl">
        <li>
          <a
            href="/lessons/kanji?level=5"
            class={level === 5 ? 'active' : ''}
            on:click={() => updateLevel(5)}>N5</a
          >
        </li>
        <li>
          <a
            href="/lessons/kanji?level=4"
            class={level === 4 ? 'active' : ''}
            on:click={() => updateLevel(4)}>N4</a
          >
        </li>
        <li>
          <a
            href="/lessons/kanji?level=3"
            class={level === 3 ? 'active' : ''}
            on:click={() => updateLevel(3)}>N3</a
          >
        </li>
        <li>
          <a
            href="/lessons/kanji?level=2"
            class={level === 2 ? 'active' : ''}
            on:click={() => updateLevel(2)}>N2</a
          >
        </li>
        <li>
          <a
            href="/lessons/kanji?level=1"
            class={level === 1 ? 'active' : ''}
            on:click={() => updateLevel(1)}>N1</a
          >
        </li>
      </ul>
    </div>
    <div class="flex justify-center mt-2">
      <div
        class="tooltip tooltip-bottom"
        data-tip="How many of the kanji you've seen on this level"
      >
        <progress class="progress w-56" value={progress} max="100" />
      </div>
    </div>
    <div class="mt-16 flex justify-center">
      {#if kanjiNotSeen.length === 0 && progress !== 100}
        <div class="card bg-base-100 w-96 shadow-xl">
          <div class="card-body">
            <h2 class="text-2xl font-semibold text-center">Loading...</h2>
            <h2 class="text-xl text-base-content/70 text-center">
              Please wait while we load the kanji for this level.
            </h2>
          </div>
        </div>
        {:else if currentKanji != null}
          <div class="card bg-base-100 w-96 shadow-xl">
            <div class="card-body">
              <h2 class="text-2xl font-semibold text-center">
                {currentKanji.kanji.map((kanji) => kanji.value).join('; ')}
              </h2>
        
              <h2 class="text-xl text-base-content/70 text-center">
                {currentKanji.kana.map((kana) => kana.value).join('; ')}
              </h2>
              <ul class="list-disc space-y-2">
                {#each currentKanji.senses as sense}
                  <li>
                    <p class="font-semibold">
                      {sense.definition.map((def) => def.value).join('; ')}
                    </p>
                    <p class="text-base-content/70">
                      {sense.part_of_speech.map((pos) => pos.value).join('; ')}
                    </p>
                  </li>
                {/each}
              </ul>
              {#if currentKanji.kanji[0]?.tags.length > 0}
                <p class="text-base-content/70 mt-2">
                  Note: {currentKanji.kanji[0].tags.map(t => t.value).join(', ')}
                </p>
              {/if}
              <div class="flex mt-4">
                <button
                  class="btn btn-base-300 flex-grow ml-1"
                  on:click={nextKanji}>Next</button
                >
              </div>
            </div>
          </div>
        {/if}
      </div>
    <div class="flex justify-center mt-4 pb-8">
      <button class="btn btn-base-300" on:click={toggleShowAbout}>
        {showAbout ? 'Hide About' : 'Show About'}
      </button>
    </div>
  </div>
</div>