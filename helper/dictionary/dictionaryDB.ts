
// Data source: https://github.com/scriptin/jmdict-simplified/releases/

// Import the Supabase client
import type { Database } from "../../src/lib/database.types";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";

// Initialize the Supabase client
const supabaseUrl = "https://yrykfurvxgrvavxgbvbr.supabase.co";
const supabaseKey = SUPABASE_SERVICE_KEY;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Example JSON data
const jmdictWords = await JSON.parse(await Bun.file("./dictionary.json").text())
  .words;

// Function to insert data
let index = 0;
const final = 209971;

async function insertData() {
  try {
    const batchSize = 1000;
    const totalWords = jmdictWords.length;
    const totalBatches = Math.ceil(totalWords / batchSize);
    const startTime = new Date().getTime();

    for (let i = 0; i < totalWords; i += batchSize) {
      const batchWords = jmdictWords.slice(i, i + batchSize);

      console.log(`Inserting batch starting at index ${i}`);

      // Upload to jmdict_word
      const { error: word_error } = await supabase
        .from("jmdict_word")
        .insert(batchWords.map((word) => ({ id: word.id })));

      if (word_error) {
        console.error("Error inserting data (word_error):", word_error);
      }

      // Upload to jmdict_kana
      const kanaInserts = batchWords.flatMap((currentWord) =>
        currentWord.kana.map((kana) => ({
          word_id: currentWord.id,
          common: kana.common,
          tags: kana.tags,
          applies_to_kanji: kana.applies_to_kanji,
          text: kana.text,
        }))
      );

      const { error: kana_error } = await supabase
        .from("jmdict_kana")
        .insert(kanaInserts);

      if (kana_error) {
        console.error("Error inserting data (kana_error):", kana_error);
      }

      // Upload to jmdict_kanji
      const kanjiInserts = batchWords.flatMap((currentWord) =>
        currentWord.kanji.map((kanji) => ({
          word_id: currentWord.id,
          common: kanji.common,
          text: kanji.text,
          tags: kanji.tags,
        }))
      );

      const { error: kanji_error } = await supabase
        .from("jmdict_kanji")
        .insert(kanjiInserts);

      if (kanji_error) {
        console.error("Error inserting data (kanji_error):", kanji_error);
      }

      // Prepare data for jmdict_sense
      const senseInserts = batchWords.flatMap((currentWord) =>
        currentWord.sense.map((currentSense) => ({
          word_id: currentWord.id,
          part_of_speech: currentSense.part_of_speech,
          applies_to_kanji: currentSense.applies_to_kanji,
          applies_to_kana: currentSense.applies_to_kana,
          related: currentSense.related,
          antonym: currentSense.antonym,
          field: currentSense.field,
          dialect: currentSense.dialect,
          misc: currentSense.misc,
          info: currentSense.info,
          language_source: currentSense.language_source,
        }))
      );

      const { data: sense_data, error: sense_error } = await supabase
        .from("jmdict_sense")
        .insert(senseInserts)
        .select("id, word_id");

      if (sense_error) {
        console.error("Error inserting data (sense_error):", sense_error);
      }

      if (sense_data == null) {
        console.error("No sense data found");
        break;
      }

      // Collect all glosses for each sense
      const glossInserts: any[] = [];

      sense_data.forEach((sense) => {
        const word = batchWords.find((word) =>
          word.id == sense.word_id.toString()
        );
        if (!word) {
          console.error(`Word not found for word_id: ${sense.word_id}`);
          return;
        }

        word.sense.forEach((nsense) => {
          nsense.gloss.forEach((ngloss) => {
            glossInserts.push({
              sense_id: sense.id,
              text: ngloss.text,
              type: ngloss.type,
              gender: ngloss.gender,
              lang: ngloss.lang,
            });
          });
        });
      });

      const { error: gloss_error } = await supabase
        .from("jmdict_gloss")
        .insert(glossInserts);

      if (gloss_error) {
        console.error("Error inserting data (gloss_error):", gloss_error);
      }

      index++;
      const currentTime = new Date().getTime();
      const elapsedTime = (currentTime - startTime) / 1000; // in seconds
      const estimatedTotalTime = (elapsedTime / index) * totalBatches;
      const remainingTime = estimatedTotalTime - elapsedTime;

      console.log(`Elapsed Time: ${elapsedTime.toFixed(2)} seconds`);
      console.log(
        `Estimated Remaining Time: ${(remainingTime / 60).toFixed(2)} minutes`
      );
    }
  } catch (error) {
    console.error("Error inserting data:", error);
  }
}

// Call the function to insert data
insertData();
