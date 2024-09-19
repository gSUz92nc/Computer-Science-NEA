// Import the Supabase client
import type { Database } from "../../src/lib/database.types";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";

// Initialize the Supabase client
const supabaseUrl = "https://yrykfurvxgrvavxgbvbr.supabase.co";
const supabaseKey = SUPABASE_SERVICE_KEY;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

let index = 0;
let search: string = "あ";

async function loadData() {
  const startTime = Date.now();
  const { data, error } = await supabase
    .rpc("search_jmdict", { search_term: search })

  if (error) {
    console.error("Error fetching data:", error);
  }

  const endTime = Date.now();

  if (error) {
    console.error("Error loading data:", error);
    return { success: false, timeTaken: endTime - startTime };
  }

  index += 1;
  console.log(index);

  return { success: true, timeTaken: endTime - startTime };
}

async function benchmarkLoadData() {
  const numberOfRequests = 2000;
  console.time("loadData");

  const promises = Array.from({ length: numberOfRequests }, () => loadData());
  const results = await Promise.allSettled(promises);

  const totalTime = results.reduce((acc, result) => {
    if (result.status === "fulfilled") {
      return acc + result.value.timeTaken;
    }
    return acc;
  }, 0);

  const averageTimePerRequest = totalTime / numberOfRequests;
  const failures =
    results.filter((result) =>
      result.status === "rejected" || !result.value.success
    ).length;

  console.timeEnd("loadData");
  console.log(`Number of failures: ${failures}`);
  console.log(`Average time per request: ${averageTimePerRequest} ms`);
}

benchmarkLoadData();
