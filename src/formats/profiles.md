# Collection Profiles
## Using Format Profiles to Compare Collections & Registries

## Introduction

Here we look at two different ways of exploring and understanding our digital collections.

- We'd like to be able to compare our collections with those of other institutions, so we can find our common ground, but also understand what makes us distinctive.
- We'd like to be able to compare our collections with the various format registries and identification tools that are out there. This would help us understand which format information sources have the most potential to illuminate our collections.

This page provides interactive tools allowing you to do both of these things, based on some basic statistical information about your collection in the form of a format profile.

## Collection Format Profiles

A format profile for a collection simply lists all the formats there are, along with a count of how many distinct files or bitstreams appear to be in that format. For example, this is precisely what the [UK National Archives File Profiling Tool (DROID) does](https://www.nationalarchives.gov.uk/information-management/manage-information/policy-process/digital-continuity/file-profiling-tool-droid/). For the formats that PRONOM covers, this works very well, and the resulting profile can be analysed within DROID itself, or by using complementary tools like [Freud](https://github.com/digital-preservation/freud) or [Demystify](http://exponentialdecay.co.uk/blog/demystify-lite-and-demystify-2-0-0-released/).

However, to compare against a wider range of sources, we need to boil things down to the simplest format signature: file extensions. This lets us combine multiple information sources, with [all of the benefits and limitations that implies](./#file-extensions).

A number of institutions have already made suitable file extension collection profiles available, so you can use those to explore this idea. Note that this analysis discards any extensions that appear to be just numbers or contain spaces, but anything else is OK. If you want to look at the source CSV files, you can find them [here](https://github.com/digipres/workbench/tree/main/src/data/collection-profiles).

<div class="warning">
<p>These profiles have been generously generated and shared on a best-effort basis. They may cover all holdings, or not. They may include the results from peeking inside container/archive formats, or not. It's surprisingly difficult to generate this information, and these profiles should not be considered a complete and accurate reflection of all the different items an institution holds.
</p>
<p>
Crucially, unlike more formal format registries, collection profiles reflect the endlessly inventive chaos of real people doing real things in the real world. These file extensions cannot be trusted, but <a href="https://www.reddit.com/r/calvinandhobbes/comments/rmfnsc/theres_treasure_everywhere/">there's treasure everywhere.</a>
</p>
</div>

```js
import { load_extension_data, make_link } from "./registries.js";
import { extractCombinations, render } from 'npm:@upsetjs/bundle';
import { save_dataset } from "./csv_helper.js";

// Load registry data:
const exts = await load_extension_data();

const registries = new Set();
exts.forEach( function (item, index) {
    // Store the registry IDs:
    registries.add(item.reg_id);
});


// Load collections profile data:
const original_profiles = [
  {
    key: "yul",
    title: "Yale University Library DPS (No ID) 2024-04-01",
    link: "https://guides.library.yale.edu/digitalpreservationsystem",
    terms: "CC-BY",
    description: "Only includes extensions from items not identified by DROID.",
    frequency_cutoff: 5, // Extensions with less than this many files are ignored.
    raw_data: await FileAttachment("../data/collection-profiles/yale/YUL-not-identified-extensions-2024-04-01.csv").csv({typed: true})
  },
  {
    key: "yul-nu",
    title: "Yale University Library DPS (ID Not Unique) 2024-03-28",
    link: "https://guides.library.yale.edu/digitalpreservationsystem",
    terms: "CC-BY",
    description: "Only includes extensions with no unique identification when using DROID, e.g. multiple format ID matches.",
    frequency_cutoff: 5, // Extensions with less than this many files are ignored.
    raw_data: await FileAttachment("../data/collection-profiles/yale/YUL-not-uniquely-identified-extensions-2024-03-28.csv").csv({typed: true})
  },
  {
    key: "kb-edepot",
    title: "KB eDepot 2014-03",
    terms: "CC-BY",
    link: "https://www.bitsgalore.org/2015/04/29/top-50-file-formats-in-the-kb-e-depot",
    raw_data: await FileAttachment("../data/collection-profiles/kb/KB-eDepot-FExtensions-v3-2014-03.csv").csv({typed: true})
  },
  {
    key: "nara-era",
    title: "NARA ERA 2024-09-10",
    terms: "CC0 1.0 Universal",
    link: "https://github.com/usnationalarchives/digital-preservation/tree/master/File_Extensions",
    truncated_at: 6,
    description: html`NARA’s dataset is not an exact, up-to-date representation of every file extension and count in NARA’s electronic records holdings. The extensions and counts provided are generated by combining reports from various preservation systems for Federal, Legislative, and Presidential electronic records. In this dataset, extensions with a count of less than 100 have been truncated to 6 characters. Files with no extension (null values) have been excluded from this dataset. NARA will post updated versions of this dataset on GitHub: <a href="https://github.com/usnationalarchives/digital-preservation/tree/master/File_Extensions">https://github.com/usnationalarchives/digital-preservation/tree/master/File_Extensions</a>.`,
    raw_data: await FileAttachment("../data/collection-profiles/nara/NARA-ERA-Format-Profile-2024-09-10.csv").csv({typed: true})
  },
  {
    key: "hl-drs",
    title: "Harvard Library DRS 2024-06-06",
    link: "https://preservation.library.harvard.edu/digital-preservation-repository",
    terms: "CC-BY",
    raw_data: await FileAttachment("../data/collection-profiles/harvard/Harvard-Library-DRS-2024-06-06.csv").csv({typed: true})
  },
  {
    key: "lc-2020",
    title: "Library of Congress (extracted test set) 2020",
    link: "https://www.loc.gov/about/general-information/",
    terms: "CC-0",
    description: "This file extension profile represents an extracted test set of items and do not accurately represent the full holdings of the Library of Congress.",
    raw_data: await FileAttachment("../data/collection-profiles/loc/LoC-2020.csv").csv({typed: true})
  },
  {
    key: "lc-2022",
    title: "Library of Congress (extracted test set) 2022",
    link: "https://www.loc.gov/about/general-information/",
    terms: "CC-0",
    description: "This file extension profile represents an extracted test set of items and do not accurately represent the full holdings of the Library of Congress.",
    raw_data: await FileAttachment("../data/collection-profiles/loc/LoC-2022.csv").csv({typed: true})
  },
  {
    key: "lc-2024",
    title: "Library of Congress (extracted test set) 2024",
    link: "https://www.loc.gov/about/general-information/",
    terms: "CC-0",
    description: "This file extension profile represents an extracted test set of items and do not accurately represent the full holdings of the Library of Congress.",
    raw_data: await FileAttachment("../data/collection-profiles/loc/LoC-2024.csv").csv({typed: true})
  },
  {
    key: "cul-ts-2024",
    title: "Cambridge University Library Transfer Service 2024-04",
    link: "https://www.lib.cam.ac.uk/digitalpreservation/services/transfer-service",
    terms: "CC-BY",
    raw_data: await FileAttachment("../data/collection-profiles/cambridge/Transfer_Service_CUL_File_Extensions-2024-04.csv").csv({typed: true})
  },
  {
    key: "frdr-2024",
    title: "Digital Research Alliance of Canada FRDR 2024-03",
    link: "https://www.frdr-dfdr.ca/repo/",
    description: "The Digital Research Alliance of Canada's Federated Research Data Repository (FRDR).",
    terms: "CC-BY",
    raw_data: await FileAttachment("../data/collection-profiles/drac/Alliance-FRDR-2024-03.csv").csv({typed: true})
  },
  {
    key: "anz-2024",
    title: "Archives New Zealand 2024-09",
    link: "https://www.archives.govt.nz/",
    description: "",
    terms: "CC-BY",
    raw_data: await FileAttachment("../data/collection-profiles/anz/ANZ_extensions_2024-09.csv").csv({typed: true})
  },
  {
    key: "bac-lac-2024",
    title: "Library and Archives Canada 2024-09",
    link: "https://library-archives.canada.ca/",
    description: "",
    terms: "CC-BY",
    raw_data: await FileAttachment("../data/collection-profiles/bac-lac/20240905_LAC_DPFiles_byExtensionFileCount.csv").csv({typed: true})
  },
  {
    key: "nln-2024",
    title: "The National Library of Norway 2024-10",
    link: "https://nb.no/",
    description: "",
    terms: "CC-BY",
    raw_data: await FileAttachment("../data/collection-profiles/nln/2024-10-03-NLN-extensions.csv").csv({typed: true})
  }
]

const user_profile_key = 'your profile';


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
        color: {legend: false, label: "Registry ID", scheme: "Observable10" },
        marginBottom: 100,
        width: width,
        marks: [
            Plot.ruleY([0]),
            Plot.barY(
                profile.ok_data,
                { 
                    y: "count", 
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
// We make sure each 'iteration' of the profiles has a separate name.
// This makes sure the Observable Framework knows which things to update.

// Create the merged profile list
const source_profiles = [];
original_profiles.forEach((p) => source_profiles.push(p));

if( csvfile != null ) {
    const uploaded = await csvfile.csv();
    const uploaded_item = source_profiles.find((p) => p.key == user_profile_key);
    if( uploaded_item ) {
        uploaded_item.raw_data = uploaded
    } else {
        source_profiles.push({
        key: user_profile_key, 
        title: "Your uploaded extension profile",
        raw_data: uploaded
        });
    };
}


// Go through the profiles:
// n.b. best to create new top-level objects in blocks, rather than update existing ones, as that makes if easier for Observable Framework to keep track of block dependencies:
const profiles = [];
source_profiles.forEach((p) => profiles.push(process_profile(p)));

// Clean up the data a bit:
function process_profile(profile) {
    profile['strange'] = [];
    profile['ok_data'] = [];
    profile['ok_data_threshold'] = [];
    profile['ok_data_all'] = [];
    profile['total_ok_count'] = 0;
    profile['total_strange_count'] = 0;
    profile['total_count'] = 0;
    const count_by_extension = {};
    profile.raw_data.forEach( function (raw_item, index) {
        // Clone original item for modification, keeping only needed bits:
        const item = {
            extension: raw_item.extension,
            count: raw_item.count,
        };
        // Ensure the count is a count:
        if( typeof item.count === 'string' || item.count instanceof String ) {
            // Is a string, might have commas in it...
            item.count = parseInt(item.count.replace(/,/g, ''));
        }
        // Check that worked, drop NaNs:
        if( isNaN(item.count) ) {
            // Nope:
            profile.strange.push(item);
            return;
        }
        // Add up the total:
        profile.total_count += item.count;
        // Canonicalize the extension:
        if(  item.extension && typeof item.extension == "string" ) {
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
            if( item.extension.indexOf("*") == -1 && item.extension != "(none)" && item.extension != "NULL" ) {
                item.extension = `*.${ext}`;
            } else {
                // Treat empty extensions as '(none)':
                if( item.extension == "" ) {
                    item.extension = "(none)"
                } else {
                    item.extension = ext;
                }
            }
            // Drop items that have space characters amid:
            if (ext.indexOf(" ") >= 0) {
                profile.strange.push(item);
                profile.total_strange_count += item.count;
            } else {
                // Check if the item is already in, and use that instead if so:
                if( count_by_extension[item.extension]) {
                    count_by_extension[item.extension].count += item.count;
                } else {
                    count_by_extension[item.extension] = item;
                    profile.ok_data_all.push(item);
                }
                profile.total_ok_count += item.count;
            }
        } else {
            // Drop items that are not strings, i.e. numeric
            profile.strange.push(item);
            profile.total_strange_count += item.count;
        }
    });
    // Now go through the ok_data and keep only the:
    // - count_threshold exceeding
    // - top max_extension_count
    // First sort the data by count (DESC)
    profile.ok_data_all.sort((a, b) => a.count < b.count ? 1 : -1);
    // Then slice:
    profile.ok_data_all.forEach((item, i) => {
        if( item.count >= count_threshold && i < max_extension_count ) {
            profile.ok_data.push(item);
        }
        if( item.count >= count_threshold ) {
            profile.ok_data_threshold.push(item);
        }
    });
    return profile;
}
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

//view(Inputs.button("Save All As CSV...", {value: { data: source_profiles, columns: ['title', 'terms', 'link', 'total_count' ], name: "collection-profiles" }, reduce: save_dataset }));
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
    <tr><th>Total <abbr title="Total number of extensions that could not be used, e.g. contained spaces, or were just numbers.">Unusable</abbr> Extensions</th><td>${d3.format(",")(profile_overview.strange.length)}</td></tr>
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




You can also add your own profile to this page, and analyse it without uploading your data anywhere:

```js
const csvfile = view(Inputs.file({label: "Use Your Own CSV Extension Profile", accept: ".csv"}));
```

<details class="card">
<summary>How do I create a suitable Extension Profile in CSV format?</summary>

Your file extension collection profile should have at least two columns, one called 'extension' and one called 'count'. Other columns will be ignored. This would look something like:

| extension | count |
| --------- | ---------- | 
| PDF       |        50  |
| DOCX      |       202  |
| pdf       |        12  |
| ...       |       ...  |

Note that extensions that are just numbers, or contain spaces, will be dropped. Note also that the system will attempt to convert the extensions into a canonical lower-case format, i.e. `*.pdf`, but you can just supply the extension e.g. `pdf` or `.pdf` and it should work it out.

Note that the `count` should be supplied as a plain number, e.g. `1024` rather than formatted like e.g. `1,024`.

If you want to include files with no extension, please use the special value `(no extension)` as the value for the `extension`. If there is a column with an empty string, it will be interpreted as `(no extension)`.

Finally, note that if the same (canonical) extension appears multiple times, the total file count will be add together all occurrences. e.g. in the example above, you'd end up with:

| extension | count |
| --------- | ---------- | 
| *.pdf     |        62  |

If your browser supports it, you can try generating an extension profile of some of your own files with the [DigiPres Workbench File System Scanner](../tools/scanner/).

If you have any problems, please [get in touch via the contact details on the homepage](../#contact).

</details>

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

This graph provides a summary of the selected format profile.

<div class="grid grid-cols-1">
<div class="card">
${ resize((width) => gen_profile_plot(profile_1, width) ) }
</div>
</div>

This gives a reasonable overview, but also hides all the interesting details of what's going on in that long tail of other formats.

## Comparing Collections

The simple format profile above is particularly ill-suited to comparing one collection with another, so here we explore some alternative visualisations.

First, we need to select a different profile to compare against:

```js
const profile_2 = view(
  Inputs.select(profiles, {
    label: "Secondary Profile",
    format: (t) => t.title,
    value: profiles.find((t) => t.key === default_2 ),
    width: "100%",
  })
);

const modes = [
   { mode: "all", title: "All Extensions" },
   { mode: "unique", title: "Unique Extensions Only" },
   { mode: "common", title: "Common Extensions Only" },
];

const compare_mode = view(Inputs.select(modes, {
    label: "Comparison Mode",
    format: (t) => t.title
}));
```

Given this, we can now build up a comparison. We start by going through every file extension that is in either collection, and recording the percentage of the overall collection that represents, in terms of numbers of files. We do this because using percentages means we can compare collections of very different sizes.

These percentages can be plotted directly against each other for each file format, with the vertical position representing the percentage in our primary collection, and the horizontal position representing the percentage in the secondary collection.  Similar collections should appear as a diagonal line, with outliers representing where collections differ.

```js
// Loop over profile_1, finding items in profile_2, and comparing
const differences = [];
var largest_percentage = 0.0;
profile_1.ok_data.forEach((item, index) => {
    // Look up matched items, allowing the search to go into the non-truncated data to make sure we find things:
    const item_2 = profile_2.ok_data_threshold.find((i) => i.extension == item.extension);
    var item_2_count = 0;
    var relation = 'primary only'
    if( item_2 && item_2.count > 0.0 ) {
        item_2_count = item_2.count;
        relation = 'in common'
    }
    // Drop depending on mode:
    if( compare_mode.mode == "unique" && relation == 'in common') {
        return;
    }
    if( compare_mode.mode == "common" && relation == 'primary only') {
        return;
    }
    // Calculate percentages:
    const percentage_1 = 100.0 * item.count/profile_1.total_ok_count;
    const percentage_2 = 100.0 * item_2_count/profile_2.total_ok_count;
    differences.push({
        extension: item.extension,
        percentage_1,
        percentage_2,
        percentage_diff: (percentage_1 - percentage_2),
        relation,
    });
    // Record the largest percentage:
    if( percentage_1 > largest_percentage ) {
        largest_percentage = percentage_1;
    }
    if( percentage_2 > largest_percentage ) {
        largest_percentage = percentage_2;
    }
})
// Loop over profile_2, adding any uniques in:
profile_2.ok_data.forEach((item, index) => {
    // Look up matched item, allowing the search to go into the non-truncated data to make sure we find things:
    const item_1 = profile_1.ok_data_threshold.find((i) => i.extension == item.extension);
    var item_1_count = 0;
    var relation = 'secondary only'
    if( item_1 && item_1.count > 0.0 ) {
        // Already dealt with these on the first pass.
        return;
    }
    // Drop depending on mode:
    if( compare_mode.mode == "common") {
        return;
    }
    // Calculate percentages:
    const percentage_1 = 0.0;
    const percentage_2 = 100.0 * item.count/profile_2.total_ok_count;
    differences.push({
        extension: item.extension,
        percentage_1,
        percentage_2,
        percentage_diff: (percentage_1 - percentage_2),
        relation,
    });
    if( percentage_2 > largest_percentage ) {
        largest_percentage = percentage_2;
    }
})


// Channels to show:
const diff_channels =  { Relation: "relation", Extension: "extension", "%tage of Primary Collection": "percentage_1","%tage of Secondary Collection": "percentage_2", "Difference of %tages": "percentage_diff" };
```

<div class="grid grid-cols-1">
<div class="card">

```js
Plot.plot({
  title: "Comparing Collections Based on Extension Percentages",
  x: { type: 'sqrt', grid: true, label: `%tage of ${profile_2.title}`, domain: [0,largest_percentage] },
  y: { type: 'sqrt', grid: true, label: `%tage of ${profile_1.title}`, domain: [0,largest_percentage] },
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

We can use a ['beeswarm' plot](https://datavizcatalogue.com/blog/chart-snapshot-beeswarm-plot/) to really focus on on the difference in percentages. Here, we calculate the difference between the percentages for each extension, and plot that difference vertically. This means formats that are distinctive of our primary collection appear near the top, and those distinctive of the secondary collection appear at the bottom.  Rarer and similar extensions bunch up in the middle.

<div class="grid grid-cols-1">
<div class="card" style="overflow: hidden">

```js
Plot.plot({
    title: "Beeswarm Plot of Differences in Percentages",
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
</div>

### Comparison Data

The comparison data used to generate the above plots can be viewed and downloaded here:

```js

    view(Inputs.table(differences, {
    header: {
        extension: "Extension",
        percentage_1: "Primary %",
        percentage_2: "Secondary %",
        percentage_diff: "Δ%",
        relation: "Relation",
    },
    sort: 'percentage_diff',
    reverse: true,
    select: false
    }));

view(Inputs.button("Save as CSV...", {value: { data: differences, columns: ['relation', 'extension', 'percentage_1', 'percentage_2', 'percentage_diff' ], name: "profile-comparison" }, reduce: save_dataset }));
```

Take care to note which collection is the primary and which is the secondary.


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
    title: "How well do the whole set of registries cover our collection extensions?",
    subtitle: "Starting from scratch, applying all the tools one by one, in the optimal order.",
    x: { label: 'Registry ID' },
    y: { label: 'Total Unmatchable Extensions', grid: true, type: 'linear' },
    marginLeft: 70,
    marginBottom: 40,
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
