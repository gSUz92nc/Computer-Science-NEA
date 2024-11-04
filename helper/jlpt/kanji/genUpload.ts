// Original kanji.json found here: https://github.com/davidluzgouveia/kanji-data/blob/master/kanji.json

// Import the Supabase client
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../../src/lib/database.types";

const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";

// Initialize the Supabase client
const supabaseUrl = "https://yrykfurvxgrvavxgbvbr.supabase.co";
const supabaseKey = SUPABASE_SERVICE_KEY;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Read the JSON file
const kanjiData = JSON.parse(await Bun.file("kanji.json").text());

interface KanjiInfo {
    strokes: number;
    grade: number;
    freq: number;
    jlpt_old: number;
    jlpt_new: number;
    meanings: string[];
    readings_on: string[];
    readings_kun: string[];
    wk_level?: number;
    wk_meanings?: string[];
    wk_readings_on?: string[];
    wk_readings_kun?: string[];
    wk_radicals?: string[];
}

let completed: [string, number, number][] = []; // [kanji, entry_id, jlpt_level]
let errors: any[] = [];

async function processKanjiData() {
    for (const [kanji, info] of Object.entries<KanjiInfo>(kanjiData)) {
        try {
            console.log(`Processing kanji: ${kanji}`);

            // First, search for the kanji in the kanji table
            const { data: existingKanji, error: searchError } = await supabase
                .from("kanji")
                .select("entry_id, value")
                .eq("value", kanji)
                .order("entry_id", { ascending: true })
            

            
            console.log(existingKanji)

            if (searchError || existingKanji == null) {
                console.error(`Error searching for ${kanji}:`, searchError);
                errors.push({ kanji, error: searchError });
                continue;
            }
            
            // select first kanji
            const newKanji = existingKanji[0]

            if (existingKanji) {
                // If we found the kanji, add it to completed with its JLPT level
                const jlptLevel = info.jlpt_new || info.jlpt_old || null;
                if (jlptLevel) {
                    completed.push([kanji, newKanji.entry_id, jlptLevel]);
                } else {
                  console.log("There was an error parsing a kanji")
                  return
                }

                // Insert into jlpt_kanji table
                const { error: insertError } = await supabase
                    .from('jlpt_kanji')
                    .upsert({
                        id: newKanji.entry_id,
                        jlpt_level: jlptLevel
                    });

                if (insertError) {
                    console.error(`Error inserting JLPT data for ${kanji}:`, insertError);
                    errors.push({ kanji, error: insertError });
                } else {
                    console.log(`Successfully processed ${kanji}`);
                }
            } else {
                console.log(`No existing entry found for ${kanji}`);
                errors.push({ kanji, error: "No existing entry found" });
            }

        } catch (error) {
            console.error(`Error processing ${kanji}:`, error);
            errors.push({ kanji, error });
        }
    }
}

// Run the processing
await processKanjiData();

// Save results
console.log(`Completed: ${completed.length} kanji`);
console.log(`Errors: ${errors.length} kanji`);

await Bun.write("kanji_upload_completed.json", JSON.stringify(completed));
await Bun.write("kanji_upload_errors.json", JSON.stringify(errors));