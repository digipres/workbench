# Tools For Collections
## Using Format Profiles To Compare Collections Against Format Registries

## Introduction

We'd like to be able to compare our collections with the various format registries and identification tools that are out there. This would help us understand which format information sources have the most potential to illuminate our collections.

```js
import { load_extension_data, make_link } from "../registries.js";
import { extractCombinations, render } from 'npm:@upsetjs/bundle';
import { save_dataset } from "../csv_helper.js";
import { get_profiles, process_profile, get_local_profile_folder } from './profiles.js';
const source_profiles = get_profiles();

// Load registry data:
const exts = await load_extension_data();

const registries = new Set();
exts.forEach( function (item, index) {
    // Store the registry IDs:
    registries.add(item.reg_id);
});


```

```js

// Go through the profiles:
// n.b. best to create new top-level objects in blocks, rather than update existing ones, as that makes if easier for Observable Framework to keep track of block dependencies:
const profiles = [];
source_profiles.forEach((p) => profiles.push(process_profile(p)));

```


```js
// output the table:
const profile_overview = view(Inputs.table(source_profiles, {
    columns: [
        "title",
        "terms",
        "link",
        "total_count",
    ],
    header: {
        title: "Title",
        terms: "Terms",
        link: "Link",
        total_count: "Total Files",
    },
    format: {
        link: (d) => html`<a href="${d}" target="_blank">[open]</a>`
    },
    width: {
        title: "50%",
        terms: "10%",
        total_count: "15%",
    },
    sort: "title",
    multiple: false,
    rows: 20,
}));
```

```js
// Define defaults:
var default_1 = "yul";
var default_2 = "kb-edepot";

if( profile_overview ) {
    // Override default:
    default_1 = profile_overview.key;
    // And display:
    display(html`<div class="tip" label="${profile_overview.title}">
    <p>${profile_overview.description}</p>
    <table class="table">
    <tbody>
    <tr><th>Total Extensions</th><td>${d3.format(",")(profile_overview.raw_data.length)}</td></tr>
    <tr><th>Total Files</th><td>${d3.format(",")(profile_overview.total_count)}</td></tr>
    <tr><th>Total Unique, Usable Extensions</th><td>${d3.format(",")(profile_overview.ok_data_all.length)}</td></tr>
    <tr><th>Total Files With Usable Extensions</th><td>${d3.format(",")(profile_overview.total_ok_count)}</td></tr>
    <tr><th>Total <abbr title="Total number of extensions that could not be used, e.g. contained spaces, or were just numbers.">Unusable</abbr> Extensions</th><td><abbr title="${profile_overview.strange_extensions}">${d3.format(",")(profile_overview.strange.length)}</abbr></td></tr>
    <tr><th>Total Files With Unusable Extensions</th><td>${d3.format(",")(profile_overview.total_strange_count)}</td></tr>
    <tr><th>Frequency Cutoff</th><td>${profile_overview.frequency_cutoff}</td></tr>
    <tr><th>Truncated At</th><td>${profile_overview.truncated_at}</td></tr>
    <tr><th>Terms</th><td>${profile_overview.terms}</td></tr>
    <tr><th>Link</th><td>${ profile_overview.link && html`<a href="${profile_overview.link}">Click here for more information</a>` }</td></tr>
    </tbody>
    </table>
    </div`);
} else {
    display(html`<div class="tip">Select a row from the table to find out more.</div>`);
}

```



<details class="card">
<summary>Configuration Options</summary>

It usually makes sense to ignore extremely rare file extensions. Often, these are simply errors, but also some collections are so large that dropping some of the 'long tail' of formats helps make the analysis a bit easier. You can see this by changing the value here, and observing how this affects the frequency plot below.

```js
const count_threshold = view(Inputs.range([0, 10000], {step: 1, value: 1, label: "Ignore Extensions With A File Count Lower Than:" }));
```

It may be that whoever is generating the format profile is concerned that some personal data may leak out through the file extension, and so extensions are truncated so that there is a limit to how much information they can contain. Generally, this is not needed, but if you know that one of the collections you are interested in has truncated the file extensions, this configuration should be set to match, so that the comparison can be as accurate as possible.

```js
const extensions_truncated_at = view(Inputs.range([0, 100], {step: 1, value: 100, label: "Truncate Extensions Longer Than (Characters):" }));
```

Limit number of extensions included in the analysis, as otherwise the graphs and charts will be overwhelmed.

```js
const max_extension_count = view(Inputs.range([0, 500], {step: 10, value: 200, label: "Maximum number of extensions to include:" }));
```

</details>



## Select A Collection Profile

