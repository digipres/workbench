# Collection Profiles
## Using Format Profiles to Compare Collections & Registries

## Introduction

- The goals, comparing collections and understand tool coverage.
- Bulk extension lookup, in effect.

## Collection Profiles



```js
import { load_extension_data } from "./registries.js";
import { extractCombinations, render } from 'npm:@upsetjs/bundle';

// Load registry data:
const exts = await load_extension_data();

const registries = new Set();
exts.forEach( function (item, index) {
    // Store the registry IDs:
    registries.add(item.reg_id);
});

// Load collections profile data:
const profiles = [
  {
    key: "yul",
    title: "Yale University Library (unidentified files only) 2024-04-01",
    raw_data: await FileAttachment("../data/collection-profiles/yale/YUL-not-identified-extensions-2024-04-01.csv").csv({typed: true})
  },
  {
    key: "kb-edepot",
    title: "KB eDepot 2014-03",
    raw_data: await FileAttachment("../data/collection-profiles/kb/KB-eDepot-FExtensions-v3-2014-03.csv").csv({typed: true})
  },
  {
    key: "nara-era",
    title: "NARA ERA 2024-06-12",
    raw_data: await FileAttachment("../data/collection-profiles/nara/NARA-ERA-Format-Profile-2024-06-12.csv").csv({typed: true})
  },
  {
    key: "harvard-library",
    title: "Harvard Library DRS 2024-06-06",
    raw_data: await FileAttachment("../data/collection-profiles/harvard/Harvard-Library-DRS-2024-06-06.csv").csv({typed: true})
  }

  

]

const user_profile_key = 'your profile';

// Define defaults:
var default_1 = "yul";
var default_2 = "kb-edepot";

```


```js

// Generate a plot from a profile:
function gen_profile_plot(profile, width) {
    if( ! profile ) return "";
    const profile_plot = Plot.plot({
        title: profile.title,
        subtitle: "Showing the number of files with the given file extension.",
        y: {grid: true, label: "File Count" },
        x: {grid: true, label: "Extension", tickRotate: -50 },
        color: {legend: false, label: "Registry ID"},
        marginBottom: 100,
        width: width,
        marks: [
            Plot.ruleY([0]),
            Plot.barY(
                profile.ok_data.filter( (d) => d.file_count >= file_count_threshold),
                { 
                    y: "file_count", 
                    x: "extension", 
                    sort: { x: "-y" },
                    tip: true
                }
            ),
        ]
    });
    return profile_plot;
}

```

<div class="grid grid-cols-1">
<div class="card">
${ resize((width) => gen_profile_plot(profile_1, width) ) }
</div>
</div>

- Introduce the idea of using extensions and the number of files.
- Optional Upload
- Pointers to other things you can use...




```js
const csvfile = view(Inputs.file({label: "CSV File", accept: ".csv"}));

const file_count_threshold = view(Inputs.range([0, 10000], {step: 5, value: 500, label: "File Count Threshold" }));

const extensions_truncated_at = view(Inputs.range([0, 100], {step: 1, value: 100, label: "Maximum Length for File Extensions" }));

```

