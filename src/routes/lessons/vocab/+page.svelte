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
    tags: Common[]
    value: string
    common: Common[]
    no_kanji: boolean
    applies_to_kanji: any[]
  }

  interface Common {
    id: number
    value: string
  }

  interface Kanji {
    id: number
    tags: Common[]
    value: string
    common: any[]
  }

  interface Sense {
    id: number
    info: Common[]
    misc: Common[]
    field: any[]
    antonym: any[]
    dialect: any[]
    definition: Definition[]
    lang_source: any[]
    part_of_speech: Common[]
    applies_to_kana: Common[]
    cross_reference: Common[]
    applies_to_kanji: any[]
  }

  interface Definition {
    id: number
    lang: Lang
    type: null
    value: string
  }

  enum Lang {
    Eng = 'eng',
  }

  // Update the level of the user and load the words for that level
  function updateLevel(newLevel: number) {
    level = newLevel
    loadForLevel()
  }

  let progress: number = 0

  // Calculate the progress of the user, by taking the number of words they've seen and dividing it by the total number of words
  function calculateProgress(numOfWordsSeen: number, totalWords: number) {
    progress = numOfWordsSeen == 0 ? 0 : (numOfWordsSeen / totalWords) * 100

    if (progress === 100) {
      currentWord = null
    }
  }

  let showAbout: boolean = false

  // Loads whether the about section should be shown or not from local storage
  function loadShowAbout() {
    const about = localStorage.getItem('showAbout')
    if (about) {
      showAbout = JSON.parse(about)
    } else {
      showAbout = true
      saveShowAbout()
    }
  }

  // Saves whether the about section should be shown or not to local storage
  function saveShowAbout() {
    localStorage.setItem('showAbout', JSON.stringify(showAbout))
  }

  // Toggles whether the about section should be shown or not
  function toggleShowAbout() {
    showAbout = !showAbout
    saveShowAbout()
  }

  let wordsNotSeen: { id: number; jlpt_level: number }[] = []

  // Load the words for the level from the database and filter out the words that the user has already seen
  async function loadForLevel() {
    // Get all the words for the level
    const [
      { data: vocabData, error: vocabError },
      { data: lessonData, error: lessonError },
    ] = await Promise.all([
      supabase
        .from('jlpt_vocab')
        .select('*')
        .eq('jlpt_level', level)
        .order('id', { ascending: true }),
      supabase
        .from('jlpt_vocab_lessons')
        .select('*, vocab_id ( jlpt_level, id )')
        .eq('vocab_id.jlpt_level', level)
        .order('id', { ascending: true }),
    ])

    if (vocabError) {
      alert(`Error loading vocabulary data: ${vocabError.message}`)
    } else {
      console.log(vocabData)
    }

    if (lessonError) {
      alert(`Error loading lesson data: ${lessonError.message}`)
    } else {
      console.log(lessonData)
    }

    if (lessonData && vocabData) {
      calculateProgress(lessonData.length, vocabData.length)

      // Filter out the words that the user has already seen
      console.log('Lesson Data', lessonData)
      const wordsSeen = lessonData.map((lesson) => lesson.vocab_id.id)
      console.log('Words seen:', wordsSeen)
      console.log('Vocab Data:', vocabData)
      wordsNotSeen = vocabData.filter((word) => !wordsSeen.includes(word.id))

      loadWord()
    }
  }

  let currentWord: Entry | null = null

  // Load the current word that the user is learning
  async function loadWord() {
    if (wordsNotSeen.length === 0) {
      return
    }

    const { data, error } = await supabase.rpc('get_entry_by_id', {
      p_entry_id: wordsNotSeen[0].id,
    })

    if (error) {
      alert(`Error loading word: ${error.message}`)
    } else {
      currentWord = data[0]
      console.log('Current word:', currentWord)
    }
  }

  // Check the url params to see if a level has been specified
  function loadLevel() {
    const urlParams = new URLSearchParams(window.location.search)
    const urlLevel = urlParams.get('level')
    if (urlLevel) {
      level = parseInt(urlLevel)
    }
  }

  function nextWord() {
    uploadLesson()
    console.log("Before", wordsNotSeen)
    wordsNotSeen.shift()
    console.log("After", wordsNotSeen)
    loadWord()
  }

  async function uploadLesson() {
    if (currentWord == null) {
      return
    }

    console.log({
      vocab_id: currentWord.entry_id,
    })

    const { error } = await supabase.from('jlpt_vocab_lessons').insert({
      vocab_id: currentWord.entry_id,
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
    loadWord()
  })
</script>

<div class="flex w-full">
  <div class="flex flex-col w-full">
    <div class="flex justify-center">
      <ul class="menu menu-horizontal bg-base-200 mt-2 rounded-xl">
        <li>
          <a
            href="/lessons/vocab?level=5"
            class={level === 5 ? 'active' : ''}
            on:click={() => updateLevel(5)}>N5</a
          >
        </li>
        <li>
          <a
            href="/lessons/vocab?level=4"
            class={level === 4 ? 'active' : ''}
            on:click={() => updateLevel(4)}>N4</a
          >
        </li>
        <li>
          <a
            href="/lessons/vocab?level=3"
            class={level === 3 ? 'active' : ''}
            on:click={() => updateLevel(3)}>N3</a
          >
        </li>
        <li>
          <a
            href="/lessons/vocab?level=2"
            class={level === 2 ? 'active' : ''}
            on:click={() => updateLevel(2)}>N2</a
          >
        </li>
        <li>
          <a
            href="/lessons/vocab?level=1"
            class={level === 1 ? 'active' : ''}
            on:click={() => updateLevel(1)}>N1</a
          >
        </li>
      </ul>
    </div>
    <div class="flex justify-center mt-2">
      <div
        class="tooltip tooltip-bottom"
        data-tip="How many of the words you've seen on this level"
      >
        <progress class="progress w-56" value={progress} max="100" />
      </div>
    </div>
    <div class="mt-16 flex justify-center">
      {#if wordsNotSeen.length === 0 && progress !== 100}
        <div class="card bg-base-100 w-96 shadow-xl">
          <div class="card-body">
            <h2 class="text-2xl font-semibold text-center">Loading...</h2>
            <h2 class="text-xl text-base-content/70 text-center">
              Please wait while we load the words for this level.
            </h2>
          </div>
        </div>
      {:else if currentWord != null}
        <div class="card bg-base-100 w-96 shadow-xl">
          <div class="card-body">
            <h2 class="text-2xl font-semibold text-center">
              {currentWord.kanji.map((kanji) => kanji.value).join('; ')}
            </h2>

            <h2 class="text-xl text-base-content/70 text-center">
              {currentWord.kana.map((kana) => kana.value).join('; ')}
            </h2>
            <ul class="list-disc space-y-2">
              {#each currentWord.senses as sense}
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
            <div class="flex mt-4">
              <button
                class="btn btn-base-300 flex-grow ml-1"
                on:click={nextWord}>Next</button
              >
            </div>
          </div>
        </div>
      {:else}
        <div class="card bg-base-100 w-96 shadow-xl">
          <div class="card-body">
            <h2 class="text-2xl font-semibold text-center">Congratulations!</h2>
            <h2 class="text-xl text-base-content/70 text-center">
              You've completed all the words for this level, you can chose to
              review these using the button below or cover a different level to
              learn above.
            </h2>
            <div class="flex-row flex mt-4">
              <button class="btn btn-base-300 flex-grow">Review</button>
            </div>
          </div>
        </div>
      {/if}
    </div>

    {#if showAbout}
      <div class="flex justify-center">
        <div class="max-w-[50rem]">
          <h1 class="text-center mt-16 font-semibold text-2xl">About</h1>
          <p class="text-center">
            This page is purely for introducing new vocabulary to you. You can
            review the words after being introduced to them in the review
            section.
          </p>
        </div>
      </div>
    {/if}
    <div class="flex justify-center mt-4">
      <button class="btn btn-base-300" on:click={toggleShowAbout}>
        {showAbout ? 'Hide About' : 'Show About'}
      </button>
    </div>
  </div>
</div>
