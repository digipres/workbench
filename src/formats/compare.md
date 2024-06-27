# Comparing Registries
## Ways of exploring what formats are where...

## Introduction

While PRONOM is rightly considered the 'gold standard' in format identification for digital preservation, other sources of information can also be useful. On this page, we look at ways of comparing the different format registries, to help understand their contents and differences.


```js
import { load_extension_data } from "./registries.js";
import { extractCombinations, render } from 'npm:@upsetjs/bundle';

const exts = await load_extension_data();

const user_profile_key = 'yours';

const registries = new Set();
exts.forEach( function (item, index) {
    // Store the registry IDs:
    registries.add(item.reg_id);
});

```

At the simplest level, we can compare them based on the number of records and file extensions they contain.



<div class="card">

```js
Plot.plot({
    title: "Comparing Registries by Total Number of File Extensions",
    y: {grid: true, label: "Registry ID" },
    x: {grid: true, label: "Total Number of File Extensions" },
    color: {legend: false, label: "Registry ID"},
    marginLeft: 70,
    marginRight: 70,
    width,
    marks: [
        Plot.ruleX([0]),
        Plot.rectX(exts, {x: "num_extensions", y: "reg_id", fill: "reg_id", sort: { y: "x" }, tip: true }),
        Plot.text(exts, {x: "num_extensions", y: "reg_id", text: (d) => d.num_extensions, dx:2, textAnchor: "start"})
    ]
})
```

</div>

This provides an overview, but doesn't indicate how good the coverage is across registries. For example, given how many entries are in _WikiData_, does this mean it covers everything in the other registries?


## Venn Diagrams

One well-know way to compare things like sets of extensions is to use a [Venn diagram](https://en.wikipedia.org/wiki/Venn_diagram), where the overlap of each circle represents the degree of overlap of the given sets.

<div id="venn"></div>
<div id="venn-tooltop" class="venntooltip"></div>

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
import {default as venn} from "venn.js";

function get_filtered_set() {
  // Filter down the list, to the selected ones, but keep the order consistent:
  const exts_filtered = [];

  // We have Registry_ID -> [extensions] but we need extension -> Registry_IDs
  const ext_to_regs = {};
  var reg_id = null;
  const allowed_regs = new Set(['pronom', 'wikidata', 'fdd']);
  exts.forEach( function (item, index) {
      if( allowed_regs.has(item.reg_id) ) {
          // Go through the extensions for this registry:
          item.extensions.forEach( function (ext, ext_index) {
              if( !(ext in ext_to_regs) ) {
                  ext_to_regs[ext] = []
              }
              ext_to_regs[ext].push(item.reg_id);
          });
      }
  });

  // Convert to list in UpSetJs format:
  const upset_input = [];
  for (const [extension, registries] of Object.entries(ext_to_regs)) {
    upset_input.push( { name: extension, sets: registries });
  }
  return upset_input;
}

function generate_union_sets(upset_input) {
    var venn_sets = [];
    const { combinations } = extractCombinations(get_filtered_set());

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
```js
var chart = venn.VennDiagram()
                 .width(350)
                 .height(300);

var div = d3.select("#venn");
var tooltip = d3.select("#venn-tooltop");
div.datum(venn_sets).call(chart);

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
            .style('top', window.pageYOffset + e.clientY - 10 + 'px')
            .style('left', 100  +'px');
    })

    .on("mouseout", function(event, d) {
        tooltip.transition().duration(400).style("opacity", 0);
        var selection = d3.select(this).transition("tooltip").duration(400);
        selection.select("path")
            .style("fill-opacity", d.sets.length == 1 ? .25 : .0)
            .style("stroke-opacity", 0);
    });
```

This works well for up to three sets, as we can see here. The diagram makes it clear that despite its size, the _WikiData_ set of extensions does not totally subsume the other two registries, each of which have entries unique to them.

The only problem is that, in general, Venn diagrams are not able to compare more than three sets at once.

## UpSet Plots

In recent years, the invention of the [UpSet Plot](https://upset.app/) has provided a new way to explore this kind of problem.

This type of diagram enumerates and ranks all the combinations of sets, and makes it easier to explore them. It can still be quite overwhelming, so you can use this set of controls to control which sets are shown.

```js

const reg_selection = [ "pronom", "fdd", "wikidata" ]; // use registries to select all initially

const selector = view(Inputs.checkbox(registries, {label: "Registries", value: reg_selection , format: (x) => x}));
```

You can also add your own set of file extensions, if you like:

```js
const csvfile = view(Inputs.file({label: "CSV File", accept: ".csv"}));
```

```js
// FIXME Replace this with shared code to avoid pain:
if( csvfile != null ) {
    const uploaded = await csvfile.csv();
    const uploaded_item = { reg_id: user_profile_key, extensions: [] };
    uploaded.forEach( function (item, index) {
      if( item.extension ) {
        console.log(item);
        var ext = item.extension.trim();
        ext = `*.${ext}`;
        uploaded_item.extensions.push(ext);
      }
    });
    exts.push(uploaded_item); 
    registries.add(user_profile_key);
}
```

```js
// We have Registry_ID -> [extensions] but we need extension -> Registry_IDs
const ext_to_regs = {};
exts.forEach( function (item, index) {
    // Filter down the list, to the selected ones, but keep the order consistent:
    if( selector.includes(item.reg_id) ) {
    // Go through the extensions for this registry:
    item.extensions.forEach( function (ext, ext_index) {
        if( !(ext in ext_to_regs) ) {
            ext_to_regs[ext] = [];
        }
        ext_to_regs[ext].push(item.reg_id);
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

<div id="upset" style="overflow-x:scroll;"></div>

```js
const { sets, combinations } = extractCombinations(upset_input, {type: 'distinctIntersection', combinationOrder: 'cardinality:desc', setOrder: 'cardinality:desc' });
//display(combinations)

var selection = null;
const selected_set = Mutable(null);

function updateSelection(set) {
  selection = set;
  var exts = " ";
  if( set != null ) {
    exts = set.name + " extensions: " + set.elems.reduce(function(acc, item, index) {
      return acc + (index === 0 ? '' : ', ') + item.name;
    }, '');
    //d3.select("#upset_set").node().textContent = exts
    d3.select("#upset_set").node().innerHTML = Inputs.table(selection.elems).outerHTML;
    
  }
  //console.log(set);
  rerender();
}

function getPreferredColorScheme() {
  if (window.matchMedia) {
    if(window.matchMedia('(prefers-color-scheme: dark)').matches){
      return 'dark';
    } else {
      return 'light';
    }
  }
  return 'light';
}

function rerender() {
  var theme = 'light';
  // Support switching dark/light mode:
  if(window.matchMedia){
    theme = getPreferredColorScheme();
  }
  const props = { 
    sets, combinations, 
    width: 640, height: 600, 
    selection,
    onClick: updateSelection,
    theme
    };
  render(d3.select("#upset").node(), props);
}

rerender();

// Make sure we update if the light/dark mode is switched:
if(window.matchMedia){
  var colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  colorSchemeQuery.addEventListener('change', rerender);
}

```

<div class="tip">
If you select one the sets or combinations above, the list of extensions will be shown below.
</div>

<div id="upset_set"></div>
