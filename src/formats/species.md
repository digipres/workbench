# Global Format Diversity

This analysis uses data from the various registries to build a [Species Accumulation Curve](https://en.wikipedia.org/wiki/Species_discovery_curve), which is an approach used in ecology to estimate the number of species in a given ecosystem[^1]. If we treat each format registry as a random sample of the whole ecosystem of data formats, we can combine the series of samples and count how many new formats are added each time a sample is added to the overall set. Overall, the number of new formats being discovered would be expected to decrease as more samples are added, roughly converging towards an estimate for the total global diversity of digital data formats.


## Method

For this analysis, we compare and combine registry data by reducing everything down to file extensions, as outlined [here](./#file-extensions). The assumptions and caveats outlined on that page should be kept in mind when analysing these results.

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

That
```js
const weirdness_chart = Plot.plot({
    style: "overflow: visible;",
    y: {grid: true, label: "Unique Extensions (%)", domain: [0,100] },
    x: {grid: true, label: "Total Extensions" },
    color: {legend: false, label: "Registry ID"},
    marks: [
        Plot.ruleX([0]),
        Plot.ruleY([0]),
        Plot.axisY({label: "Percentage of File Extensions Unique to Each Format Registry"}),
        Plot.axisX({label: "Total Number of File Extensions in Format Registry Records"}),
        Plot.dot(exts, {x: "num_extensions", y: "percent_unique", fill: "reg_id", r:8, sort: { y: "x" }, tip: true }),
        Plot.text(exts, {x: "num_extensions", y: "percent_unique", text: (d) => d.reg_id, dx:10, textAnchor: "start"})
    ]
});

display(weirdness_chart);
```

That

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
            style: "overflow: visible;",
            y: {grid: true, label:"Cumulative Unique Extensions" },
            x: {grid: true, label:"Cumulative Total Extensions" },
            color: {legend: true, label: "Registry ID"},
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

```js
fit_chart
```



[^1]: Ugland, K.I., Gray, J.S. and Ellingsen, K.E. (2003), The species–accumulation curve and estimation of species richness. Journal of Animal Ecology, 72: 888-897. <https://doi.org/10.1046/j.1365-2656.2003.00748.x>