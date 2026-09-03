# Dataflows Editor
## Experiment with Dataflow diagrams in your browser

## Live Editor 

Edits in this frame will update the diagram below.

```js
const dflDefault = `dataflow 1.0
title "OAIS High-level Dataflow"
height 300
"""
This is what the OAIS dataflow looks like from the outside. All of the internal detail is invisible to external users.
"""

# First we define the details of the data involved in the flow. 
# This is used to define the colours of the data flow lines:
data sip "Submission Information Package" black
data aip "Archival Information Package" red
data dip "Dissemination Information Package" green

# Then we define the places and the domains those places belong to. 
# The order the places are defined here also defines the order in which they are laid on on the page, from top to bottom:
place consumer "Consumer" dc
place producer "Producer" dc
place store "Archival Storage" ar

# And then a more detail description of the domains:
domain dc "Designated Community"
domain ar "The Archive"

# ----------------------------
# With all the data, places and domains defined, we can start describing the sequence of events.
# Text wrapped in """ contain detailed descriptions for the preceding event.
# ----------------------------

# Start:
start sip@producer
"""Every dataflow starts by declaring what data exists where, before the dataflow begins. <br><br> For OAIS, we always start with a <i>Submission Information Package</i> that is held by a <i>Producer</i> that belongs to the archive's <i>Designated Community</i>."""

# Ingest:
move sip@producer sip@store "Ingest"
"""The <i>Submission Information Package</i> is transferred to the <i>Archive</i> from the <i>Producer</i>."""

# Preserve:
transform sip@store aip@store "SIP to AIP"
"""The <i>Archive</i> takes the <i>Submission Information Package</i> and turns it into an <i>Archival Information Package</i>, placing it on long-term storage."""

space

# Access:
derive aip@store dip@store "Generate DIP"@N [0,1]
"""The <i>Archive</i> takes the <i>Archival Information Package</i> and generates a suitable <i>Dissemination Information Package</i> from it."""

move dip@store dip@consumer "Access"
"""When the <i>Archive</i> receives a request from a <i>Consumer</i>, the <i>Dissemination Information Package</i> is returned."""

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
import { generateDataflow, enableTooltips } from "./dataflows.js";

// Generate and display the dataflow from the text:
display(await generateDataflow(dfl));
// FIXME Log and show any errors found during parsing of the DFL definition!

// Enable tooltips, which is not automated when generating the dataflow directly:
enableTooltips();
```

_BUG: Tool tips are not showing up in this version at present._

## Dataflow Definition Language

_TBA: A more detailed definition of the DFL language, for reference purposes._


