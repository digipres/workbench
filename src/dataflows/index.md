# Dataflows
## Mapping out how data flows from place to place

## Introduction

Dataflow diagrams show how data moves between different systems over time.  The different places where data can be stored are laid out from top to bottom, and the sequence of events the data can go through are plotted from left to right. The lines of the 'tube map' or 'metro' layout show how the data moves, and you can inspect the event 'stations' to get more information about each event.

As an example, here is what it looks like for a simplified version of how the Open Archival Information System describes the flow of data through an archive:

```js
import { generateDataflow, enableTooltips } from "./dataflows.js";

// Generate and display the dataflow from the text:
display(await generateDataflow(dfl));
// FIXME Log and show any errors found during parsing of the DFL definition!

// Enable tooltips, which is not automated when generating the dataflow directly:
enableTooltips();
```

Each diagram is defined using a text format that describes the sequence of events involved in the data flow. The text box below shows the source for the diagram above, and you can edit it to see what happens.

```js
const dflDefault = `dataflow 1.0
title "OAIS High-level Dataflow"
height 300
"""
This is what the OAIS dataflow looks like from the outside. All of the internal detail is invisible to external users.
"""

# First we define the details of the data involved in the flow. This defines the colours of the data flow lines:
data sip "Submission Information Package" black
data aip "Archival Information Package" red
data dip "Dissemination Information Package" green

# Then the places and the domains those places belong to. The order the places are defined here also defines the order in which they are laid on on the page, from top to bottom:
place consumer "Consumer" dc
place producer "Producer" dc
place store "Archival Storage" ar

# And then a more detail description of the domains:
domain dc "Designated Community"
domain ar "The Archive"

# ----------------------------

# Start:
start sip@producer
"""Every dataflow starts by declaring what data exists where, before the dataflow begins. <br><br> For OAIS, we always start with a <i>Submission Information Package</i> that is held by a <i>Producer</i> that belongs to the archive's <i>Designated Community</i>."""

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

const dfl = view(Inputs.textarea({value: dflDefault, rows:40, monospace: true, resize: true, spellcheck: true }));
```

<!-- Using this to force a large text area 
as Observable Framework limits it be default -->
<style>
textarea {
    max-height: 200em !important;
}
</style>



```js
import { renderDataflows } from "./dataflows.js";
renderDataflows();
```

