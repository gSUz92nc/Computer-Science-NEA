// Import the Supabase client
import type { Database } from '../../src/lib/database.types'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''

// Initialize the Supabase client
const supabaseUrl = 'https://yrykfurvxgrvavxgbvbr.supabase.co'
const supabaseKey = SUPABASE_SERVICE_KEY
const supabase = createClient<Database>(supabaseUrl, supabaseKey)

const benchmark = async () => {
  const results: number[] = []
  const iterations = 10

  for (let i = 0; i < iterations; i++) {
    const start = performance.now()

    const { data, error } = await supabase.rpc("search_entries", {
      p_kana: "",
      p_kanji: "日本語",
      p_definition: ""
    })
      

    const end = performance.now()
    results.push(end - start)

    // Save to file
    Bun.write('outputJSON.json', JSON.stringify(data?[0] : 0, null, 2) || [])

    console.log(JSON.stringify(data, null, 2))
    console.log(JSON.stringify(error, null, 2))
  }

  const mean = results.reduce((a, b) => a + b, 0) / results.length
  const median = results.sort((a, b) => a - b)[Math.floor(results.length / 2)]

  console.log(`Mean time: ${mean} ms`)
  console.log(`Median time: ${median} ms`)
}

benchmark()




export interface Entry {
  id: number
  kana: Kana[]
  kanji: Kanji[]
  sense: Sense[]
}

export interface Kana {
  id: number
  value: string
  entry_id: number
  no_kanji: number
  kana_tags: any[]
  kana_common: any[]
  kana_applies_to_kanji: any[]
}

export interface Kanji {
  id: number
  value: string
  entry_id: number
  kanji_tags: any[]
  kanji_common: any[]
}

export interface Sense {
  id: number
  misc: Misc[]
  field: any[]
  antonym: any[]
  dialect: any[]
  entry_id: number
  definition: Definition[]
  sense_info: any[]
  lang_source: any[]
  part_of_speech: PartOfSpeech[]
  cross_reference: CrossReference[]
  sense_applies_to_kana: any[]
  sense_applies_to_kanji: any[]
}

export interface Misc {
  id: number
  value: string
  sense_id: number
}

export interface Definition {
  id: number
  lang: string
  type: any
  value: string
  sense_id: number
}

export interface PartOfSpeech {
  id: number
  value: string
  sense_id: number
}

export interface CrossReference {
  id: number
  value: string
  sense_id: number
}
