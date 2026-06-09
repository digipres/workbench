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

This service handles a range of digital media, transferring content from a range of different storage carriers including legacy media like floppy disks. See [the Transfer Service homepage](https://www.lib.cam.ac.uk/digitalpreservation/services/transfer-service) for more information.

The overall dataflow for this service is shown below.

```dataflow
dataflow 1.0
title "CUL Transfer Service"
zoom 1.2
height 600
offset 22 12

data arc "Archives" darkred
data sup "Supplemental Material"
data leg "Legacy Material" red
data content "Content" red
data photo "Photographs of Legacy Carriers" green
data sip "SIP" black
data gar "Group Assessment Record" blue
data iar "Individual Assessment Record" blue
data rec "Transfer Service Record" blue
data id "Transfer Service Item ID" blue
"""Transfer composed of a folder and a metadata folder, named according to item identifiers, holding the data, photographs and log+hash manifest"""

place stacks "The Archival Stacks"
place pam "PAM Workstation"
place as "ArchivesSpace"
place box "Digital Carrier Box"
place mysmedia "Mystery Media"
place shelf "Transfer Lab Shelf"
place camera "Camera"
place adele "ADELE/FRED/Tom Jr/Mac\nWorkstations"
place db "Transfer Service Data Tracker"
place s3 "S3 Bucket"
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

start arc@stacks "Digital Carrier In Archive" [0,3]
"""Digital carriers are often discovered during archival processing. When they are found, a Group Assessment Record is set up in ArchivesSpace."""

start leg@mysmedia "Legacy Media In Collections" [0,2]
"""Material is also found on various carriers within the library collections."""

start gar@as 
"""A Group Assessment Record is created in ArchiveSpace. This documents the basic facts of the digital carrier, to help the Transfer Service know how to proceed."""

move arc@stacks arc@pam "Connect\nTo PAM"
"""The archivist can transfer the carrier to a Pre-Appraisal Machine (PAM). This can be used to take a copy of the most common form of media and make it accessible enough to appraise."""

derive arc@pam content@pam "Copy\nContent" [0,2]
"""The content of the carrier is copied onto PAM and inspected using the tools available there."""

derive gar@as iar@as "Create\nIndividual\nAssessment\nRecord"
"""If the contents of the carrier is deemed in scope, an Individual Assessment Record is created in ArchiveSpace."""

move arc@pam arc@box "Place Media In\nDigital Carrier Box"@E@0.3
"""Carriers for processing are transferred to one of a number of Digital Carrier Boxes, depending on the collection the carriers belong to."""

start rec@db
"""An record is created for this item in the Transfer Service Data Tracker. This created the ID that will be used to track the item, and acts as the digital asset register for this service."""

derive rec@db id@db "Create ID"
"""An identifier is created for this item. This identifier links this item together across ArchiveSpace, the Transfer Service, and the downstream Digital Preservation Service."""

delete content@pam "Delete\nAppraisal\nCopy"@E [0,2]
"""The appraisal copy is automatically deleted."""

move leg@mysmedia leg@shelf "Accept\nMedia"
"""If a data owner can be identified, the media can be accepted by the service for transfer. The media is then connected to the workstation."""

space

move arc@box arc@shelf "Transfer\nCarrier Box"
"""The Transfer Service requests the carrier box and moves it to the shelves of the Transfer Lab"""

move id@db id@adele "Copy ID" 
space
transform id@adele sip@adele "Create\nSIP Folder"

start photo@camera "Photograph\nMedia"@N [0,1]
move photo@camera photo@adele "Take\nPhotograph"

space
move leg@shelf leg@adele "Connect\nMedia" [0,1]
space
derive leg@adele content@adele "Copy\nContent"@N [0,2]
"""Make a disk image or logical copy"""

move leg@adele leg@shelf "Reshelve\nMedia"

move arc@shelf arc@box "Return\nCarrier Box"
move arc@box arc@stacks "Return Carrier"

copy content@adele content@s3 "Upload"@W@0.35
space
copy photo@adele photo@s3 "Upload"@W@0.75

end

""""""


```



```js
import { renderDataflows } from "./dataflows.js";
renderDataflows();
```