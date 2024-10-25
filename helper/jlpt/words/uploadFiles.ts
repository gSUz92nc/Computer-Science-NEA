import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../../src/lib/database.types'

const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''

// Initialize the Supabase client
const supabaseUrl = 'https://yrykfurvxgrvavxgbvbr.supabase.co'
const supabaseKey = SUPABASE_SERVICE_KEY
const supabase = createClient<Database>(supabaseUrl, supabaseKey)

// for each in uploadFiles.ts insert as a batch to supabase

// import uploads.json from the local filesystem
const file = Bun.file("./uploads.json");

const uploads = await file.json();

// Define the type for the objects in uploads.json
//              word, word_id, jlpt_level
type Upload =  [string, number, number]

function batchArray(arr: [], n: number): Upload[][] {
  const result: Upload[][] = [];
  for (let i = 0; i < arr.length; i += n) {
    result.push(arr.slice(i, i + n));
  }
  return result;
}

function formatArray(arr) {
  return arr.map((item) => {
    return {
      id: item[1],
      jlpt_level: item[2],
    };
  });
}


const batchedUploads = batchArray(formatArray(uploads), 1000)


// Finished uploads!!!
batchedUploads.forEach(async (temp) => {
  console.log(temp)
  const { error } = await supabase.from("jlpt_vocab").insert(temp);

  console.log(error)
})


