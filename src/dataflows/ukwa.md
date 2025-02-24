# UKWA Dataflows
## How data flowed at the UK Web Archive (2023)

<div class="caution" label="DRAFTY CONTENT WARNING!">This page is nowhere near complete, and may never be so!</div>

## Introductio0n


## Dataflow  

```dataflow
dataflow 1.0
title: "UKWA Overall Dataflow"
"""
This documents my understanding of the UK Web Archive dataflow in mid-2023.
"""

# Locations where data can be stored:
place producer.dc "Producer"
place consumer.dc "Consumer"
place ingest.ar "Ingest Storage"
place store.ar "Archival Storage"
place access.ar "Access Storage"

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
derive sip@ingest.ar aip@ingest.ar "Generate AIP from SIP"
space
copy sip@ingest.ar aip@storage.ar "Copy to archival storage" 
# And delete the temporary files:
delete sip@ingest.ar,aip@ingest.ar
space

# When access is requested, we generate an access copy:
copy aip@storage.ar aip@access.ar "Retrieve the AIP"
derive aip@access.ar dip@access.ar "Generate the DIP"
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