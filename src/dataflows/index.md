# Dataflows
## Mapping out how data flows from place to place

<div class="warning">

This is an experiment in visualising the techical architecture of digital preservation services by focussing on how data flows over time. There are a number of outstanding issues and limitations with this approach. Please see [the `dataflow` GitHub issues](https://github.com/digipres/workbench/issues?q=state:open+label:"dataflows") for more detail.

</div>


## Introduction

Dataflow diagrams are a way of showing how data gets copied between systems, over time.  The different places where data can be stored are laid out from top to bottom, and the sequence of events the data can go through are plotted from left to right. The lines of the 'tube map' or 'metro' layout show how the data moves, and you can inspect the event 'stations' to get more information about each event.

These Dataflows are defined using a text format that describes the data, the places data is stored, and sequence of events as the data is processed. A JavaScript helper library use used to processes these descriptions and turns them into interactive diagrams.

## OAIS As An Example

The dataflow diagram below shows very high-level and simplified version of how the Open Archival Information System describes the flow of data through an archive:

```dataflow
dataflow 1.0
title "OAIS High-level Dataflow"
zoom 0.7
height 300

data sip "Submission Information Package" black
data aip "Archival Information Package" red
data dip "Dissemination Information Package" green

place consumer "Consumer" dc
place producer "Producer" dc
place store "Archival Storage" ar

start sip@producer
move sip@producer sip@store "Ingest SIP"
transform sip@store aip@store "SIP to AIP"
space
derive aip@store dip@store "Generate DIP"@N [0,1]
move dip@store dip@consumer "Access"

end
```

For this simplified OAIS example, the event sequence looks like this:
```
start sip@producer
move sip@producer sip@store "Ingest SIP"
transform sip@store aip@store "SIP to AIP"
space
derive aip@store dip@store "Generate DIP"@N [0,1]
move dip@store dip@consumer "Access"
end
```

## Using Dataflow Diagrams

- [Exploring OAIS with Dataflow diagrams](./oais)
- [Documenting real digital preservation services](./real)
- [Editing Dataflow diagrams in your browser](./editor)

```js
import { renderDataflows } from "./dataflows.js";
renderDataflows();
```

