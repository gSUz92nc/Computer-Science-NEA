// Import the Supabase client
import type { Database } from "../../src/lib/database.types";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";

// Initialize the Supabase client
const supabaseUrl = "https://yrykfurvxgrvavxgbvbr.supabase.co";
const supabaseKey = SUPABASE_SERVICE_KEY;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

let search: string = "'example'";

async function loadData() {
  const startTime = Date.now();
  // const { data, error } = await supabase
  //   .rpc("search_jmdict", { search_term: search })


  const { data, error } = await supabase.from("jmdict_word").select("jmdict_sense ( id ( fts )), jmdict_kana ( * ), jmdict_kanji ( * )").textSearch("jmdict_sense.id.fts", search).eq("jmdict_kana.text", search).eq("jmdict_kanji.text", search);


  if (error) {
    console.error("Error fetching data:", error);
  }

  const endTime = Date.now();

  if (error) {
    console.error("Error loading data:", error);
    return { success: false, timeTaken: endTime - startTime };
  }

  return { success: true, timeTaken: endTime - startTime };
}

async function benchmarkLoadData() {
  const numberOfRequests = 100;
  console.time("loadData");

  let totalTime = 0;
  let failures = 0;
  let success = 0;

  for (let i = 0; i < numberOfRequests; i++) {
    const result = await loadData();
    if (result.success) {
      totalTime += result.timeTaken;
      success += 1;
      console.log(success, "/", numberOfRequests);
    } else {
      failures += 1;
    }
  }

  const averageTimePerRequest = totalTime / numberOfRequests;

  console.timeEnd("loadData");
  console.log(`Number of failures: ${failures}`);
  console.log(`Average time per request: ${averageTimePerRequest} ms`);
}

benchmarkLoadData();
