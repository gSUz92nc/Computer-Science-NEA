// Import the Supabase client
import type { Database } from "../../src/lib/database.types";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_SERVICE_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY || "";

// Initialize the Supabase client
const supabaseUrl = "https://yrykfurvxgrvavxgbvbr.supabase.co";
const supabaseKey = SUPABASE_SERVICE_KEY;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

let search: string = "example";

async function loadData() {
  const startTime = Date.now();
  // const { data, error } = await supabase
  //   .rpc("search_jmdict", { search_term: search })

  const { data, error } = await supabase
    .from("jmdict_word")
    .select(
      `
          id,
          jmdict_sense ( *, jmdict_gloss ( id, text ) )
      `,
    )
    .eq("jmdict_sense.jmdict_gloss.id", "2e8bf32d-2b58-40d3-9684-809dde9e4b83") // Assuming this is the id of jmdict_sense
    .limit(100);

  if (error) {
    console.error("Error fetching data:", error);
  }

  console.log(data ? console.log(data) : console.log("No data"));

  // Save to json file
  const fs = require("fs");
  fs.writeFile("data.json", JSON.stringify(data), (err: any) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("File has been created");
  });

  const endTime = Date.now();

  if (error) {
    console.error("Error loading data:", error);
    return { success: false, timeTaken: endTime - startTime };
  }

  console.log(data.length);
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
