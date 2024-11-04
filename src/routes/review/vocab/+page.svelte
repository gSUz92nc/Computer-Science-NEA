<script lang="ts">
  import { onMount, onDestroy } from 'svelte'

  export let data
  let { supabase, session } = data

  // Review delay configuration (in seconds)
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

  let toast: { message: string; type: 'success' | 'error' } | null = null
  let toastTimeout: NodeJS.Timeout

  interface ReviewItem {
    entry_id: number
    knowledge_level: number
    next_review: Date
    last_reviewed: Date
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

  interface Question {
    word: Entry
    options: Entry[]
    correct_index: number
    mode: 'jp_to_en' | 'en_to_jp' // New field to track question mode
  }

  let keyboardListener: (event: KeyboardEvent) => void

  let currentQuestion: Question | null = null
  let dueItems: ReviewItem[] = []

  function showToast(message: string, type: 'success' | 'error') {
    // Clear any existing timeout
    if (toastTimeout) clearTimeout(toastTimeout)

    toast = { message, type }

    // Clear toast after 2 seconds
    toastTimeout = setTimeout(() => {
      toast = null
    }, 2000)
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (!currentQuestion) return

    // Check if the pressed key is 1, 2, 3, or 4
    const number = parseInt(event.key)
    if (number >= 1 && number <= 4) {
      // Convert to 0-based index and handle answer
      handleAnswer(number - 1)
    }
  }

  async function loadDueItems() {
    const now = new Date().toISOString()

    // First, get all vocab items, using correct random() syntax
    const { data: allVocabData, error: vocabError } = await supabase
      .from('jlpt_vocab')
      .select('id')
      .order('id', { ascending: undefined, foreignTable: undefined }) // Remove the order
      .limit(100) // Limit to prevent loading too many at once

    if (vocabError) {
      alert(`Error loading vocabulary: ${vocabError.message}`)
      return
    }

    // Shuffle the array in JavaScript instead
    const shuffledVocab = [...allVocabData].sort(() => Math.random() - 0.5)

    // Then, get all review items for the user
    const { data: reviewData, error: reviewError } = await supabase
      .from('vocab_reviews')
      .select('*')
      .eq('user_id', session?.user.id)
      .lte('next_review', now)

    if (reviewError) {
      alert(`Error loading reviews: ${reviewError.message}`)
      return
    }

    // Create a map of existing reviews
    const reviewMap = new Map(
      reviewData?.map((review) => [review.entry_id, review]) || [],
    )

    // Combine both sources using the shuffled vocab
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

  async function handleAnswer(selectedIndex: number) {
      if (!currentQuestion || !dueItems[0]) return;
  
      const isCorrect = selectedIndex === currentQuestion.correct_index;
      const item = dueItems[0];
  
      // Update knowledge level and next review date
      const newLevel = isCorrect ? Math.min(item.knowledge_level + 1, 9) : 0;
      const nextReview = new Date();
      
      // Add the configured delay in seconds
      nextReview.setSeconds(nextReview.getSeconds() + REVIEW_DELAYS[newLevel]);
  
      // Show feedback toast
      if (isCorrect) {
        showToast('Correct! 🎉', 'success');
      } else {
        const correctAnswer = currentQuestion.options[currentQuestion.correct_index];
        const correctText = getOptionText(correctAnswer, currentQuestion.mode);
        showToast(`Incorrect. The answer was: ${correctText}`, 'error');
      }
  
      // Update the review item in the database
      const { error } = await supabase
        .from('vocab_reviews')
        .upsert({
          entry_id: item.entry_id,
          user_id: session.user.id,
          knowledge_level: newLevel,
          next_review: nextReview.toISOString(),
          last_reviewed: new Date().toISOString(),
        }, {
          onConflict: 'entry_id,user_id'
        });
  
      if (error) {
        alert(`Error updating review: ${error.message}`);
        return;
      }
  
      // Wait a moment to show the feedback before moving to next question
      setTimeout(() => {
        dueItems.shift();
        createQuestion();
      }, isCorrect ? 1000 : 2000); // Give more time to read the correct answer when wrong
    }

  async function createQuestion() {
    if (dueItems.length === 0) return

    // Get the current word
    const { data: wordData } = await supabase.rpc('get_entry_by_id', {
      p_entry_id: dueItems[0].entry_id,
    })

    if (!wordData) return

    // Get the JLPT level for the current word
    const { data: levelData } = await supabase
      .from('jlpt_vocab')
      .select('jlpt_level')
      .eq('id', dueItems[0].entry_id)
      .single()

    if (!levelData) return

    // Get 3 random wrong answers from the same JLPT level
    const { data: optionsData } = await supabase.rpc('get_random_jlpt_vocab', {
      p_jlpt_level: levelData.jlpt_level,
      p_entry_id: dueItems[0].entry_id,
    })

    if (!optionsData) return

    // Get the full entries for the options
    const optionEntries = await Promise.all(
      optionsData.map(async (option) => {
        const { data } = await supabase.rpc('get_entry_by_id', {
          p_entry_id: option.id,
        })
        return data[0]
      }),
    )

    // Randomly insert the correct answer
    const correct_index = Math.floor(Math.random() * 4)
    optionEntries.splice(correct_index, 0, wordData[0])

    // Randomly choose question mode
    const mode = Math.random() < 0.5 ? 'jp_to_en' : 'en_to_jp'

    currentQuestion = {
      word: wordData[0],
      options: optionEntries,
      correct_index,
      mode,
    }
  }

  // Helper function to get the display text for an option based on the current mode
  function getOptionText(option: Entry, mode: 'jp_to_en' | 'en_to_jp'): string {
    if (mode === 'jp_to_en') {
      return option.senses[0].definition[0].value
    } else {
      return option.kanji[0]?.value || option.kana[0].value
    }
  }

  // Helper function to get the question text based on the current mode
  function getQuestionText(word: Entry, mode: 'jp_to_en' | 'en_to_jp'): string {
    if (mode === 'jp_to_en') {
      return word.kanji[0]?.value || word.kana[0].value
    } else {
      return word.senses[0].definition[0].value
    }
  }

  onMount(() => {
    loadDueItems()
    // Set up keyboard listener
    keyboardListener = handleKeyPress
    window.addEventListener('keypress', keyboardListener)
  })

  onDestroy(() => {
      if (toastTimeout) clearTimeout(toastTimeout);
      if (keyboardListener) {
        window.removeEventListener('keypress', keyboardListener);
      }
    });
</script>

<div class="flex flex-col items-center p-4">
  {#if currentQuestion}
    <div class="card w-96 bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="text-2xl font-bold text-center mb-4">
          {getQuestionText(currentQuestion.word, currentQuestion.mode)}
        </h2>
        <div class="grid grid-cols-1 gap-4">
          {#each currentQuestion.options as option, index}
            <button
              class="btn"
              on:click={() => handleAnswer(index)}
            >
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
  {#if toast}
    <div class="toast">
      <div class="alert {toast.type === 'success' ? 'alert-success' : 'alert-error'}">
        <span>{toast.message}</span>
      </div>
    </div>
  {/if}
</div>
