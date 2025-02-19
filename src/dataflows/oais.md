
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
derive aip@store dip@store "A to DIOP"@N [0,1]
move dip@store dip@consumer "Adds"

# Final state
end
```

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
place store.ar "Archival Storage"
place access.ar "Access Storage"

# Domains where locations are maintained:
domain dc "Designated Community"
domain ar "The Archive"
domain man "Management"

# Data types and descriptions:
data sip "Submission Information Package" color="#ff0000"
data aip "Archival Information Package"
data dip "Dissemination Information Package"

#
# Then the sequence of events in this dataflow...
#
# FIXME If an event comes up that demands a pre-existing entity (most of them!) then this should be checked and raised!

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

