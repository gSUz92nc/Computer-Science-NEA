<script lang="ts">
  import { onMount, onDestroy } from 'svelte'

  export let data
  let { supabase, session } = data

  // Interfaces
  interface Common {
    id: number
    value: string
  }

  interface Definition {
    id: number
    lang: Lang
    type: null
    value: string
  }

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

  interface Kanji {
    id: number
    tags: Common[]
    value: string
    common: any[]
  }

  interface Question {
    word: Entry
    options: Entry[]
    correct_index: number
    mode: 'jp_to_en' | 'en_to_jp'
  }

  interface ReviewItem {
    entry_id: number
    knowledge_level: number
    next_review: Date
    last_reviewed: Date
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

  enum Lang {
    Eng = 'eng',
  }

  // Constants
  const REVIEW_DELAYS = {
    0: 0, // Immediately on failure
    1: 240, // 4 minutes
    2: 600, // 10 minutes
    3: 3600, // 1 hour
    4: 14400, // 4 hours
    5: 86400, // 1 day
    6: 259200, // 3 days
    7: 604800, // 1 week
    8: 2592000, // 1 month
    9: 7776000, // 3 months
  }

  // State variables
  let level: number = 5
  let currentQuestion: Question | null = null
  let dueItems: ReviewItem[] = []
  let toast: { message: string; type: 'success' | 'error' } | null = null
  let toastTimeout: NodeJS.Timeout
  let keyboardListener: (event: KeyboardEvent) => void

  // Helper functions
  function getOptionText(option: Entry, mode: 'jp_to_en' | 'en_to_jp'): string {
    if (mode === 'jp_to_en') {
      return option.senses[0].definition[0].value
    } else {
      return option.kanji[0]?.value || option.kana[0].value
    }
  }

  function getQuestionText(word: Entry, mode: 'jp_to_en' | 'en_to_jp'): string {
    if (mode === 'jp_to_en') {
      return word.kanji[0]?.value || word.kana[0].value
    } else {
      return word.senses[0].definition[0].value
    }
  }

  function showToast(message: string, type: 'success' | 'error') {
    if (toastTimeout) clearTimeout(toastTimeout)
    toast = { message, type }
    toastTimeout = setTimeout(() => {
      toast = null
    }, 2000) as unknown as NodeJS.Timeout
  }

  // Level management
  function loadLevel() {
    const urlParams = new URLSearchParams(window.location.search)
    const urlLevel = urlParams.get('level')
    if (urlLevel) {
      let parsedLevel = parseInt(urlLevel)
      if (isNaN(parsedLevel)) {
        level = 5
      } else {
        level = Math.min(Math.max(1, parsedLevel), 5)
      }
    }
    level = 5;
  }

  function updateLevel(newLevel: number) {
    level = newLevel
    loadDueItems()
  }

  // Core review functions
  async function loadDueItems() {
    const now = new Date().toISOString()

    const [
      { data: allVocabData, error: vocabError },
      { data: reviewData, error: reviewError }
    ] = await Promise.all([
      supabase
        .from('jlpt_vocab')
        .select('id')
        .eq('jlpt_level', level),
      supabase
        .from('vocab_reviews')
        .select('*')
        .eq('user_id', session?.user.id)
        .lte('next_review', now)
    ])

    if (vocabError) {
      alert(`Error loading vocabulary: ${vocabError.message}`)
      return
    }

    if (reviewError) {
      alert(`Error loading reviews: ${reviewError.message}`) 
      return
    }

    const shuffledVocab = [...allVocabData].sort(() => Math.random() - 0.5)

    const reviewMap = new Map(
      reviewData?.map((review) => [review.entry_id, review]) || [],
    )

    dueItems = shuffledVocab
      .filter((vocab) => !reviewMap.has(vocab.id) || reviewMap.get(vocab.id))
      .map((vocab) => ({
        entry_id: vocab.id,
        knowledge_level: reviewMap.get(vocab.id)?.knowledge_level || 0,
        next_review: reviewMap.get(vocab.id)?.next_review || now,
        last_reviewed: reviewMap.get(vocab.id)?.last_reviewed || now,
      }))

    if (dueItems.length > 0) {
      createQuestion()
    }
  }

  async function createQuestion() {
    if (dueItems.length === 0) return

    const { data: wordData } = await supabase.rpc('get_entry_by_id', {
      p_entry_id: dueItems[0].entry_id,
    })

    if (!wordData) return

    const { data: optionsData } = await supabase.rpc('get_random_jlpt_vocab', {
      p_jlpt_level: level,
      p_entry_id: dueItems[0].entry_id,
    })

    if (!optionsData) return

    const optionEntries = await Promise.all(
      optionsData.map(async (option: { id: number }) => {
        const { data } = await supabase.rpc('get_entry_by_id', {
          p_entry_id: option.id,
        })
        return data[0]
      }),
    )

    const correct_index = Math.floor(Math.random() * 4)
    optionEntries.splice(correct_index, 0, wordData[0])

    const mode = Math.random() < 0.5 ? 'jp_to_en' : 'en_to_jp'

    currentQuestion = {
      word: wordData[0],
      options: optionEntries,
      correct_index,
      mode,
    }
  }

  // Input handling
  function handleKeyPress(event: KeyboardEvent) {
    if (!currentQuestion) return

    const number = parseInt(event.key)
    if (number >= 1 && number <= 4) {
      handleAnswer(number - 1)
    }
  }

  async function handleAnswer(selectedIndex: number) {
    if (!currentQuestion || !dueItems[0]) return

    const isCorrect = selectedIndex === currentQuestion.correct_index
    const item = dueItems[0]

    const newLevel = isCorrect ? Math.min(item.knowledge_level + 1, 9) : 0
    const nextReview = new Date()

    nextReview.setSeconds(
      nextReview.getSeconds() +
        REVIEW_DELAYS[newLevel as keyof typeof REVIEW_DELAYS],
    )

    if (isCorrect) {
      showToast('Correct! 🎉', 'success')
    } else {
      const correctAnswer =
        currentQuestion.options[currentQuestion.correct_index]
      const correctText = getOptionText(correctAnswer, currentQuestion.mode)
      showToast(`Incorrect. The answer was: ${correctText}`, 'error')
    }

    const { error } = await supabase.from('vocab_reviews').upsert(
      {
        entry_id: item.entry_id,
        user_id: session?.user.id,
        knowledge_level: newLevel,
        next_review: nextReview.toISOString(),
        last_reviewed: new Date().toISOString(),
      },
      {
        onConflict: 'entry_id,user_id',
      },
    )

    if (error) {
      alert(`Error updating review: ${error.message}`)
      return
    }

    setTimeout(
      () => {
        dueItems.shift()
        createQuestion()
      },
      isCorrect ? 1000 : 2000,
    )
  }

  // Lifecycle hooks
  onMount(() => {
    loadLevel()
    loadDueItems()
    keyboardListener = handleKeyPress
    window.addEventListener('keypress', keyboardListener)
  })

  onDestroy(() => {
    if (toastTimeout) clearTimeout(toastTimeout)
    if (keyboardListener) {
      window.removeEventListener('keypress', keyboardListener)
    }
  })
</script>

{#if toast}
  <div class="w-screen h-screen absolute top-0 right-0">
    <div class="toast fixed top-4 right-4 transform z-50">
      <div
        class="alert {toast.type === 'success'
          ? 'alert-success'
          : 'alert-error'}"
      >
        <span>{toast.message}</span>
      </div>
    </div>
  </div>
{/if}
<div class="flex flex-col items-center p-4">
    <div class="flex justify-center">
      <ul class="menu menu-horizontal bg-base-200 mt-2 rounded-xl">
        <li>
          <a
            href="/review/vocab?level=5"
            class={level === 5 ? 'active' : ''}
            on:click={() => updateLevel(5)}>N5</a
          >
        </li>
        <li>
          <a
            href="/review/vocab?level=4"
            class={level === 4 ? 'active' : ''}
            on:click={() => updateLevel(4)}>N4</a
          >
        </li>
        <li>
          <a
            href="/review/vocab?level=3"
            class={level === 3 ? 'active' : ''}
            on:click={() => updateLevel(3)}>N3</a
          >
        </li>
        <li>
          <a
            href="/review/vocab?level=2"
            class={level === 2 ? 'active' : ''}
            on:click={() => updateLevel(2)}>N2</a
          >
        </li>
        <li>
          <a
            href="/review/vocab?level=1"
            class={level === 1 ? 'active' : ''}
            on:click={() => updateLevel(1)}>N1</a
          >
        </li>
      </ul>
    </div>
  {#if currentQuestion}
    <div class="card w-96 bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="text-2xl font-bold text-center mb-4">
          {getQuestionText(currentQuestion.word, currentQuestion.mode)}
        </h2>
        <div class="grid grid-cols-1 gap-4">
          {#each currentQuestion.options as option, index}
            <button class="btn" on:click={() => handleAnswer(index)}>
              {getOptionText(option, currentQuestion.mode)}
            </button>
          {/each}
        </div>
      </div>
    </div>
  {:else if dueItems.length === 0}
    <div class="card w-96 bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="text-xl font-semibold text-center">
          No items due for review!
        </h2>
      </div>
    </div>
  {:else}
    <div class="card w-96 bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="text-xl font-semibold text-center">Loading...</h2>
      </div>
    </div>
  {/if}
</div>