# Format Diversity Estimation


```js
import 'npm:core-js/actual/set';

const exts_dict = await FileAttachment("../data/extensions.json").json();

// Create ordered array of dictionaries with registry-name, Sets-of-extensions, from the source data:
var exts = Object.keys(exts_dict).map(function(key) {
    return  {
        reg_id: key, 
        extensions: new Set(exts_dict[key])
    };
});

// Sort the array based on the size of the sets:
exts.sort(function(first, second) {
    return second.extensions.size - first.extensions.size;
});

// Now loop through them, working out how many new extensions are added at each stage:
var all_exts = new Set([]);
var sample_total = 0;
var sac = [];

// Calculate the Species Accumulation Curve:
exts.forEach( function (item, index) {
    sample_total += item.extensions.size;
    const current_total = all_exts.size;
    all_exts = all_exts.union(item.extensions);
    // Record the new total species count and how many were added this round:
    item.sac_sample_total = sample_total;
    item.sac_unique_total = all_exts.size;
    item.sac_added = all_exts.size - current_total;
    // Store as simple plotting array:
    sac.push({x: sample_total, y: all_exts.size })
});

// Calculate how many extensions are unique to each registry:
exts.forEach( function (item, index) {
    // Make a copy of the set:
    var unique_exts = new Set(item.extensions);
    // Loop all and drop:
    exts.forEach( function (other_item, other_index) {
        if (index != other_index) {
            unique_exts = unique_exts.difference(other_item.extensions);
        }
    });
    // Record the results:
    item.unique_extensions = unique_exts;
    item.num_unique = unique_exts.size;
    item.num_extensions = item.extensions.size;
});

display(exts);
```

```js
import {regressionLog, regressionLinear} from 'npm:d3-regression';

const reg = regressionLog()
  .x(d => d.x)
  .y(d => d.y)
  .domain([1000, 20000]);

const fit = reg(sac);
// a, b, rSquared, 'predict'
display(fit.rSquared);
```


```js
import * as Plot from "npm:@observablehq/plot";

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
const fit_chart = Plot.plot({
    style: "overflow: visible;",
    y: {grid: true},
    x: {grid: true},
    color: {legend: true},
    marks: [
        Plot.ruleY([0]),
        Plot.axisY({label: "Cumulative Total of Unique File Extensions Across Registries"}),
        Plot.ruleX([0]),
        Plot.axisX({label: "Cumulative Total Number of All File Extensions in Format Registry Records"}),
        Plot.lineY(fit_data, {x: 'x', y: 'y' }),
        Plot.dot(exts, {x: "sac_sample_total", y: "sac_unique_total", stroke: "reg_id", fill: "reg_id", channels: {sac_added: "sac_added"}, tip: true })
    ]
});

display(fit_chart);
```