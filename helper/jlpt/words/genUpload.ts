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

let emptyResults: { word: string; level: number }[] = [];
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

      for (const element of kanjiElements) {
        console.log(`Processing ${element} at index ${index++}`);

        // Search for the kanji in the kanji and kana tables to find all possible entries
        const { data: kanjiData, error: kanjiError } = await supabase
          .from("kanji")
          .select("entry_id, value")
          .eq("value", element);

        const { data: kanaData, error: kanaError } = await supabase
          .from("kana")
          .select("entry_id, value")
          .eq("value", element);

        if (kanjiError || kanaError) {
          console.error(kanjiError || kanaError);
          return;
        }

        const combinedData = [...(kanjiData || []), ...(kanaData || [])];

        // Remove duplicates
        const uniqueCombinedData = combinedData.filter(
          (v, i, a) => a.findIndex((t) => t.value === v.value) === i,
        );

        // If there is no data, add the element to the empty results
        if (uniqueCombinedData.length === 0) {
          emptyResults.push({ word: element, level: jlpt_level });
          return;
        }

        // If there is only one common word, save the id
        if (uniqueCombinedData.length === 1) {
          completed.push([
            kanji[0],
            uniqueCombinedData[0].entry_id,
            jlpt_level,
          ]);
          return;
        }

        // If there are multiple common words, just pick the one with the lowest id

        const sortedData = combinedData.sort((a, b) => {
          if (a.entry_id === null || b.entry_id === null) {
            return 0;
          }
          return a.entry_id - b.entry_id;
        });

        console.log("Sorted Data:", sortedData);

        for (const data of sortedData) {
          if (!completed.some(([_, id]) => id === data.entry_id)) {
            completed.push([kanji[0], data.entry_id, jlpt_level]);
            return;
          }
        }
      }
    }),
  );
}

// Run for N5
await processKanjiArray(n5array, 5);
// Run for the rest
// await processKanjiArray(n4array, 4);
// await processKanjiArray(n3array, 3);
// await processKanjiArray(n2array, 2);
// await processKanjiArray(n1array, 1);

// Save the empty results to a file for manual inspection
console.log("Completed", completed.length);
console.log("Empty Results", emptyResults.length);
await Bun.write("empty.json", JSON.stringify(emptyResults));

await Bun.write(
  "uploads.json",
  JSON.stringify(completed),
);
