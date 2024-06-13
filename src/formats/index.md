# Introduction
## Analysing & Comparing Format Registries

## Introduction

These pages present various tools and analyses based on the content of the following sources of format information (of 'format registries').

```js
const sources = FileAttachment("../data/format-sources.csv").csv({typed: true});
```

```js
htl.html`
<table>
<thead>
    <tr><th>Key</th><th>Homepage</th><th>Description</th></tr>
</thead>
${sources.map(
    d => htl.html`<tr><td id="source_${d.key}">${d.key}</td><td><a href="${d.homepage}">${d.short_name}</a></tf><td>${d.title}</td></tr>`
)}
</table>`
```

## Combining Registries

Different format registries use different levels of definitions of format for their records. Most work at the same broad format level of granularity as file extensions and [Internet Media Types](https://www.iana.org/assignments/media-types/media-types.xhtml). Others are more fine-grained, and seek to identify individual format versions and/or profiles or format usage. This latter group includes PRONOM, which is the _de facto_ 'preservation grade' format registry and is integrated into many digital preservation tools and workflows.

But to meaningfully combine and compare registries, we need to choose some level of granularity that allows us to align the different datasets.

## File Extensions

The simplest way to make this work is to discard the finer-grained information and just compare format registries based on the file extensions they refer to. For example, following graph just counts how many distinct file extensions they are in each format registry:

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

const exts_chart = Plot.plot({
    style: "overflow: visible;",
    y: {grid: true, label: null },
    x: {grid: true, label: "Total Number of File Extensions in Format Registry Records" },
    color: {legend: false, label: "Registry ID"},
    marks: [
        Plot.ruleX([0]),
        Plot.rectX(exts, {x: "num_extensions", y: "reg_id", fill: "reg_id", sort: { y: "x" } }),
        Plot.text(exts, {x: "num_extensions", y: "reg_id", text: (d) => d.num_extensions, dx:2, textAnchor: "start"})
    ]
});
display(exts_chart);
```

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


## WikiData

```sparql
select distinct ?uri ?uriLabel ?puid ?extension ?mimetype ?encodingLabel ?referenceLabel ?date ?relativityLabel ?offset ?sig
where
{
  { ?uri wdt:P31/wdt:P279* wd:Q235557 } UNION 
    { ?uri wdt:P31/wdt:P279* wd:Q26085352 }.       # Return records of type File Format and File Format Family.
  optional { ?uri wdt:P2748 ?puid.      }          # PUID is used to map to PRONOM signatures proper.
  optional { ?uri wdt:P1195 ?extension. }
  optional { ?uri wdt:P1163 ?mimetype.  }
  optional { ?uri p:P4152 ?object;                 # Format identification pattern statement.
    optional { ?object pq:P3294 ?encoding.   }     # We don't always have an encoding.
    optional { ?object ps:P4152 ?sig.        }     # We always have a signature.
    optional { ?object pq:P2210 ?relativity. }     # Relativity to beginning or end of file.
    optional { ?object pq:P4153 ?offset.     }     # Offset relatve to the relativity.
    optional { ?object prov:wasDerivedFrom ?provenance;
       optional { ?provenance pr:P248 ?reference;
                              pr:P813 ?date.
                }
    }
  }
  service wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE], en". }
}
order by ?uri
```

<iframe style="width: 80vw; height: 50vh; border: none;" src="https://query.wikidata.org/embed.html#select%20distinct%20%3Furi%20%3FuriLabel%20%3Fpuid%20%3Fextension%20%3Fmimetype%20%3FencodingLabel%20%3FreferenceLabel%20%3Fdate%20%3FrelativityLabel%20%3Foffset%20%3Fsig%0Awhere%0A%7B%0A%20%20%7B%3Furi%20wdt%3AP31%2Fwdt%3AP279%2a%20wd%3AQ235557%7D%20UNION%20%7B%3Furi%20wdt%3AP31%2Fwdt%3AP279%2a%20wd%3AQ26085352%7D.%20%23%20Return%20records%20of%20type%20File%20Format%20and%20File%20Format%20Family.%0A%20%20optional%20%7B%20%3Furi%20wdt%3AP2748%20%3Fpuid.%20%20%20%20%20%20%7D%20%20%20%20%20%20%20%20%20%20%23%20PUID%20is%20used%20to%20map%20to%20PRONOM%20signatures%20proper.%0A%20%20optional%20%7B%20%3Furi%20wdt%3AP1195%20%3Fextension.%20%7D%0A%20%20optional%20%7B%20%3Furi%20wdt%3AP1163%20%3Fmimetype.%20%20%7D%0A%20%20optional%20%7B%20%3Furi%20p%3AP4152%20%3Fobject%3B%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20Format%20identification%20pattern%20statement.%0A%20%20%20%20optional%20%7B%20%3Fobject%20pq%3AP3294%20%3Fencoding.%20%20%20%7D%20%20%20%20%20%23%20We%20don%27t%20always%20have%20an%20encoding.%0A%20%20%20%20optional%20%7B%20%3Fobject%20ps%3AP4152%20%3Fsig.%20%20%20%20%20%20%20%20%7D%20%20%20%20%20%23%20We%20always%20have%20a%20signature.%0A%20%20%20%20optional%20%7B%20%3Fobject%20pq%3AP2210%20%3Frelativity.%20%7D%20%20%20%20%20%23%20Relativity%20to%20beginning%20or%20end%20of%20file.%0A%20%20%20%20optional%20%7B%20%3Fobject%20pq%3AP4153%20%3Foffset.%20%20%20%20%20%7D%20%20%20%20%20%23%20Offset%20relatve%20to%20the%20relativity.%0A%20%20%20%20optional%20%7B%20%3Fobject%20prov%3AwasDerivedFrom%20%3Fprovenance%3B%0A%20%20%20%20%20%20%20optional%20%7B%20%3Fprovenance%20pr%3AP248%20%3Freference%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20pr%3AP813%20%3Fdate.%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20service%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22%5BAUTO_LANGUAGE%5D%2C%20en%22.%20%7D%0A%7D%0Aorder%20by%20%3Furi%20limit%20100" referrerpolicy="origin" sandbox="allow-scripts allow-same-origin allow-popups" ></iframe>

[here](https://w.wiki/AMhF) or [here](https://query.wikidata.org/sparql?query=select%20distinct%20%3Furi%20%3FuriLabel%20%3Fpuid%20%3Fextension%20%3Fmimetype%20%3FencodingLabel%20%3FreferenceLabel%20%3Fdate%20%3FrelativityLabel%20%3Foffset%20%3Fsig%0Awhere%0A%7B%0A%20%20%3Furi%20wdt%3AP31%2Fwdt%3AP279*%20wd%3AQ235557.%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20Return%20records%20of%20type%20File%20Format.%0A%20%20optional%20%7B%20%3Furi%20wdt%3AP2748%20%3Fpuid.%20%20%20%20%20%20%7D%20%20%20%20%20%20%20%20%20%20%23%20PUID%20is%20used%20to%20map%20to%20PRONOM%20signatures%20proper.%0A%20%20optional%20%7B%20%3Furi%20wdt%3AP1195%20%3Fextension.%20%7D%0A%20%20optional%20%7B%20%3Furi%20wdt%3AP1163%20%3Fmimetype.%20%20%7D%0A%20%20optional%20%7B%20%3Furi%20p%3AP4152%20%3Fobject%3B%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20Format%20identification%20pattern%20statement.%0A%20%20%20%20optional%20%7B%20%3Fobject%20pq%3AP3294%20%3Fencoding.%20%20%20%7D%20%20%20%20%20%23%20We%20don%27t%20always%20have%20an%20encoding.%0A%20%20%20%20optional%20%7B%20%3Fobject%20ps%3AP4152%20%3Fsig.%20%20%20%20%20%20%20%20%7D%20%20%20%20%20%23%20We%20always%20have%20a%20signature.%0A%20%20%20%20optional%20%7B%20%3Fobject%20pq%3AP2210%20%3Frelativity.%20%7D%20%20%20%20%20%23%20Relativity%20to%20beginning%20or%20end%20of%20file.%0A%20%20%20%20optional%20%7B%20%3Fobject%20pq%3AP4153%20%3Foffset.%20%20%20%20%20%7D%20%20%20%20%20%23%20Offset%20relatve%20to%20the%20relativity.%0A%20%20%20%20optional%20%7B%20%3Fobject%20prov%3AwasDerivedFrom%20%3Fprovenance%3B%0A%20%20%20%20%20%20%20optional%20%7B%20%3Fprovenance%20pr%3AP248%20%3Freference%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20pr%3AP813%20%3Fdate.%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20service%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22en%2C%20en%22.%20%7D%0A%7D%0Aorder%20by%20%3Furi)