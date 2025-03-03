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
height 500
offset 10 15

# Locations where data can be stored:
place internet "Internet"
place pywb "PyWB"
place cdx "CDX Index"
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
data cdx "CDX" orange
data query "Query" black
data playback "Playback" green

#
# Then the sequence of events in this dataflow...
#

start website@internet,w3act@w3act
derive w3act@w3act md@w3act "Create Crawl Target\nDatabase Export" [0,-1]
move md@w3act md@hadoop "Update HDFS"
copy md@hadoop md@crawler "Update\nCrawl Targets"@E
space


copy website@internet website@crawler "Crawl Target\nWebsites"
space
transform website@crawler warcs@crawler "Package\nWARCs"@N
move warcs@crawler warcs@hadoop "Move\nto HDFS"
delete md@crawler "Delete"@E

space
space
derive warcs@hadoop cdx@hadoop "Generate CDX"@N [0,1]
move cdx@hadoop cdx@cdx "Update CDX Server"

move query@internet query@pywb "View PyWB"
copy cdx@cdx cdx@pywb
copy warcs@hadoop warcs@pywb
transform warcs@pywb playback@pywb "Rewrite" [0,1]
copy playback@pywb playback@internet

# And we're done:
end
```

```js
import { renderDataflows } from "./dataflows.js";
renderDataflows();
```