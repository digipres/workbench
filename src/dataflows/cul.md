# Cambridge University Library
## Dataflows for some of CUL's digital preservation services

<div class="caution" label="DRAFTY CONTENT WARNING!">This page is nowhere near complete, and may never be so!</div>

## Introduction

This page uses Dataflow diagrams to explore some of the digital services at [Cambridge University Library](https://www.lib.cam.ac.uk/) (CUL).

For more information about digital preservation at CUL, see

...pointers to general DigiPres @ CUL places

## Overview

...relationship between Transfer Service and the preservation service

## The Transfer Service

...detail about the transfer service ANJ will link to current homepage.

```dataflow
dataflow 1.0
title "CUL Transfer Service"
zoom 0.7
height 600

data arc "Archives"
data sup "Supplemental Material"
data leg "Legacy Material" red
data photo "Photographs of Legacy Carriers" blue
data sip "SIP" black
"""Transfer composed of a folder and a metadata folder, named according to item identifiers, holding the data, photographs and log+hash manifest"""

place mysmedia "Mystery Media"
place shelf "Transfer Lab Shelf"
place adele "ADELE Workstation"
place camera "Camera"
place db "Transfer Service Data Tracker"
place fred "FRED Workstation"
place tomjr "TOM Junior Workstation"
place pam "PAM Workstation"
place mac "Mac Laptop"


"""
Group Assessment Record set up in ArchiveSpace.
Within this collection, digital material has been found.
The archivist may make an individual assessment for an individual carrier
Identifiers written down, media type, metadata on the Assessment Record.
Move from Archival Stacks to Digital Carrier Boxes e.g. Hawking as it's own box, one for each collection.
Order up a box, bring it to the lab.

Unique ID minted by archivist.

Archivist can use PAM to process carriers, keep or not.
PAM will disk image for appraisal, but will be deleted.
Individual assessment record created.
Pass to Transfer service.

If it's non-sensitive, transfer to IT dept. eWaste contractor.
If sensitive, forensically wiped and shredded.

RClone to S3
"""

start leg@mysmedia [0,2]
"""This is material found on various carriers within the library collections."""

move leg@mysmedia leg@shelf "Media\nAccepted"
"""If a data owner can be identified, the media can be accepted by the service for transfer. The media is then connected to the workstation."""

start rec@db
"""An record is created for this item in the Transfer Service Data Tracker. This created the ID that will be used to track the item, and acts as the digital asset register for this service."""

derive rec@db id@db "Copy ID"
move id@db id@adele "Use ID" 
transform id@adele sip@adele "SIP Folder Created"

move leg@shelf leg@adele "Media\nConnected" [0,1]

start photo@camera [0,-1]
move photo@camera photo@adele "Transfer Photograph"


derive leg@adele content@adele "Copy Content"@N [0,1]
"""Make a disk image or logical copy"""

""""""


```



```js
import { renderDataflows } from "./dataflows.js";
renderDataflows();
```