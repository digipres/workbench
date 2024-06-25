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
    terms: "CC-BY - Yale University Library",
    raw_data: await FileAttachment("../data/collection-profiles/yale/YUL-not-identified-extensions-2024-04-01.csv").csv({typed: true})
  },
  {
    key: "kb-edepot",
    title: "KB eDepot 2014-03",
    terms: "CC-BY - KB",
    link: "https://www.bitsgalore.org/2015/04/29/top-50-file-formats-in-the-kb-e-depot",
    raw_data: await FileAttachment("../data/collection-profiles/kb/KB-eDepot-FExtensions-v3-2014-03.csv").csv({typed: true})
  },
//  {
//    key: "nara-era",
//    title: "NARA ERA (extensions truncated to six characters) 2024-06-12",
//    terms: "CC-0 NARA TBC",
//    truncated_at: 6,
//    raw_data: await FileAttachment("../data/collection-profiles/nara/NARA-ERA-Format-Profile-2024-06-12.csv").csv({typed: true})
//  },
  {
    key: "harvard-library",
    title: "Harvard Library DRS 2024-06-06",
    terms: "CC-BY - Harvard University",
    raw_data: await FileAttachment("../data/collection-profiles/harvard/Harvard-Library-DRS-2024-06-06.csv").csv({typed: true})
  }

  

]

const user_profile_key = 'your profile';

// Define defaults:
var default_1 = "yul";
var default_2 = "kb-edepot";

```


```js
// Make it clear to Observable Framework that this cell depends on this parameter:
extensions_truncated_at;

// Generate a plot from a profile:
function gen_profile_plot(profile, width) {
    if( ! profile ) return "";
    const profile_plot = Plot.plot({
        title: profile.title,
        subtitle: "Showing the number of files with the given file extension.",
        y: {grid: true, label: "File Count" },
        x: {grid: true, label: "Extension", tickRotate: -50 },
        color: {legend: false, label: "Registry ID", scheme: "Observable10" },
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
                    tip: true,
                    fill: 1
                }
            ),
        ]
    });
    return profile_plot;
}

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
profiles.forEach((p) => process_profile(p));
```

- Introduce the idea of using extensions and the number of files.
- Optional Upload
- Pointers to other things you can use...





### Select Your Collection Profile


```js
// Select
const profile_1 = view(
  Inputs.select(profiles, {
    label: "Primary Profile",
    format: (t) => t.title,
    value: profiles.find((t) => t.key === default_1),
    width: "100%",
  })
);
```

```js
const csvfile = view(Inputs.file({label: "Add Your CSV Extension Profile", accept: ".csv"}));
```

<details class="card">
<summary>How do I create a suitable Extension Profile in CSV format?</summary>

Details TBA...
</details>


### Configuration

```js
const file_count_threshold = view(Inputs.range([0, 10000], {step: 5, value: 500, label: "Ignore Extensions With A File Count Lower Than:" }));

const extensions_truncated_at = view(Inputs.range([0, 100], {step: 1, value: 100, label: "Truncate Extensions Longer Than (Characters):" }));

```

<div class="grid grid-cols-1">
<div class="card">
${ resize((width) => gen_profile_plot(profile_1, width) ) }
</div>
</div>



## Comparing Collections

- e.g. Yale vs KB

```js
const profile_2 = view(
  Inputs.select(profiles, {
    label: "Secondary Profile",
    format: (t) => t.title,
    value: profiles.find((t) => t.key === default_2 ),
    width: "100%",
  })
);
```



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
const diff_channels =  { Relation: "relation", Extension: "extension", "%tage of Primary Collection": "percentage_1","%tage of Secondary Collection": "percentage_2", "Difference of %tages": "percentage_diff" };
```

<div class="grid grid-cols-1">
<div class="card">

```js
Plot.plot({
    title: "Title...",
    y: {domain: [-100, 100], type: 'sqrt', grid: true, label: "Difference of %tages"},
    color: {legend: true, label: "Relation" },
    width,
    marks: [
        Plot.ruleY([0]),
        Plot.dotY(differences, Plot.dodgeX('middle', {y: "percentage_diff", fill: "relation", tip: true,channels: diff_channels, r: 4 }))
    ]
})
```

</div>
<div class="card">

```js
Plot.plot({
  title: "Title...",
  x: { type: 'sqrt', grid: true, label: "%tage of Secondary Collection" },
  y: { type: 'sqrt', grid: true, label: "%tage of Primary Collection" },
  color: {legend: true, label: "Relation" },
  width,
  marks: [
    Plot.ruleX([0]),
    Plot.ruleY([0]),
    Plot.dotX(differences, {x: "percentage_2", y: "percentage_1", fill: "relation", tip: true, channels: diff_channels, r: 4})
  ]
})
```

</div>
</div>

## Tool & Registry Coverage

- e.g. With collection X, starting with PRONOM, then what?
- Multi-level bulk extension lookup.

