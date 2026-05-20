# Collection Profiles
## Using Format Profiles to Compare Collections & Registries

## Introduction

We'd like to be able to compare our collections with those of other institutions, so we can find our common ground, but also understand what makes us distinctive.

```js
import { load_extension_data, make_link } from "../registries.js";
import { extractCombinations, render } from 'npm:@upsetjs/bundle';
import { save_dataset } from "../csv_helper.js";
import { get_profiles, process_profile } from './profiles.js';

// Load registry data:
const exts = await load_extension_data();

const registries = new Set();
exts.forEach( function (item, index) {
    // Store the registry IDs:
    registries.add(item.reg_id);
});


// Load and process the profiles:
const source_profiles = await get_profiles();
const profiles = [];
source_profiles.forEach((p) => profiles.push(process_profile(p, extensions_truncated_at, max_extension_count, count_threshold)));


```
## Select A Collection Profile

First, we need to select 'our' profile, the primary collection profile we want to compare with other collections and registries:

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


```js
var default_1 = 'yul';
if( profile_overview ) {
    default_1 = profile_overview.key;
}

const profile_1 = view(
  Inputs.select(profiles, {
    label: "Primary Profile",
    format: (t) => t.title,
    value: profiles.find((t) => t.key === default_1),
    width: "100%",
    disabled: true
  })
);

```

The simple format profile above is particularly ill-suited to comparing one collection with another, so here we explore some alternative visualisations.

First, we need to select a different profile to compare against:

```js
const profile_2 = view(
  Inputs.select(profiles, {
    label: "Secondary Profile",
    format: (t) => t.title,
    value: profiles.find((t) => t.key === 'kb-edepot' ),
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

