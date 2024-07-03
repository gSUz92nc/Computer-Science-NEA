<script lang="ts">
  import "../app.css";
  import { browser } from "$app/environment";
  import { toKatakana, toHiragana } from "wanakana";

  export let data;
  const { supabase } = data;

  let dictionaryEntries: any[] = [];
  let dictionarySearchValue = "";

  let searching = false;
  let skipNextSearch = false;

  $: fetchDictionary(dictionarySearchValue, false);

  // Fetches the dictionary entries
  const fetchDictionary = async (searchTerm: string, final: boolean) => {
    if (skipNextSearch) {
      skipNextSearch = false;
      return;
    }

    if (searchTerm === "") {
      dictionaryEntries = [];
      return;
    }

    if (final && dictionaryEntries.length > 0) {
      skipNextSearch = true;
      // Set the search value to the first result
      dictionarySearchValue = dictionaryEntries[0].reading;
      return;
    }
    searching = true;

    // Convert to kana then search again
    const kata = toKatakana(searchTerm);
    const hira = toHiragana(searchTerm);

    const { data, error } = await supabase
      .from("dictionary")
      .select("html, kanji, reading, index")
      .or(`kanji.eq.${searchTerm}, reading.eq.${searchTerm}`)
      .order("index", { ascending: true });

    const { data: kataData, error: kataError } = await supabase
      .from("dictionary")
      .select("html, kanji, reading, index")
      .or(`kanji.eq.${kata}, reading.eq.${kata}`)
      .order("index", { ascending: true });

    const { data: hiraData, error: hiraError } = await supabase
      .from("dictionary")
      .select("html, kanji, reading, index")
      .or(`kanji.eq.${hira}, reading.eq.${hira}`)
      .order("index", { ascending: true });

    if (error || kataError || hiraError) {
      console.error(
        "Error fetching dictionary entries",
        error || kataError || hiraError
      );
    } else {
      // Check for duplicates
      const tempData = [...data, ...kataData, ...hiraData];
      const dictionaryEntriesSet = new Set();
      dictionaryEntries = tempData.filter((entry) => {
        if (dictionaryEntriesSet.has(entry.kanji)) {
          return false;
        }
        dictionaryEntriesSet.add(entry.kanji);
        return true;
      });

      // Sort by index
      dictionaryEntries.sort((a, b) => a.index - b.index);
    }

    searching = false;
  };

  // Used for opening/closing the dictionary modal
  const dictionaryModal = browser
    ? (document?.getElementById("dictionary") as HTMLDialogElement)
    : null;

  let multiplePages = false;
</script>

