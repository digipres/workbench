# UKWA Dataflows
## How data flows at the UK Web Archive (c.2023)

<div class="caution" label="DRAFTY CONTENT WARNING!">This page is nowhere near complete, and may never be so!</div>

## Introduction

blah. Data Lake.

## Dataflow

```dataflow
dataflow 1.0
title: "UKWA Overall Dataflow"
"""
This documents my understanding of the UK Web Archive dataflow in mid-2023.
"""
zoom 1.0
height 350
offset 10 20

# Locations where data can be stored:
place internet "Internet"
place crawler "Crawler"
place hadoop "Hadoop"
place w3act "W3ACT"

# Domains where locations are maintained:
domain public "Public Network"
domain n45 "Service Network"
domain n1 "Storage Network"

# Data types and descriptions:
data website "Website" black
data warcs "WARCS" red
data md "Metadata" blue

#
# Then the sequence of events in this dataflow...
#


# We start by transferring a package from an external party:
start website@internet,w3act@w3act
derive w3act@w3act md@w3act "Create Crawl Target\nDatabase Export" [0,-1]
copy md@w3act md@hadoop "Copy to HDFS"
delete md@w3act "Delete"@N
copy md@hadoop md@crawler "Update Crawl\nTargets"@E
space
copy website@internet website@crawler "Crawl Target\nWebsites"
space
transform website@crawler warcs@crawler "Package\nWARCs"@N
copy warcs@crawler warcs@hadoop "Copy to HDFS"
space
space
copy warcs@crawler warc-checksums@hadoop "Verify"
delete warcs@crawler "Delete\nWARCs"@N

# And we're done:
end
```

```js
import { renderDataflows } from "./dataflows.js";
renderDataflows();
```