# Formats

```js
import { load_extension_data } from "./registries.js";
import { extractCombinations, render } from 'npm:@upsetjs/bundle';

const exts = await load_extension_data();


const registries = ["-"];
const reg_items = {};

exts.forEach( function (item, index) {
    // Store the registry IDs:
    registries.push(item.reg_id);
    reg_items[item.reg_id] = item;
});

```

```js
const reg_1 = view(
  Inputs.select(registries, {
    label: "Registry A",
    value: 'pronom'
  })
);
const reg_2 = view(
  Inputs.select(registries, {
    label: "Registry B",
    value: 'fdd'
  })
);
const reg_3 = view(
  Inputs.select(registries, {
    label: "Registry C",
    value: 'wikidata'
  })
);
```

```js
// Filter down the list, to the selected ones, but keep the order consistent:
const exts_filtered = [];

// We have Registry_ID -> [extensions] but we need extension -> Registry_IDs
const ext_to_regs = {};
var reg_id = null;
exts.forEach( function (item, index) {
    reg_id = null;
    if (item.reg_id == reg_1 ) reg_id = "A";
    if (item.reg_id == reg_2 ) reg_id = "B";
    if (item.reg_id == reg_3 ) reg_id = "C";
    // Go through the extensions for this registry:
    if( reg_id != null ) {
    item.extensions.forEach( function (ext, ext_index) {
        if( !(ext in ext_to_regs) ) {
            ext_to_regs[ext] = []
        }
        ext_to_regs[ext].push(reg_id);
    });
    }
});

// Convert to list in UpSetJs format:
const upset_input = [];
for (const [key, value] of Object.entries(ext_to_regs)) {
  upset_input.push( { name: key, sets: value });
}

//display(upset_input);
```


```js
import {default as venn} from "venn.js";

function generate_union_sets(upset_input) {
    var venn_sets = [];
    const { combinations } = extractCombinations(upset_input);

    combinations.forEach( function (item, index) {
        // Get simple list of names:
        const set_list = [];
        item.sets.forEach( function(entry){ set_list.push(entry.name) })
        // Store
        venn_sets.push({
            sets: set_list,
            size: item.cardinality
        })
    });

    return venn_sets;
}

const venn_sets = generate_union_sets(upset_input);

```

<div id="venn"></div>

<style>
.venntooltip {
  font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;
  font-size: 14px;
  position: absolute;
  text-align: center;
  background: #333;
  color: #ddd;
  padding: 4px;
  border: 0px;
  border-radius: 8px;
  opacity: 0;
}
</style>


```js
var chart = venn.VennDiagram()
                 .width(400)
                 .height(300);

var div = d3.select("#venn")
console.log(venn_sets);
div.datum(venn_sets).call(chart);

var tooltip = d3.select("body").append("div")
    .attr("class", "venntooltip");

div.selectAll("path")
    .style("stroke-opacity", 0)
    .style("stroke", "#fff")
    .style("stroke-width", 3)


div.selectAll("g")
    .on("mouseover", function(event, d) {
        // sort all the areas relative to the current item
        venn.sortAreas(div, d);

        // Display a tooltip with the current size
        tooltip.transition().duration(400).style("opacity", .9);
        tooltip.text(`${d.size} extensions in (${d.sets.join(" ∩ ")})`);

        // highlight the current path
        var selection = d3.select(this).transition("tooltip").duration(400);
        selection.select("path")
            .style("fill-opacity", d.sets.length == 1 ? .4 : .1)
            .style("stroke-opacity", 1);
    })

    .on("mousemove", function (e) {
        tooltip
            .style('top', e.clientY - 10 + 'px')
            .style('left', e.clientX + 10 + 'px');
    })

    .on("mouseout", function(event, d) {
        tooltip.transition().duration(400).style("opacity", 0);
        var selection = d3.select(this).transition("tooltip").duration(400);
        selection.select("path")
            .style("fill-opacity", d.sets.length == 1 ? .25 : .0)
            .style("stroke-opacity", 0);
    });
```
