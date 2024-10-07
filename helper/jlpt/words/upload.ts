// Import the Supabase client
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../../src/lib/database.types'
import { stringSimilarity } from 'string-similarity-js'

const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''

// Initialize the Supabase client
const supabaseUrl = 'https://yrykfurvxgrvavxgbvbr.supabase.co'
const supabaseKey = SUPABASE_SERVICE_KEY
const supabase = createClient<Database>(supabaseUrl, supabaseKey)

// import N5.csv from the local filesystem
import parse from 'csv-simple-parser'

// read the file
const csv = Bun.file('n5.csv').text()

// save the first value of each row to an array, excluding the first row as it is a header
const kanjiArray = parse(await csv).slice(1)

let emptyResults = []
let kanjiCount = 0

// search the jmdict_kanji table for the first value of eaach row then return create a new 2d array which contains the first value of each row and the result of the search whether the returned data is empty or not
async function processKanjiArray(csvItems: unknown[][] | Record<string, unknown>[], jlpt_level: number) {
  let index = 0

  const kanjiArrayWithSearchResults = await Promise.all(
    csvItems.map(async (kanji) => {
      
      if (kanji[0].includes('～')) {
        kanji[0] = kanji[0].replace(/～/g, '');
      }

      const kanjiElements = kanji[0].split('; ');
      kanjiCount += kanjiElements.length
      
      // Search for each kanji element seperately and check if there is one common word and only one common word
      let commonWordId = null;

      for (const element of kanjiElements) {
        const { data: kanjiData } = await supabase
          .from('jmdict_kanji')
          .select('word_id')
          .eq('text', element);

        const { data: kanaData } = await supabase
          .from('jmdict_kana')
          .select('word_id')
          .eq('text', element);

        const combinedData = [...(kanjiData || []), ...(kanaData || [])];

        const wordIds = combinedData.map((item) => item.word_id);
        const uniqueWordIds = [...new Set(wordIds)];

        if (uniqueWordIds.length === 1) {
          commonWordId = uniqueWordIds[0];
          break;
        }
      }

      if (commonWordId) {
        return [kanji[0], commonWordId];
      }
      
      console.log(index)
      index++

      const { data } = await supabase
        .from('jmdict_kanji')
        .select('*, jmdict_word ( id, jmdict_sense ( jmdict_gloss ( * ) ) )')
        .eq('text', kanji[0])

      if (data == null) return

      if (data?.length == 1) {
        return [kanji[0], data[0].word_id]
      }

      // If there are mutliple results check if there is one and only one with the common flag set to true
      
      const commonData = data.filter((x) => x.common)
      
      if (commonData.length == 1) {
        return [kanji[0], commonData[0].word_id]
      }
      
      let highestText = ''

      // If there are mutliple kanji with the same text, find the one with the highest similarity
      if (data?.length > 1) {
        let highestSimilarity = 0
        let highestSimilarityIndex = 0
        for (let i = 0; i < data.length; i++) {
          const senses = data[i].jmdict_word?.jmdict_sense || []
          for (const sense of senses) {
            for (const gloss of sense.jmdict_gloss) {
              const similarity = stringSimilarity(kanji[2], gloss.text)
              if (similarity > highestSimilarity) {
                highestText = gloss.text
                highestSimilarity = similarity
                highestSimilarityIndex = i
              }
            }
          }
        }

        console.log(kanji[0], highestText)

        return [kanji[0], data[highestSimilarityIndex].word_id]
      }

      // If the data is empty, search for similar kanji

      const { data: kanaData } = await supabase
        .from('jmdict_kana')
        .select('*, jmdict_word ( id, jmdict_sense ( jmdict_gloss ( * ) ) )')
        .eq('text', kanji[0])

      if (kanaData?.length == 1) {
        return [kanji[0], kanaData[0].word_id]
      }
      
      const commonKanaData = kanaData?.filter((x) => x.common)
      
      if (commonKanaData?.length == 1) {
        return [kanji[0], commonKanaData[0].word_id]
      }
      
      if (kanaData?.length > 1) {
        let highestSimilarity = 0
        let highestSimilarityIndex = 0
        let highestText = ''
        for (let i = 0; i < kanaData.length; i++) {
          const senses = kanaData[i].jmdict_word?.jmdict_sense || []
          for (const sense of senses) {
            for (const gloss of sense.jmdict_gloss) {
              const similarity = stringSimilarity(kanji[2], gloss.text)
              if (similarity > highestSimilarity) {
                highestText = gloss.text
                highestSimilarity = similarity
                highestSimilarityIndex = i
              }
            }
          }
        }

        console.log(kanji[0], highestText)

        return [kanji[0], kanaData[highestSimilarityIndex].word_id]
      }
      

      emptyResults.push(kanji as never)
    }),
  )

  // Save the uploaded ones to a file

  await Bun.write(
    'kanjiArrayWithSearchResults.json',
    JSON.stringify(kanjiArrayWithSearchResults.filter((x) => x != null)),
  )
}

await processKanjiArray()

console.log(emptyResults.length)
await Bun.write('emptyResults.json', JSON.stringify(emptyResults))
