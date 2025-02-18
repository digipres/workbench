# Dataflows
## Mapping out how data flows from place to place

## Introduction

This is a dataflow diagram, designed to show how data moves between different systems over time.  The different places where data can be stored are laid out from top to bottom, and the sequence of events the data can go through are plotted from left to right. 

As an example, here is what it looks like for a simplified version of how the Open Archival Information System describes the flow of data through an archive:

The lines of the 'tube map' layout show how the data moves overall, but you can also click/press on the event 'stations' to get more information about what is happening at each stage.

Add more complex version  in separate page?
 https://commons.wikimedia.org/wiki/File:OAIS_Functional_Model_(en).svg 
 


```js
import { renderDataflows, serialize, rasterize, saveImage, saveSvg } from "./dataflows.js";
import yaml from "npm:js-yaml@4.1.0";

// Load the first YAML doc, i.e. the frontmatter:
const dfs_txt = await FileAttachment("bfi.md").text();
var dfs = [];
yaml.loadAll(dfs_txt, function (doc) { if(doc) dfs.push(doc) });
var df = dfs[0];

```

```dataflow
dataflow 1.0
title "OAIS Simple Dataflow"
"""
This is what the OAIS dataflow looks like from the outside. 
All of the internal detail is invisible to external users.
"""

domain ar "The Archive"
domain dc "Designated Community"

place consumer.dc "Consumer"
place producer.dc "Producer"
place store.ar "Archival Storage"

data sip "Submission Information Package" black
data aip "Archival Information Package" red
data dip "Dissemination Information Package" green

# Starting point:
start sip@producer.dc

# Ingest:
move sip@producer.dc sip@store.ar "Ingest SIP"

# Preserve:
rename sip@store.ar aip@store.ar "SIP to AIP"
space

# Access:
derive aip@store.ar dip@store.ar "AIP to DIP"@N [0,1]
move dip@store.ar dip@consumer.dc "Access"

# Final state
end
```


```dataflow
dataflow 1.0
title "OAIS Simple Dataflow 2"
"""
This is what the OAIS dataflow looks like from the outside. 
All of the internal detail is invisible to external users.
"""

domain ar "The Archive"
domain dc "Designated Community"

place consumer.dc "Consumer"
place producer.dc "Pr cer"
place store.ar "Archival Storage"

data sip "Submission Information Package" black
data aip "Archival Information Package" red
data dip "Dissemination Information Package" green

# Starting point:
start sip@producer.dc

# Ingest:
move sip@producer.dc sip@store.ar "sdft asasa  sSIP"

# Preserve:
rename sip@store.ar aip@store.ar "SIP t AIP"
space

# Access:
derive aip@store.ar dip@store.ar "A to dsd"@N [0,1]
move dip@store.ar dip@consumer.dc "Adds"

# Final state
end
```


```js
renderDataflows();

```

```

const save_button = view(Inputs.button("Save as SVG", {value: serialize(svg.node()), reduce: saveSvg, disabled: false }));
```

```j

const save_png_button = view(Inputs.button("Save as PNG", {value: await rasterize(svg.node()), reduce: saveImage, disabled: false }));
```

