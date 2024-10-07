// Import the Supabase client
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../../src/lib/database.types'

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

console.log(kanjiArray)

// search the jmdict_kanji table for the first value of eaach row then return create a new 2d array which contains the first value of each row and the result of the search whether the returned data is empty or not
async function processKanjiArray() {
  let index = 0
  let emptyResults = []

  const kanjiArrayWithSearchResults = await Promise.all(
    kanjiArray.map(async (kanji) => {
      console.log(index)
      index++

      const { data } = await supabase
        .from('jmdict_kanji')
        .select('*')
        .eq('text', kanji[0])

      if (data?.length == 1) {
        return
      }

      const { data: kanaData } = await supabase
        .from('jmdict_kana')
        .select('*')
        .eq('text', kanji[0])

      if (kanaData?.length == 1) {
        return
      }

      emptyResults.push(kanji as never)

      return [kanji[0], data]
    }),
  )

  // Save the uploaded ones to a file

  await Bun.write(
    'kanjiArrayWithSearchResults.json',
    JSON.stringify(kanjiArrayWithSearchResults),
  )

  // Save the emptyResults array to a file

  await Bun.write('emptyResults.json', JSON.stringify(emptyResults))

  console.log(kanjiArrayWithSearchResults)
  console.log(emptyResults)
  console.log(emptyResults.length)
}

processKanjiArray()