<!-- Dictionary Modal -->
<dialog id="dictionary" class="modal modal-bottom lg:modal-middle w-full">
  <div class="modal-box min-h-[80vh] lg:min-h-[60vh]">
    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        ><svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-x-lg"
          viewBox="0 0 16 16"
        >
          <path
            d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"
          />
        </svg></button
      >
    </form>
    <h1 class="text-lg font-bold">
      Dictionary (Only works when searching Japanese Currently)
    </h1>
    <div class="join w-full">
      <select class="select select-bordered join-item">
        <option selected>All</option>
        <option>Kanji</option>
        <option>Words</option>
      </select>
      <div class="w-full">
        <div class="w-full">
          <input
            class="input input-bordered join-item w-full"
            placeholder="Search"
            on:change={() => fetchDictionary(dictionarySearchValue, true)}
            bind:value={dictionarySearchValue}
          />
        </div>
      </div>
      <button
        class="btn join-item"
        on:click={() => fetchDictionary(dictionarySearchValue, true)}
        >Search</button
      >
    </div>
    <!-- Shows past searches -->
    {#if searching}
      <div class="mt-2">
        <h2 class="font-bold text-2xl">Searching...</h2>
      </div>
    {:else if dictionaryEntries.length == 0}
      {#if dictionarySearchValue.length > 0}
        <div class="mt-2">
          <h2 class="font-bold text-2xl">No results found</h2>
          <p class="text-lg font-semibold">Try searching for something else</p>
        </div>
      {/if}
      <div></div>
    {:else}
      {#each dictionaryEntries as entry}
        <div class="mt-2">
          <h2 class="font-bold text-2xl">{entry.kanji}</h2>
          <p class="text-lg font-semibold">{entry.reading}</p>
          {@html entry.html}
        </div>
        <div class="divider"></div>
      {/each}
    {/if}

    <!-- For scrolling through pages -->
    {#if multiplePages}
      <div class="join flex w-full justify-center mt-2">
        <button class="join-item btn btn-outline w-[5rem]">Previous page</button
        >
        <button class="join-item btn btn-outline w-[5rem]">Next</button>
      </div>
    {/if}
  </div>
</dialog>

<div class="drawer lg:drawer-open h-screen">
  <input id="main-menu-drawer" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content flex flex-col">
    <!-- Page content here -->
    <div class="flex-grow">
      <slot />
    </div>

    <div class="flex-none h-[4rem] w-full lg:hidden bg-base-200">
      <div class="btm-nav">
        <button class="active">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            class="bi bi-house h-5 w-5"
            viewBox="0 0 16 16"
          >
            <path
              d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z"
            />
          </svg>
          <span class="btm-nav-label">Home</span>
        </button>
        <button>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            class="bi bi-globe-asia-australia w-5 h-5"
            viewBox="0 0 16 16"
          >
            <path
              d="m10.495 6.92 1.278-.619a.483.483 0 0 0 .126-.782c-.252-.244-.682-.139-.932.107-.23.226-.513.373-.816.53l-.102.054c-.338.178-.264.626.1.736a.48.48 0 0 0 .346-.027ZM7.741 9.808V9.78a.413.413 0 1 1 .783.183l-.22.443a.6.6 0 0 1-.12.167l-.193.185a.36.36 0 1 1-.5-.516l.112-.108a.45.45 0 0 0 .138-.326M5.672 12.5l.482.233A.386.386 0 1 0 6.32 12h-.416a.7.7 0 0 1-.419-.139l-.277-.206a.302.302 0 1 0-.298.52z"
            />
            <path
              d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0M1.612 10.867l.756-1.288a1 1 0 0 1 1.545-.225l1.074 1.005a.986.986 0 0 0 1.36-.011l.038-.037a.88.88 0 0 0 .26-.755c-.075-.548.37-1.033.92-1.099.728-.086 1.587-.324 1.728-.957.086-.386-.114-.83-.361-1.2-.207-.312 0-.8.374-.8.123 0 .24-.055.318-.15l.393-.474c.196-.237.491-.368.797-.403.554-.064 1.407-.277 1.583-.973.098-.391-.192-.634-.484-.88-.254-.212-.51-.426-.515-.741a7 7 0 0 1 3.425 7.692 1 1 0 0 0-.087-.063l-.316-.204a1 1 0 0 0-.977-.06l-.169.082a1 1 0 0 1-.741.051l-1.021-.329A1 1 0 0 0 11.205 9h-.165a1 1 0 0 0-.945.674l-.172.499a1 1 0 0 1-.404.514l-.802.518a1 1 0 0 0-.458.84v.455a1 1 0 0 0 1 1h.257a1 1 0 0 1 .542.16l.762.49a1 1 0 0 0 .283.126 7 7 0 0 1-9.49-3.409Z"
            />
          </svg>
          <span class="btm-nav-label">Map</span>
        </button>
        <button on:click={() => dictionaryModal && dictionaryModal.showModal()}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            class="bi bi-book-half w-5 h-5"
            viewBox="0 0 16 16"
          >
            <path
              d="M8.5 2.687c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783"
            />
          </svg>
          <span class="btm-nav-label">Dictionary</span>
        </button>
        <button>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            class="bi bi-journal-bookmark-fill w-5 h-5"
            viewBox="0 0 16 16"
          >
            <path
              fill-rule="evenodd"
              d="M6 1h6v7a.5.5 0 0 1-.757.429L9 7.083 6.757 8.43A.5.5 0 0 1 6 8z"
            />
            <path
              d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2"
            />
            <path
              d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1z"
            />
          </svg>
          <span class="btm-nav-label">Review</span>
        </button>
        <button>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            class="bi bi-list w-6 h-6"
            viewBox="0 0 16 16"
          >
            <path
              fill-rule="evenodd"
              d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
            />
          </svg>
          <span class="btm-nav-label -mt-1">More</span>
        </button>
      </div>
    </div>
  </div>
  <!-- Sidebar -->
  <div class="drawer-side">
    <label
      for="main-menu-drawer"
      aria-label="close sidebar"
      class="drawer-overlay"
    ></label>
    <ul class="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
      <!-- Sidebar content here -->
      <img src="/Logo.svg" class="w-28" alt="Narau Logo" />
      <li class="mt-4">
        <a class="h-11 text-lg font-semibold" href="/"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-house"
            viewBox="0 0 16 16"
          >
            <path
              d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z"
            />
          </svg>Home</a
        >
      </li>
      <li>
        <a class="h-11 text-lg font-semibold" href="/"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-globe-asia-australia"
            viewBox="0 0 16 16"
          >
            <path
              d="m10.495 6.92 1.278-.619a.483.483 0 0 0 .126-.782c-.252-.244-.682-.139-.932.107-.23.226-.513.373-.816.53l-.102.054c-.338.178-.264.626.1.736a.48.48 0 0 0 .346-.027ZM7.741 9.808V9.78a.413.413 0 1 1 .783.183l-.22.443a.6.6 0 0 1-.12.167l-.193.185a.36.36 0 1 1-.5-.516l.112-.108a.45.45 0 0 0 .138-.326M5.672 12.5l.482.233A.386.386 0 1 0 6.32 12h-.416a.7.7 0 0 1-.419-.139l-.277-.206a.302.302 0 1 0-.298.52z"
            />
            <path
              d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0M1.612 10.867l.756-1.288a1 1 0 0 1 1.545-.225l1.074 1.005a.986.986 0 0 0 1.36-.011l.038-.037a.88.88 0 0 0 .26-.755c-.075-.548.37-1.033.92-1.099.728-.086 1.587-.324 1.728-.957.086-.386-.114-.83-.361-1.2-.207-.312 0-.8.374-.8.123 0 .24-.055.318-.15l.393-.474c.196-.237.491-.368.797-.403.554-.064 1.407-.277 1.583-.973.098-.391-.192-.634-.484-.88-.254-.212-.51-.426-.515-.741a7 7 0 0 1 3.425 7.692 1 1 0 0 0-.087-.063l-.316-.204a1 1 0 0 0-.977-.06l-.169.082a1 1 0 0 1-.741.051l-1.021-.329A1 1 0 0 0 11.205 9h-.165a1 1 0 0 0-.945.674l-.172.499a1 1 0 0 1-.404.514l-.802.518a1 1 0 0 0-.458.84v.455a1 1 0 0 0 1 1h.257a1 1 0 0 1 .542.16l.762.49a1 1 0 0 0 .283.126 7 7 0 0 1-9.49-3.409Z"
            />
          </svg>Map</a
        >
      </li>
      <li>
        <button
          class="h-11 text-lg font-semibold"
          on:click={() => dictionaryModal && dictionaryModal.showModal()}
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-book-half"
            viewBox="0 0 16 16"
          >
            <path
              d="M8.5 2.687c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783"
            />
          </svg>Dictionary</button
        >
      </li>
      <li>
        <a class="h-11 text-lg font-semibold" href="/"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-journal-bookmark-fill"
            viewBox="0 0 16 16"
          >
            <path
              fill-rule="evenodd"
              d="M6 1h6v7a.5.5 0 0 1-.757.429L9 7.083 6.757 8.43A.5.5 0 0 1 6 8z"
            />
            <path
              d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2"
            />
            <path
              d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1z"
            />
          </svg>Review</a
        >
      </li>
      <li>
        <a class="h-11 text-lg font-semibold" href="/practice"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-chat-left-dots-fill"
            viewBox="0 0 16 16"
          >
            <path
              d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4.414a1 1 0 0 0-.707.293L.854 15.146A.5.5 0 0 1 0 14.793zm5 4a1 1 0 1 0-2 0 1 1 0 0 0 2 0m4 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0m3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2"
            />
          </svg>Practice</a
        >
      </li>
      <li>
        <a class="h-11 text-lg font-semibold" href="/"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-gear"
            viewBox="0 0 16 16"
          >
            <path
              d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0"
            />
            <path
              d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z"
            />
          </svg>Settings</a
        >
      </li>
      <li class="mt-auto">
        <a class="h-11 text-lg font-semibold" href="/"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-person-circle"
            viewBox="0 0 16 16"
          >
            <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
            <path
              fill-rule="evenodd"
              d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"
            />
          </svg>Account</a
        >
      </li>
    </ul>
  </div>
</div>
