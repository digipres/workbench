# Collection Profiles
## Using Format Profiles to Compare Collections & Registries

## Introduction

A format profile for a collection simply lists all the formats there are, along with a count of how many distinct files or bitstreams appear to be in that format. For example, this is precisely what the [UK National Archives File Profiling Tool (DROID) does](https://www.nationalarchives.gov.uk/information-management/manage-information/policy-process/digital-continuity/file-profiling-tool-droid/). For the formats that PRONOM covers, this works very well, and the resulting profile can be analysed within DROID itself, or by using complementary tools like [Freud](https://github.com/digital-preservation/freud) or [Demystify](http://exponentialdecay.co.uk/blog/demystify-lite-and-demystify-2-0-0-released/).

However, to compare against a wider range of sources, we need to boil things down to the simplest format signature: file extensions. This lets us combine multiple information sources, with [all of the benefits and limitations that implies](./#file-extensions).

A number of institutions have already made suitable file extension collection profiles available, so you can use those to explore this idea. Or you can [add your own!](manage)

<div class="warning">

These profiles have been generously generated and shared on a best-effort basis. They may cover all holdings, or not. They may include the results from peeking inside container/archive formats, or not. It's surprisingly difficult to generate this information, and these profiles should not be considered a complete and accurate reflection of all the different items an institution holds.

Crucially, unlike more formal format registries, collection profiles reflect the endlessly inventive chaos of real people doing real things in the real world. These file extensions cannot be trusted, but <a href="https://www.reddit.com/r/calvinandhobbes/comments/rmfnsc/theres_treasure_everywhere/">there's treasure everywhere.</a>

The analysis process discards any extensions that appear to be just numbers or contain spaces, but anything else is OK. If you want to look at the source CSV files, you can find them [here](https://github.com/digipres/workbench/tree/main/src/data/collection-profiles).

</div>

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

// Go through the profiles:
// n.b. best to create new top-level objects in blocks, rather than update existing ones, as that makes if easier for Observable Framework to keep track of block dependencies:
const profiles = [];
source_profiles.forEach((p) => profiles.push(process_profile(p)));


```


```js
// output the table:
const profile_overview = view(Inputs.table(profiles, {
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



```js
var default_1 = 'yul';
if( profile_overview ) {
    default_1 = profile_overview.key;
}

// Select
const profile_1_source = view(
  Inputs.select(profiles, {
    label: "Selected Profile",
    format: (t) => t.title,
    value: profiles.find((t) => t.key === default_1),
    width: "100%",
    disabled: true
  })
);
```

```js
const profile_1 = profiles.find((p) => p.key === profile_1_source.key );
console.log(profile_1)
```

This graph provides a summary of the selected format profile.

<div class="grid grid-cols-1">
<div class="card">
${ resize((width) => gen_profile_plot(profile_1, width) ) }
</div>
</div>

This gives a reasonable overview, but also hides all the interesting details of what's going on in that long tail of other formats.

## Going Deeper

Lets dig into those long-tailed format distributions.

<div class="grid grid-cols-3">
  <div class="card">
    Take a <a href="./manage">closer look at the profiles that are available, and add in your own local collection profiles too</a>.
  </div>
  <div class="card">
    <a href="./compare">Compare collections across institutions</a>, so we can find our common ground, but also understand what makes us distinctive.
  </div>
  <div class="card">
    <a href="./tools">Compare collections with the various format registries and identification tools that are out there</a>, to help us understand which format information sources have the most potential to illuminate our collections.
  </div>
</div>




## Feedback & Futures

This is a first prototype of this kind of analysis tool, and we are keen to hear your feedback on what works, what doesn't, and what a future version could look like!

It will was launched at [iPRES 2024](https://ipres2024.pubpub.org/), as part of the [Digital Preservation Registries: What We Have & What We Need](https://ipres2024.pubpub.org/pub/52dby49z/release/1?readingCollection=ef524688) workshop.

Feel free to get in touch with us directly. See the [contact details on the homepage](../#contact).