```js

const ext_dict = {}
profile_1.ok_data.forEach( (item, i) => {
    ext_dict[item.extension] = item;
});
const initial_coverage = {
    matched: {},
    remainder: ext_dict,
    total_unmatched_extensions: Object.keys(ext_dict).length,
    total_matched_extensions: 0,
    total_unmatched_files: profile_1.total_ok_file_count,
    total_matched_files: 0
}


/**
 * This function compares the current coverage with a given registry source, and returns
 * an object that updates the coverage according to that source.
 */
function compare_with_reg(coverage, reg) {
    // Use the Set API to determine the overlap between this registry and the colletion:
    const overlap = new Set(Object.keys(coverage.remainder)).intersection(reg.extensions);

    // Use the results to update the coverage data:
    var matched_files = 0;
    const profile_matched = {};
    const profile_remains = {...coverage.remainder};
    overlap.forEach((extension) => {
        profile_matched[extension] = profile_remains[extension];
        matched_files += profile_remains[extension].file_count;
        delete profile_remains[extension];
    })

    // Return an updated version of the coverage data:
    return {
        reg_id: reg.reg_id,
        matched: profile_matched,
        remainder: profile_remains,
        matched_extensions: overlap.size,
        matched_files: matched_files,
        total_unmatched_extensions: coverage.total_unmatched_extensions - overlap.size,
        total_matched_extensions: coverage.total_matched_extensions + overlap.size,
        total_unmatched_files: coverage.total_unmatched_files - matched_files,
        total_matched_files: coverage.total_matched_files + matched_files,
    };
}

/**
 * Here we loop over all the un-used registries to work out which one gives the most coverage
 */
function get_next_best_reg(currentCoverage, sources) {
    const candidates = [];
    sources.forEach((reg_id) => { 
        const reg = exts.find( (r) => r.reg_id == reg_id );
        if( reg ) {
            const next = compare_with_reg(currentCoverage, reg);
            candidates.push(next);
        }
    });
    // Sort by number of files:
    return candidates.sort( (a,b) => a.total_matched_files < b.total_matched_files ? 1 : -1 );
}
```

```js
const always_pronom_first = view(Inputs.toggle({label: html`Always Start With PRONOM?`, value: true}));
```


```js
const sources = new Set(registries);

// Drop PRONOM if it's always first:
if( always_pronom_first ) {
    sources.delete('pronom');
}

const selected_sources = sources; // use registries to select all initially

const selector = view(Inputs.checkbox(sources, {label: "Tools & Registries", value: selected_sources , format: (x) => x}));
```


```js
var starting_coverage = initial_coverage;

if( always_pronom_first ) {
    starting_coverage = get_next_best_reg(initial_coverage, ['pronom']);
    starting_coverage = starting_coverage[0];
}

const candidates = get_next_best_reg(starting_coverage, selector);
```

<div class="grid grid-cols-1">
<div class="card">

```js
Plot.plot({
  title: "Which tools or registries might help the most?",
  subtitle: "Based on potential matches with the selected file extension collection profile.",
  x: { type: 'linear', label: 'Total number of collection file extensions in each registry', grid: true },
  y: { type: 'linear', label: 'Potential number of files that may match based on file extension', grid: true },
  marginLeft: 70,
  color: {legend: true},
  width,
  marks: [
    Plot.ruleY([0]),
    Plot.ruleX([0]),
    Plot.dotX(candidates, {x: "total_matched_extensions", y: "total_matched_files", r: 5, fill: "reg_id", tip: true})
  ]
})
```

</div>
</div>

```js
function generate_coverage_table(coverage_list) {
    return Inputs.table(coverage_list, {
    columns: [
        "reg_id",
        "matched_extensions",
        "matched_files",
        "total_matched_extensions",
        "total_matched_files",
        "total_unmatched_files",
    ],
    header: {
        reg_id: "Registry ID",
        total_matched_extensions: "Total Matched Extensions",
        total_matched_files: "Total Matched Files",
        matched_extensions: "Matched Extensions",
        matched_files: "Matched Files",
        total_unmatched_files: "Total Unmatched Files",
    },
    multiple: false
    })
}

const selection = view(generate_coverage_table(candidates));
```

```js

function generate_extension_table(extension_list, reg_id) {
    const exts = [];
    extension_list.forEach((m) => exts.push( { 
        reg_id: reg_id,
        extension: m.extension,
        file_count: m.file_count
    }));

    return Inputs.table(exts,{
        header: {
            reg_id: "Registry ID",
        },
        sort: "file_count",
        reverse: true
    })
}

if( selection ) {
    display(html`<h4>Extensions matched by ${selection.reg_id}</h4>`);
    view(generate_extension_table(Object.values(selection.matched), selection.reg_id));
} else {
    display(html`<div class="tip">Select a row from the table above to see more detail about the matched formats</div>`);
}

```

### Using All The Registries

TBA, run through all the registries and list the extensions that remain, that are not in any of them.

```js
const coverage = [ initial_coverage ];
initial_coverage['reg_id'] = '';

const source_list = new Set(selector);
// If PRONOM First: do that, and drop from the source_list:
const pronom_coverage = get_next_best_reg(coverage[0], ['pronom'])[0];
coverage.push(pronom_coverage);
source_list.delete("pronom");
// Copy the list size as we're modifying the list:
var source_num = source_list.size;
// Loop through the rest, picking the best coverage each time:
for( var i = 0; i < source_num; i++ ) {
    const results = get_next_best_reg(coverage.slice(-1)[0], source_list);
    const best = results[0];
    source_list.delete(best.reg_id);
    coverage.push(best);
}
view(generate_coverage_table(coverage));
```

<div class="grid grid-cols-1">
<div class="card">

```js
Plot.plot({
    title: "What happens when we use all the registries?",
    subtitle: "Applying all the tools, one by one, in the optimal order.",
    x: { label: 'Registry ID' },
    y: { label: 'Number of unmatchable files', grid: true },
    marginLeft: 70,
    marginBottom: 40,
    color: {legend: true},
    width,
    marks: [
        Plot.ruleY([0]),
        Plot.ruleX([0]),
        Plot.barY(coverage, {x: (d) => (d.reg_id === "" ?  "" : `+${d.reg_id}`), y: "total_unmatched_files", fill: "reg_id", sort: {x: "-y"}, tip: true})
    ]
})
```

</div>
</div>

#### Unique Extensions

```js
const remainder_exts = Object.values(coverage.slice(-1)[0].remainder);
view(generate_extension_table(remainder_exts, null));
```


## Feedback & Futures

- Ideas? Decide and store formats?