First, we need to select 'our' profile, the primary collection profile we want to compare with other collections and registries:

```js

// Select
const profile_1_source = view(
  Inputs.select(source_profiles, {
    label: "Primary Profile",
    format: (t) => t.title,
    value: source_profiles.find((t) => t.key === default_1),
    width: "100%",
  })
);
```


### Summary of Your Collection Profile

```js
const profile_1 = profiles.find((p) => p.key === profile_1_source.key );
```

## Tool & Registry Coverage

We can use similar methods to compare our primary collection profile with the available format registries and identification tools. This should help us understand what tools might be able to help analyse our collections.

We look at answering this in two ways. Firstly, what single additional tool or registry should I consider, in order to identify as many files as possible? Secondly, if I used all the available tools and registries, what kind of format coverage might I get?


## Adding One Registry

Here, we take your selected collection profile, and work out how much coverage of that set of extensions each registry or tool offers.

```js

const ext_dict = {}
var threshold_total = 0;
profile_1.ok_data_threshold.forEach( (item, i) => {
    ext_dict[item.extension] = item;
    threshold_total += item.count;
});
const initial_coverage = {
    matched: {},
    remainder: ext_dict,
    total_unmatched_extensions: Object.keys(ext_dict).length,
    total_matched_extensions: 0,
    total_unmatched_files: threshold_total,
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
        matched_files += profile_remains[extension].count;
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

As most digital preservation systems and workflows will already include an identification step using PRONOM data (e.g. via DROID, Siegfried or Fido), we start by comparing everything to PRONOM and consider those extensions to be covered. If that doesn't suite you, you can switch it off here:

```js
const always_pronom_first = view(Inputs.toggle({label: html`Always Start With PRONOM?`, value: true}));
```

```js
var starting_coverage = initial_coverage;

if( always_pronom_first ) {
    const starting_coverage_list = get_next_best_reg(initial_coverage, ['pronom']);
    starting_coverage = starting_coverage_list[0];
    view(generate_coverage_table(starting_coverage_list));
} else {
    display(html` `);
}
```

Then, we get to choose which of the other supported tools and registries to consider.  This defaults to 'all of them', but you might want to switch off ones you don't want to use.

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
const candidates = get_next_best_reg(starting_coverage, selector);
```

Given this starting point, what tool/registry might help understand the largest number of files? We can start by plotting the number of recognised extensions and the corresponding total file count for each one:

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
    Plot.dotX(candidates, {x: "total_matched_extensions", y: "total_matched_files", r: 5, fill: "reg_id", tip: true})
  ]
})
```

</div>
</div>

The underlying data is shown here, and you can select one of the rows to see what extensions are being matched by each tool.

```js
function generate_coverage_table(coverage_list) {
    return Inputs.table(coverage_list, {
    columns: [
        "reg_id",
        "matched_extensions",
        "matched_files",
        "total_unmatched_extensions",
        "total_unmatched_files",
    ],
    header: {
        reg_id: "Registry ID",
        matched_files: "Matched Files",
        matched_extensions: "Matched Extensions",
        total_unmatched_extensions: "Total Unmatched Extensions",
        total_unmatched_files: "Total Unmatched Files",
    },
    multiple: false
    })
}
```

```js
const selection = view(generate_coverage_table(candidates));
```

```js

function generate_extension_table(extension_list, reg_id) {
    const exts = [];
    extension_list.forEach((m) => {
        const entry = {};
        // Add optional Registry ID:
        if( reg_id ) {
            entry.reg_id = reg_id;
        }
        // Add standard columns:
        entry.extension = m.extension;
        entry.count = m.count;
        // Store:
        exts.push(entry);
    });

    return Inputs.table(exts,{
        header: {
            reg_id: "Registry ID",
            extension: "Extension",
            count: "File Count",
        },
        format: {
            extension: (d) => make_link(d, reg_id),
        },
        sort: "count",
        reverse: true
    })
}

if( selection ) {
    display(html`<h4>Extensions matched by ${selection.reg_id}</h4>`);
    view(generate_extension_table(Object.values(selection.matched), selection.reg_id));

    view(Inputs.button("Save this table as CSV...", {value: { data: Object.values(selection.matched), columns: ['extension', 'count' ], name: `matched-by-${selection.reg_id}` }, reduce: save_dataset }));
} else {
    display(html`<div class="tip">Select a row from the table above to see more detail about the matched formats.</div>`);
}

```


## Using All The Registries

Rather than just using one registry, what if we tried them all? Here, we run the analysis above multiple times, and each time around, we take the registry that provides the greatest improvement in overall coverage.

As a table, we can see what happens at each stage, and how the total number of files without any potential matches drops each time.

```js
const coverage = [ initial_coverage ];
initial_coverage['reg_id'] = '';

