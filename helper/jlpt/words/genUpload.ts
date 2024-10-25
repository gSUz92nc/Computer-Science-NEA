// Import the Supabase client
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../../src/lib/database.types";
import { stringSimilarity } from "string-similarity-js";

const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";

// Initialize the Supabase client
const supabaseUrl = "https://yrykfurvxgrvavxgbvbr.supabase.co";
const supabaseKey = SUPABASE_SERVICE_KEY;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// import N5.csv from the local filesystem
import parse from "csv-simple-parser";

// read the files
const n5csv = Bun.file("n5.csv").text();
const n4csv = Bun.file("n4.csv").text();
const n3csv = Bun.file("n3.csv").text();
const n2csv = Bun.file("n2.csv").text();
const n1csv = Bun.file("n1.csv").text();

// save the first value of each row to an array, excluding the first row as it is a header
const n5array = parse(await n5csv).slice(1);
const n4array = parse(await n4csv).slice(1);
const n3array = parse(await n3csv).slice(1);
const n2array = parse(await n2csv).slice(1);
const n1array = parse(await n1csv).slice(1);

let emptyResults: string[] = [];
let kanjiCount = 0;
let completed: [string, number, number][] = [];

// search the jmdict_kanji table for the first value of eaach row then return create a new 2d array which contains the first value of each row and the result of the search whether the returned data is empty or not
async function processKanjiArray(
  csvItems: unknown[][] | Record<string, unknown>[],
  jlpt_level: number,
) {
  let index = 0;

  const kanjiArrayWithSearchResults = await Promise.all(
    csvItems.map(async (kanji) => {
      if (kanji[0].includes("～")) {
        kanji[0] = kanji[0].replace(/～/g, "");
      }

      const kanjiElements = kanji[0].split("; ");
      kanjiCount += kanjiElements.length;

      // Search for each kanji element seperately and check if there is one common word and only one common word
      let commonWordId: number | null = null;

      for (const element of kanjiElements) {

        console.log(`Processing ${element} at index ${index++}`);

        // Search for the kanji in the kanji and kana tables to find all possible entries 
        const { data: kanjiData } = await supabase
          .from("kanji")
          .select("entry_id, value")
          .eq("value", element);

        const { data: kanaData } = await supabase
          .from("kana")
          .select("entry_id, value")
          .eq("value", element);

        console.log(kanjiData, kanaData);

        const combinedData = [...(kanjiData || []), ...(kanaData || [])];

        // If there is no data, add the element to the empty results
        if (combinedData.length === 0) {
          emptyResults.push(element);
        }

        // If there is only one common word, save the id
        if (combinedData.length === 1) {
          commonWordId = combinedData[0].entry_id;
          if (commonWordId !== null) {
            completed.push([kanji[0], commonWordId, jlpt_level]);
          }
        }

        console.log("Combined: ", combinedData);

        // 

      }

      if (commonWordId) {
        return [kanji[0], commonWordId, jlpt_level];
      }
    }),
  );
}

// Run for N5
await processKanjiArray(n5array.slice(0,2), 5);
// Run for the rest
// await processKanjiArray(n4array, 4);
// await processKanjiArray(n3array, 3);
// await processKanjiArray(n2array, 2);
// await processKanjiArray(n1array, 1);


// Save the empty results to a file for manual inspection
console.log(emptyResults.length);
await Bun.write("empty.json", JSON.stringify(emptyResults));

await Bun.write(
  "uploads.json",
  JSON.stringify(completed),
);
