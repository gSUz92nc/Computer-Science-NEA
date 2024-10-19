// Import the Supabase client
import type { Database } from '../../src/lib/database.types'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''

// Initialize the Supabase client
const supabaseUrl = 'https://yrykfurvxgrvavxgbvbr.supabase.co'
const supabaseKey = SUPABASE_SERVICE_KEY
const supabase = createClient<Database>(supabaseUrl, supabaseKey)

const benchmark = async () => {
  const results = [];
  const iterations = 10;

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();

    const { data, error } = await supabase
      .from('entry')
      .select(
        '*, kana ( *, kana_common (*), kana_tags(*), kana_applies_to_kanji(*)), kanji ( *, kanji_common (*), kanji_tags (*)), sense ( *, sense_info (*), antonym (*), cross_reference (*), sense_applies_to_kanji (*), dialect (*), sense_applies_to_kana (*), field (*), definition (*), misc (*), lang_source (*), part_of_speech (*) ))',
      ).textSearch("sense.definition.value", "Hello");

    const end = performance.now();
    results.push(end - start);

    console.log(JSON.stringify(data, null, 2));
    console.log(JSON.stringify(error, null, 2));
  }

  const mean = results.reduce((a, b) => a + b, 0) / results.length;
  const median = results.sort((a, b) => a - b)[Math.floor(results.length / 2)];

  console.log(`Mean time: ${mean} ms`);
  console.log(`Median time: ${median} ms`);
};

benchmark();
