// Import the Supabase client
import type { Database } from '../../src/lib/database.types';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

// Initialize the Supabase client
const supabaseUrl = 'https://yrykfurvxgrvavxgbvbr.supabase.co';
const supabaseKey = SUPABASE_SERVICE_KEY;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

let search: string = 'example';

async function loadData() {
	const startTime = Date.now();
	const { data, error } = await supabase.rpc('get_jmdict_entries', {
		gloss_input: 'crane',
	});

	console.log(data);
	if (error) {
		console.log('Error occurred while fetching data:', error);
		return { success: false, timeTaken: 0 };
	}

	// Pretty print to console

	console.log(JSON.stringify(data, null, 2));

	const endTime = Date.now();
	const timeTaken = endTime - startTime;

	return { success: true, timeTaken };
}

async function benchmarkLoadData() {
	const numberOfRequests = 20;
	console.time('loadData');

	let totalTime = 0;
	let failures = 0;
	let success = 0;

	for (let i = 0; i < numberOfRequests; i++) {
		const result = await loadData();
		if (result.success) {
			totalTime += result.timeTaken;
			success += 1;
			console.log(success, '/', numberOfRequests);
		} else {
			failures += 1;
		}
	}

	const averageTimePerRequest = totalTime / numberOfRequests;

	console.timeEnd('loadData');
	console.log(`Number of failures: ${failures}`);
	console.log(`Average time per request: ${averageTimePerRequest} ms`);
}

benchmarkLoadData();
