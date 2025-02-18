# Dataflows
## Mapping out how data flows from place to place

## Introduction

Dataflow diagrams show how data moves between different systems over time.  The different places where data can be stored are laid out from top to bottom, and the sequence of events the data can go through are plotted from left to right. The lines of the 'tube map' or 'metro' layout show how the data moves, and you can inspect the event 'stations' to get more information about each event.

As an example, here is what it looks like for a simplified version of how the Open Archival Information System describes the flow of data through an archive:


```js
import yaml from "npm:js-yaml@4.1.0";

// Load the first YAML doc, i.e. the frontmatter:
const dfs_txt = await FileAttachment("bfi.md").text();
var dfs = [];
yaml.loadAll(dfs_txt, function (doc) { if(doc) dfs.push(doc) });
var df = dfs[0];
var wf = df.workflows[0];


```

```js
import { renderDataflows } from "./dataflows.js";
```

```js
display(html`<pre data-language="dataflow">
<code class="language-dataflow">${dfl}</code>
</pre>
`)
```

Each diagram is defined using a text format that describes the sequence of events involved in the data flow. The text box below shows the source for the diagram above, and you can edit it to see what happens.

```js
const dflDefault = `dataflow 1.0
title "OAIS High-level Dataflow"
height 300
"""
This is what the OAIS dataflow looks like from the outside. All of the internal detail is invisible to external users.
"""

# First we define the details of the data involved in the flow:
data sip "Submission Information Package" black
data aip "Archival Information Package" red
data dip "Dissemination Information Package" green

# Then the places and the domains those places belong to:
place consumer "Consumer" dc
place producer "Producer" dc
domain dc 

place store "Archival Storage" ar
domain ar "The Archive"

# We start by declaring what data and places exist before the dataflow starts:
start sip@producer

# Ingest:
move sip@producer sip@store "Ingest SIP"

# Preserve:
transform sip@store aip@store "SIP to AIP"
space

# Access:
derive aip@store dip@store "AIP to DIP"@N [0,1]
move dip@store dip@consumer "Access"

# Show the final state
end

`;

const dfl = view(Inputs.textarea({value: dflDefault, rows:40, monospace: true}));
```

## TBC...


Add more complex version  in separate page?
 https://commons.wikimedia.org/wiki/File:OAIS_Functional_Model_(en).svg 
 

```dataflow
dataflow 1.0
title "OAIS Simple Dataflow 2"
height 600
zoom 0.6
"""
This is what the OAIS dataflow looks like from the outside. 
All of the internal detail is invisible to external users.
"""

domain ar "The Arive"
domain dc "Designated Community"

place consumer "Codsdnmer"
place producer "Pr cer"
place store "Archival Storage"

data sip "Submission Information Package" black
data aip "Archival Information Package" red
data dip "Dissemination Information Package" green

# Starting point:
start sip@producer

# Ingest:
move sip@producer sip@store "sdft asasa  sSIP"

# Preserve:
transform sip@store aip@store "SIP t AIP"
space

# Access
derive aip@store dip@store "A to dsd"@N [0,1]
move dip@store dip@consumer "Adds"

# Final state
end
```


```js
renderDataflows();

```

