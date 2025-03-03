# OAIS Dataflows
## Using dataflow diagrams to explore the Open Archival Information System standard

<div class="caution" label="DRAFTY CONTENT WARNING!">This page is nowhere near complete, and may never be so!</div>

## OAIS Internal

Add more complex version, based on exploding this:

<img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/OAIS_Functional_Model_%28en%29.svg">
 
So this is one layer in from the external view, but still higher-level than the full functional model...

## Dataflow  

```dataflow
dataflow 1.0
title: "OAIS Internal Dataflow"
"""
This is an example dataflow.
"""

# Locations where data can be stored:
place producer.dc "Producer"
place consumer.dc "Consumer"
place ingest.ar "Ingest Storage"
place access.ar "Access Storage"
place store.ar "Archival Storage"

# Domains where locations are maintained:
domain dc "Designated Community"
domain ar "The Archive"
domain man "Management"

# Data types and descriptions:
data sip "Submission Information Package" black
data aip "Archival Information Package" red
data dip "Dissemination Information Package" green

#
# Then the sequence of events in this dataflow...
#


# We start by transferring a package from an external party:
start sip@producer.dc
move sip@producer.dc sip@ingest.ar "Transfer to the archive"
"""
A detailed explanation of what happens at this point.
"""

space

# We then prepare the item for ingest to the archival storage storage system:
derive sip@ingest.ar aip@ingest.ar "Generate AIP from SIP" [0,-1]
space
copy aip@ingest.ar aip@store.ar "Copy to archival storage" 
# And delete the temporary files:
delete sip@ingest.ar,aip@ingest.ar
space

# When access is requested, we generate an access copy:
copy aip@store.ar aip@access.ar "Retrieve the AIP"
derive aip@access.ar dip@access.ar "Generate the DIP"@N [0,0]
space
copy dip@access.ar dip@consumer.dc "Send the DIP"
delete aip@access.ar,dip@access.ar

# And we're done:
end
```

```js
import { renderDataflows } from "./dataflows.js";
renderDataflows();
```