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

// Batch array function, takes an array and a number n and returns an array of arrays with n elements
function batchArray(arr: {id: number, jlpt_level: number}[], n: number): {id: number, jlpt_level: number}[][] {
  const result: {id: number, jlpt_level: number}[][] = [];
  for (let i = 0; i < arr.length; i += n) {
    result.push(arr.slice(i, i + n));
  }
  return result;
}

// Format the array to match the database schema
function formatArray(arr): {id: number, jlpt_level: number}[] {
  return arr.map((item) => {
    return {
      id: item[1],
      jlpt_level: item[2],
    };
  });
}


const batchedUploads = batchArray(formatArray(uploads), 100)

// Remove duplicate uploads
function removeDuplicateUploads(batchedUploads: {id: number, jlpt_level: number}[][]): {id: number, jlpt_level: number}[][] {
  return batchedUploads.map((batch) => {
    const unique = Array.from(new Map(batch.map(item => [item.id, item])).values());
    return unique;
  });
}

const uniqueUploads = removeDuplicateUploads(batchedUploads);

// Finished uploads!
for (const temp of uniqueUploads) {
  console.log(temp);
  const { error } = await supabase.from("jlpt_vocab").upsert(temp);
  console.log(error);
}


