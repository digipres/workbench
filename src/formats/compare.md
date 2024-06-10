# Format Registry Comparison

```js
const overlaps = await FileAttachment("../data/overlaps.json").json();

display(overlaps);
```

```js
import { load_extension_data } from "./registries.js";
import { extractCombinations, render } from 'npm:@upsetjs/bundle';

const exts = await load_extension_data();

const ext_to_regs = {};

// We have Registry_ID -> [extensions] but we need extension -> Registry_IDs
exts.forEach( function (item, index) {
    item.extensions.forEach( function (ext, ext_index) {
        if( !(ext in ext_to_regs) ) {
            ext_to_regs[ext] = []
        }
        ext_to_regs[ext].push(item.reg_id);
    });
});

// Convert to list in UpSetJs format:
const upset_input = [];
for (const [key, value] of Object.entries(ext_to_regs)) {
  upset_input.push( { name: key, sets: value });
}

display(upset_input);
```

```js
const { sets, combinations } = extractCombinations(upset_input, {type: 'distinctIntersection'});
display(combinations)


let selection = null;

function onHover(set) {
  selection = set;
  var exts = " ";
  if( set != null ) {
    exts = set.name + " extensions: " + set.elems.reduce(function(acc, item, index) {
      return acc + (index === 0 ? '' : ', ') + item.name;
    }, '');
    d3.select("#upset_set").node().textContent = exts;
  }
  //console.log(set);
  rerender();
}

function rerender() {
  const props = { sets, combinations, width: "900", height: 500, selection, onHover };
  render(d3.select("#upset").node(), props);
}

rerender();

```

<div id="upset"></div>
<pre id="upset_set" style="overflow-x:scroll;"> </pre>

<div id="venn"></div>

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
                 .width(500)
                 .height(500);

var div = d3.select("#venn")
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