```js
if( csvfile != null ) {
    const uploaded = await csvfile.csv();
    const uploaded_item = profiles.find((p) => p.key == user_profile_key);
    if( uploaded_item ) {
        uploaded_item.raw_data = uploaded
    } else {
        profiles.push({
        key: user_profile_key, 
        title: "Your uploaded extension profile",
        raw_data: uploaded
        });
    };
}

// Clean up the data a bit:
function process_profile(profile) {
    profile['strange'] = [];
    profile['ok_data'] = [];
    profile['total_ok_file_count'] = 0;
    profile['total_strange_file_count'] = 0;
    profile['total_file_count'] = 0;
    const count_by_extension = {};
    profile.raw_data.forEach( function (raw_item, index) {
        // Clone original item for modification:
        const item = Object.create(raw_item);
        // Ensure the count is a count:
        item.file_count = parseInt(item.file_count);
        // Canonicalize the extension:
        if( typeof item.extension == "string" ) {
            // Start with a copy:
            var ext = item.extension;
            // Split NARA format:
            if( ext.indexOf('|') > -1 ) {
                ext = ext.slice(0, ext.indexOf('|'));
            }
            // Drop any leading dot, if present:
            ext = ext.replace(/^\.+/, '');
            // trim and downcase:
            ext = ext.trim().toLowerCase();
            // truncate if needed:
            ext = ext.slice(0, extensions_truncated_at);
            // Add a '*.' prefix if none exists:
            if( item.extension.indexOf("*") == -1) {
                item.extension = `*.${ext}`;
            } else {
                item.extension = ext;
            }
            // Drop items that have space characters amid:
            if (ext.indexOf(" ") >= 0) {
                profile.strange.push(item);
                profile.total_strange_file_count += item.file_count;
            } else {
                // Check if the item is already in, and use that instead if so:
                if( count_by_extension[item.extension]) {
                    count_by_extension[item.extension].file_count += item.file_count;
                } else {
                    count_by_extension[item.extension] = item;
                    profile.ok_data.push(item);
                }
                profile.total_ok_file_count += item.file_count;
            }
        } else {
            // Drop items that are not strings, i.e. numeric
            profile.strange.push(item);
            profile.total_strange_file_count += item.file_count;
        }
        // Add up the total:
        profile.total_file_count += item.file_count;
    });
    return profile;
}


// Go through the profiles:
const profile_list = []
profiles.forEach((p) => process_profile(p));


// Select
const profile_1 = view(
  Inputs.select(profiles, {
    label: "Primary Profile",
    format: (t) => t.title,
    value: profiles.find((t) => t.key === default_1),
    width: "100%",
  })
);

const profile_2 = view(
  Inputs.select(profiles, {
    label: "Secondary Profile",
    format: (t) => t.title,
    value: profiles.find((t) => t.key === default_2 ),
    width: "100%",
  })
);

```

## Comparing Collections

- e.g. Yale vs KB


```js
// Loop over profile_1, finding items in profile_2, and comparing
const differences = [];
profile_1.ok_data.forEach((item, index) => {
    // Skip/filter:
    if( item.file_count < file_count_threshold ) {
        return;
    }
    // Look up matched item:
    const item_2 = profile_2.ok_data.find((i) => i.extension == item.extension);
    var item_2_count = 0;
    var relation = 'unique'
    if( item_2 && item_2.file_count > 0.0 ) {
        item_2_count = item_2.file_count;
        relation = 'in common'
    }
    // Calculate percentages:
    const percentage_1 = 100.0 * item.file_count/profile_1.total_ok_file_count;
    const percentage_2 = 100.0 * item_2_count/profile_2.total_ok_file_count;
    differences.push({
        extension: item.extension,
        percentage_1,
        percentage_2,
        percentage_diff: (percentage_1 - percentage_2),
        relation,
    });
})

// Channels to show:
const diff_channels =  {extension: "extension", percent_1: "percentage_1", percentage_2: "percentage_2"};
```

<div class="grid grid-cols-1">
<div class="card">

```js
Plot.plot({
    title: "Title...",
    y: {domain: [-100, 100], type: 'sqrt'},
    color: {legend: true},
    marks: [
        Plot.dotY(differences, Plot.dodgeX('middle', {y: "percentage_diff", fill: "relation", tip: true,channels: diff_channels }))
    ]
})
```

</div>
<div class="card">

```js
Plot.plot({
  title: "Title...",
  x: { type: 'sqrt' },
  y: { type: 'sqrt' },
  color: {legend: true},
  marks: [
    Plot.dotX(differences, {x: "percentage_2", y: "percentage_1", fill: "relation", tip: true, channels: diff_channels})
  ]
})
```

</div>
</div>

## Registry Coverage

- e.g. With collection X, starting with PRONOM, then what?
- Multi-level bulk extension lookup.

```js
const selection = [ "pronom", "fdd", "wikidata", "ffw" ]; // use registries to select all initially

const selector = view(Inputs.checkbox(registries, {label: "Registries", value: selection , format: (x) => x}));
```




## Feedback & Futures

- Ideas? Decide and store formats?