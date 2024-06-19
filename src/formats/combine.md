# Combining Format Registries
## Implementation Details, Assumptions & Approximations

## Introduction

Different format registries use different levels of definitions of format for their records. Most work at the same broad format level of granularity as file extensions and [Internet Media Types](https://www.iana.org/assignments/media-types/media-types.xhtml). Others are more fine-grained, and seek to identify individual format versions and/or profiles or format usage. This latter group includes PRONOM, which is the _de facto_ 'preservation grade' format registry and is integrated into many digital preservation tools and workflows.

But to meaningfully combine and compare registries, we need to choose some level of granularity that allows us to align the different datasets.

## File Extensions

The simplest way to make this work is to discard the finer-grained information and just compare format registries based on the file extensions they refer to. For example, following graph just counts how many distinct file extensions they are in each format registry:

```js
import { generate_exts_chart } from "./registries.js";
```
<div class="card">
  ${ resize((width) => generate_exts_chart(width) ) }
</div>

Even in this case, different registries handle things in slightly different ways. Most just specify extensions as simple strings, where for example `xmpl` would mean any file that ended in `.xmpl` or indeed `.XMPL` or `.Xmpl`. In contract, Apache Tika's format registry is based on the [Shared MIME-info Database specification](https://specifications.freedesktop.org/shared-mime-info-spec/shared-mime-info-spec-latest.html) which uses the [glob syntax](https://specifications.freedesktop.org/shared-mime-info-spec/shared-mime-info-spec-latest.html#idm45387609262192). i.e. like `*.xmpl`, but also like `*-gz`. Therefore, when comparing sets of extensions, we reduce them all to lower case and shift them to the `*.ext` glob syntax.

This is a good way to get an idea of the overall size and coverage of different registry sources. Consequently, this approach is used in a number of different ways in the different pages of this site. However, there are some assumptions and issues here that should be kept in mind:

- Some formats might not have file extensions associated with them.
- Some _different_ formats may use the _same_ file extension.
- Rarely, the _same_ format might use _different_ file extensions.

Overall, extension-based analyses are likely to slightly underestimate the number of formats, and slightly overestimate the degree to which two different sets of formats overlap.

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

Note that this does not apply when the format extensions come from user-generated sources. Format registries can generally be trusted to only include accurate file extensions. End users sometimes drop or modify file extensions in unexpected ways, so this should be kept in mind when comparing registries against other sources of information.  Many problems can be avoided by ignoring extensions that contain spaces or appear to just be numbers, but this is not a comprehensive approach.


```js
import { load_extension_data } from "./registries.js";

const exts = await load_extension_data();

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

```
```js
import {default as venn} from "venn.js";
import { extractCombinations } from 'npm:@upsetjs/bundle';


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

## Media Types

One alternative is to integrate all the different granularities into a consistent conformance hierarchy, using an extended Media Type syntax, as per [Talking About Formats](http://anjackson.net/keeping-codes/practice/talking-about-formats).

This is has been implemented at <http://www.digipres.org/formats/mime-types/>, but requires more work to make things fully consistent. However, it does show how PRONOM-style fine-grained format identification can be integrated as Media Type parameters. e.g. versions:

- application/pdf
  - application/pdf; version="1.0"
  - ...

Or ones with known 'super types' integrated with versions:

- application/zip
  - application/vnd.etsi.asic-e+zip
    - application/vnd.etsi.asic-e+zip; version="2.x"

Or even ones with additions intended tos make the hierarchy a bit more manageable:

- application/zip
  -  application/x-tika-ooxml (used by Apache Tika so it can route all OOXML to the same code)
     - application/vnd.openxmlformats-officedocument.wordprocessingml.document 
       - application/vnd.openxmlformats-officedocument.wordprocessingml.document; version="2007 onwards" 

This complex merged hierarchy is absolutely not authoritative and should not be used for automated format identification. It is only intended as a navigational aid for browsing and exploring the formats in the different registries.


