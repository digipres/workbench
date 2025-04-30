# Format Diversity Estimation
## Estimating the total number of digital formats

This analysis uses data from the various registries to build a [Species Accumulation Curve](https://en.wikipedia.org/wiki/Species_discovery_curve), which is an approach used in ecology to estimate the number of species in a given ecosystem[^1]. If we treat each format registry as a random sample of the whole ecosystem of data formats, we can combine the series of samples and count how many new formats are added each time a sample is added to the overall set. Overall, the number of new formats being discovered would be expected to decrease as more samples are added, roughly converging towards an estimate for the total global diversity of digital data formats.

<div class="warning">
The analysis on this page is fairly complicated, so it might take a few moments for it to run and display.
</div>


## Method

We start by looking at the overall 'uniqueness' of each registry, by looking at how many extensions are unique to each registry.

We then sort the registries in order of descending overall sample size (e.g. how many distinct extensions each holds), and treat each one as a sample of the total set of data formats.  We add each in turn, counting the new extensions at each step, with each sample.

Finally, we fit a curve to this data based on the expected form, and extrapolate to determine an estimate for the total number of data formats.

Because we are reducing all the registry data down to file extensions, the assumptions and caveats outlined [here](./#file-extensions) should be kept in mind.  In particular, given that multiple distinct formats may use the same file extension, this analysis should be considered as establishing a conservative lower-bound on the number of formats.

## Uniqueness

To understand how distinct the holdings of each registry are, we can plot the percentage of unique entries versus the total number of entries.  If all registries were truly random samples of the totality of data formats, we would expect a broadly linear trend. In other words, we would expect larger registries to contain a larger percentage of unique entries.

```js
import {load_extension_data} from "./registries.js";

const exts = await load_extension_data();

// Now loop through them, working out how many new extensions are added at each stage:
var all_exts = new Set([]);
var sample_total = 0;

// Calculate the Species Accumulation Curve:
exts.forEach( function (item, index) {
    sample_total += item.extensions.size;
    const current_total = all_exts.size;
    all_exts = all_exts.union(item.extensions);
    // Record the new total species count and how many were added this round:
    item.sac_sample_total = sample_total;
    item.sac_unique_total = all_exts.size;
    item.sac_added = all_exts.size - current_total;
});

```

<div class="card">

```js
Plot.plot({
    style: "overflow: visible; font-size: 20px;",
    y: {grid: true, label: "Unique Extensions (%)", domain: [0,100] },
    x: {grid: true, label: "Total Extensions" },
    color: {legend: false, label: "Registry ID"},
    width,
    marginRight: 70,
    marginBottom: 60,
    marginTop: 40,
    marginLeft: 50,
    marks: [
        Plot.ruleX([0]),
        Plot.ruleY([0]),
        Plot.axisY({label: "Percentage of File Extensions Unique to Each Format Registry"}),
        Plot.axisX({label: "Total Number of File Extensions in Format Registry Records"}),
        Plot.dot(exts, {x: "num_extensions", y: "percent_unique", fill: "reg_id", r:8, sort: { y: "x" }, tip: true }),
        Plot.text(exts, {x: "num_extensions", y: "percent_unique", text: (d) => d.reg_id, dx:10, textAnchor: "start"})
    ]
})
```

</div>

This plot shows that different registries have their own character. For example, as one might expect the GitHub Linguist set has a large number of distinct entries, especially given it's relatively small size. This is likely because it specialises in looking at source code files and related formats likely to be found in GitHub repositories.

It is notable that the `fdd` and `pronom` have relatively low percentages of unique extensions. This makes sense as it reflects the way those efforts have tended to prioritise coverage of the most widely used formats.


## Species Accumulation Curve

The results of the final species accumulation curve are shown below.

```js
import { regressionLog } from 'npm:d3-regression';
import * as Plot from "npm:@observablehq/plot";

// Wrap the fit and plot in a Promise so it shows as a 'busy' indicator when viewed in the browser:
const fit_chart = new Promise((resolve) => {

    // Define the fit type:
    const reg = regressionLog()
        .x(d => d.sac_sample_total)
        .y(d => d.sac_unique_total)
        .domain([1000, 20000]);

    // Find the fit, which has parameters: a, b, rSquared, 'predict' (function to predict y from x)
    const fit = reg(exts);

    // Generate a plottable array from the regression fit:
    const fit_x = Array.from({ length: 110 }, (v, i) => 2000 + i*500);
    const fit_data = []
    fit_x.forEach( function(item,index) {
        fit_data.push({
            x: item,
            y: fit.predict(item)
        })
    });

    // Create a plot that combines the raw data and the fit:
    resolve(
        Plot.plot({
            style: "overflow: visible; font-size: 20px;",
            y: {grid: true, label:"Cumulative Unique Extensions" },
            x: {grid: true, label:"Cumulative Total Extensions" },
            color: {legend: true, label: "Registry ID", swatchSize: 20, style: "font-size: 16px"},
            width,
            marginRight: 70,
            marginBottom: 60,
            marginTop: 40,
            marginLeft: 70,
            marks: [
                Plot.ruleY([0]),
                Plot.axisY({label: "Cumulative Total of Unique File Extensions Across Registries"}),
                Plot.ruleX([0]),
                Plot.axisX({label: "Cumulative Total Number of All File Extensions in Format Registry Records"}),
                Plot.lineY(fit_data, {x: 'x', y: 'y' }),
                Plot.dot(exts, {x: "sac_sample_total", y: "sac_unique_total", stroke: "reg_id", fill: "reg_id", channels: {"Unique Extensions Added": "sac_added", "Total Number of Extensions": "num_extensions" }, tip: true })
            ]
        })
    );

} );
```

<div class="card">

```js
fit_chart
```

</div>

This indicates that a conservative lower-bound on the total number of formats we might expect to come across is around 12,000, but given the variation between the data points and the fitted curve, this is only an approximate answer.

## Conclusions

Even allowing for a significant degree of error in the estimation process, it is clear that the total number of formats we wish to understands is well in excess of even the many thousands of records in _WikiData_.

This has significant consequences for the handling of digital material. These include:

- As the majority of formats are _not_ known to PRONOM, it is _not_ appropriate to block the ingest of _born-digital_ items into the safe storage space of a repository service just because it cannot be identified yet.
- Digital repositories should make it easy to re-run format identification processes across our collections, as the tools improve.

Further work is required to understand:

- The size of collections that remain unknown.
- How the distribution of importance or value is or is not related to format.
- The costs and human effort required to populate registries.
- Whether centralised approaches to registries can cope with these realities.
- What other approaches might work, and what are the consequences.

The work on [Using Collection Profiles](./profiles) aims to help explore some of these issues.



[^1]: Ugland, K.I., Gray, J.S. and Ellingsen, K.E. (2003), The species–accumulation curve and estimation of species richness. Journal of Animal Ecology, 72: 888-897. <https://doi.org/10.1046/j.1365-2656.2003.00748.x>