const source_list = new Set(selector);
// If PRONOM First: do that, and drop from the source_list:
if( always_pronom_first ) {
    const pronom_coverage = get_next_best_reg(coverage[0], ['pronom'])[0];
    coverage.push(pronom_coverage);
    source_list.delete("pronom");
}
// Copy the list size as we're modifying the list:
var source_num = source_list.size;
// Loop through the rest, picking the best coverage each time:
for( var i = 0; i < source_num; i++ ) {
    const results = get_next_best_reg(coverage.slice(-1)[0], source_list);
    const best = results[0];
    source_list.delete(best.reg_id);
    coverage.push(best);
}
const cover_selection = view(generate_coverage_table(coverage));
```

```js
if( cover_selection ) {
    display(html`<h4>Extensions matched by ${cover_selection.reg_id}</h4>`);

    view(generate_extension_table(Object.values(cover_selection.matched), cover_selection.reg_id));

    view(Inputs.button("Save this table as CSV...", {value: { data: Object.values(cover_selection.matched), columns: ['extension', 'count' ], name: `combined-matched-by-${cover_selection.reg_id}`  }, reduce: save_dataset }));

} else {
    display(html`<div class="tip">Select a row from the table above to see more detail about the matched formats.</div>`);
}
```


Plotting that as a graph, we can see the overall benefit each tool brings.

<div class="grid grid-cols-1">
<div class="card">

```js
Plot.plot({
    style: "font-size: 20px;",
    title: "How well do the whole set of registries cover our collection extensions?",
    subtitle: "Starting from scratch, applying all the tools one by one, in the optimal order.",
    x: { label: 'Registry ID', tickRotate: -30 },
    y: { label: 'Total Unmatchable Extensions', grid: true, type: 'linear' },
    marginRight: 70,
    marginBottom: 80,
    marginTop: 40,
    marginLeft: 70,
    color: {legend: true},
    width,
    marks: [
        Plot.ruleY([0]),
        Plot.barY(coverage, {x: (d) => (d.reg_id === "" ?  "" : `+${d.reg_id}`), y: "total_unmatched_extensions", fill: "reg_id", r: 5, sort: {x: "-y"}, tip: true}),
    ]
})
```

</div>
<div class="card">

```js
Plot.plot({
    title: "How well do the whole set of registries cover our collection files?",
    subtitle: "Starting from scratch, applying all the tools one by one, in the optimal order.",
    x: { label: 'Registry ID' },
    y: { label: 'Total Unmatchable Files', grid: true, type: 'log' },
    marginLeft: 70,
    marginBottom: 40,
    color: {legend: true},
    width,
    marks: [
        Plot.ruleY([1]),
        Plot.barY(coverage, {x: (d) => (d.reg_id === "" ?  "" : `+${d.reg_id}`), y1: 1, y2: "total_unmatched_files", fill: "reg_id", r: 5, sort: {x: "-y"}, tip: { format: { "y1": false }}}),
    ]
})
```

</div>
</div>

## Unique Extensions

Finally, we can look at the unique extensions: those that are in your collection profile, but do not appear to be in any of the thousands of format records aggregated across all the registries. These don't have a _Registry ID_ or a link to the _Format Index_, because they do not appear in any of the sources we have.

```js
const remainder_exts = Object.values(coverage.slice(-1)[0].remainder);
view(generate_extension_table(remainder_exts, null));
```

```js
const uniques_save_button = view(Inputs.button("Save this as a CSV file...", {value: { data: remainder_exts, columns: ['extension', 'count' ], name: `unique-extensions`  }, reduce: save_dataset }));
```

As this data comes from real collections, many of these will reflect the myriad ways file extensions are used and abused in the wild. Nevertheless, the findings so far seem to show that every reasonably large collection has a significant number of files with _genuine_ format extensions that are not in _any_ registry! 

This distribution of formats is important for the wider community to analyse, in order to understand how best to address the format identification problem. So, please get in touch if you are able to share your collections format profiles!

## Feedback & Futures

This is a first prototype of this kind of analysis tool, and we are keen to hear your feedback on what works, what doesn't, and what a future version could look like!

It will be launched at [iPRES 2024](https://ipres2024.pubpub.org/), as part of the [Digital Preservation Registries: What We Have & What We Need](https://ipres2024.pubpub.org/pub/52dby49z/release/1?readingCollection=ef524688) workshop. But if you see us at the conference you are encouragedto ask us to walk you through using this tool and talk to us about sharing your own format profiles.

You can also get in touch with us directly. See the [contact details on the homepage](../#contact).
