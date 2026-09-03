# UKWA Dataflows
## How the UK Web Archive worked (c.2023)


<div class="tip">

This page is based on a point-in-time understanding of how thing worked at the UK Web Archive, as of mid-2023, just before the [British Library cyberattack that year](https://en.wikipedia.org/wiki/British_Library_cyberattack). If you have any comments or corrections please let [me](https://anjackson.net/) know via: _andrew.jackson [at] dpconline.org_

</div>

This document summarised the overall dataflow of
## Introduction

The UK Web Archive is a shared service for the legal deposit libraries of the United Kingdom, operated by the British Library, operating under legal deposit regulations since 2013 (and on a permission-based footing prior to that).  It archives billions of resources from millions of domains and an annual basis, with specific sites of interest archived more frequently as needed. As of 2023, the web archive was over a petabyte in size, and held tens of billions of unique resources.

## Overall Dataflow

The on-site in-house infrastructure of the UK Web Archive used a tripartite service design, with clear data standard and protocols between the parts:

- **Ingest**: Metadata and crawl parameters are defined by curators. Crawlers download web content into WARC files.
- **Archival Storage**: A HDFS cluster where the WARC files and metadata are kept.
- **Access**: The WARCs and metadata are indexed and made available.

These three parts run simultaneously, but in concert act as in the following dataflow:

```dataflow
dataflow 1.0
title: "UKWA Overall Dataflow"
zoom 0.9
height 300
offset 10 0

# Locations where data can be stored:
place internet "Internet"
place w3act "W3ACT"
place pywb "PyWB"
place cdx "CDX Index"
place net "NET"
place crawler "Crawler"
place hadoop "Archival\nStorage"

# Data types and descriptions:
data website "Website" black
data warcs "WARCS" red
data md "Metadata" blue
data w3act "W3ACT" darkblue
data pywb "PyWB" purple
data cdx "CDX" orange
data query "Query" black
data playback "Playback" green


# Events
start website@internet
"""A tool called W3ACT is used to define the crawl schedules and parameters for new harvests, and to describe the harvested material."""
start w3act@w3act
start pywb@pywb

derive w3act@w3act md@w3act "Export\nDatabase" [0,-1]
move md@w3act md@hadoop "Copy to HDFS"
copy md@hadoop md@crawler "Update\nCrawl Targets"@E
space


copy website@internet website@crawler "Crawl"
space
transform website@crawler warcs@crawler "Package\nWARCs"@N
copy warcs@crawler warcs@hadoop "Copy to\nHDFS"
delete warcs@crawler "Delete\nWARCs"@N

space
derive warcs@hadoop cdx@hadoop "Generate CDX"@N [0,1]
move cdx@hadoop cdx@cdx "Update\nCDX Server"@E 

copy cdx@cdx cdx@pywb "Query CDX" 
copy warcs@hadoop warcs@pywb "Get WARC"
derive warcs@pywb playback@pywb "Rewrite\nResource"@N [0,1]
move playback@pywb playback@internet "Deliver"@E@0.7
delete warcs@pywb,cdx@pywb " "@S

# And we're done:
end
```

Note that this diagram does not include the details of how the UK Web Archive website works, which is where the curated sites are presented in their associated curatorial collections.  At the time of writing, it just focussed on the steps that enable playback rather than including any search or browse discovery systems.

### Access Alone

The full diagram is quite complicated, so it can help to break it up into section. The following diagram focusses on the access side of the web archive:


```dataflow
dataflow 1.0
title: "UKWA Playback Dataflow"
zoom 0.9
height 300
offset 10 0

# Locations where data can be stored:
place internet "Internet"
place w3act "W3ACT"
place pywb "PyWB"
place cdx "CDX Index"
place crawler "Crawler"
place hadoop "Archival\nStorage"

# Domains where locations are maintained:
domain public "Public Network"
domain n45 "Service Network"
domain n1 "Storage Network"

# Data types and descriptions:
data website "Website" black
data pywb "PyWB" purple
data warcs "WARCS" red
data md "Metadata" blue
data w3act "W3ACT" darkblue
data cdx "CDX" orange
data query "Query" black
date response "Response" black
data playback "Playback" green

start query@internet
start pywb@pywb
start warcs@hadoop,md@hadoop

space
derive warcs@hadoop cdx@hadoop "Generate CDX"@N [0,1]
move cdx@hadoop cdx@cdx "Update\nCDX Server"@E 

move query@internet query@pywb "Request URL"
copy cdx@cdx cdx@pywb "Query CDX" 
copy warcs@hadoop warcs@pywb "Get WARC"
space
derive warcs@pywb playback@pywb "Rewrite\nResource"@S [0,-1]
move playback@pywb playback@internet "Deliver"@E
delete warcs@pywb,cdx@pywb " "

# And we're done:
end
```
<!-- 
Example block diagram

``` mermaid
block-beta
  a b c
```
-->

<!-- See https://mermaid.js.org/syntax/block.html -->

```js
import { renderDataflows } from "./dataflows.js";
renderDataflows();
```