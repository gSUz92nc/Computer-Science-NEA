// Import the Supabase client
import type { Database } from "../../src/lib/database.types";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";

// Initialize the Supabase client
const supabaseUrl = "https://yrykfurvxgrvavxgbvbr.supabase.co";
const supabaseKey = SUPABASE_SERVICE_KEY;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

let search: string = "'hello'";

async function loadData() {
  const startTime = Date.now();

  // const { data, error } = await supabase
  //   .from("jmdict_gloss")
  //   .select("*, jmdict_sense( word_id )") // This selects all columns from jmdict_gloss and all columns from jmdict_sense
  //   .textSearch("fts", search);

  // if (error) {
  //   console.error("Error fetching data:", error);
  // }

  const wordId = 1000040; // Replace with the actual word ID

  // Check if the word exists
  // Fetch all related data if the word exists
  const { data: testData, error: testError } = await supabase
    .from("jmdict_word")
    .select(`
      *,
      jmdict_sense (
        *,
        jmdict_gloss (
          *
        )
      ),
      jmdict_kana (*),
      jmdict_kanji (*)
    `)
    .textSearch("jmdict_sense.jmdict_gloss.fts", search).limit(1000);
    
  const endTime = Date.now();

  if (testError) {
    console.error("Error fetching word data:", testError);
  } else {
    console.log("Fetched word data:", testData);
    console.log("Number of words fetched:", testData?.length);

    // log how many unique glosses were fetched
    const glosses = new Set<Object>();
    testData?.forEach((word) => {
      word.jmdict_sense.forEach((sense) => {
        sense.jmdict_gloss.forEach((gloss) => {
          glosses.add(gloss);
        });
      });
    });

    console.log("Number of unique glosses fetched:", glosses.size);
    console.log(glosses);
  }

  return { success: true, timeTaken: endTime - startTime };
}

async function benchmarkLoadData() {
  const numberOfRequests = 1;
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
