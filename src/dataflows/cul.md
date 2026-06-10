# Cambridge University Library
## Dataflows for some of CUL's digital preservation services

<div class="caution" label="WARNING!">This is a work in progress! Everything may change!</div>

## Introduction

This page uses Dataflow diagrams to explore some of the digital preservation services at [Cambridge University Library](https://www.lib.cam.ac.uk/) (CUL).

For more contents, visit [the CUL digital preservation homepage](https://www.lib.cam.ac.uk/digitalpreservation)

## Overview

...relationship between Transfer Service and the Deposit Service? And overall access and other services?

## The Transfer Service

This service handles a range of digital media, transferring content from a range of different storage carriers including legacy media like floppy disks. See [the Transfer Service homepage](https://www.lib.cam.ac.uk/digitalpreservation/services/transfer-service) for more information.

The overall dataflow for this service is shown below. You can use your mouse to hover over the name of each 'station' to find out more about every event in the dataflow.

```dataflow
dataflow 1.0
title "CUL Transfer Service"
zoom 1.2
height 600
offset 24 16

data arc "Archives" darkred
data sup "Supplemental Material"
data leg "Legacy Material" red
data content "Content" red
data photo "Photographs of Legacy Carriers" green
data sip "SIP" black
data gar "Group Assessment Record" darkblue
data iar "Individual Assessment Record" blue
data rec "Transfer Service Record" darkblue
data id "Transfer Service Item ID" blue

place as "ArchivesSpace"
place stacks "The Archival Stacks"
place pam "PAM Workstation"
place mysmedia "Mystery Media"
place box "Digital Carrier Box"
place shelf "Transfer Lab Shelf"
place camera "Camera"
place hub "Attached to Workstation"
place adele "ADELE/FRED/Tom Jr/Mac\nWorkstations"
place db "Transfer Service Data Tracker"
place s3 "Deposit Service\nS3 Bucket"

start arc@stacks "Digital Carrier In Archive" [0,2]
"""Digital carriers are often discovered during archival processing. When they are found, a Group Assessment Record is set up in ArchivesSpace."""

start leg@mysmedia "Legacy Media In Collections" [0,1]
"""Material is also found on various carriers within the library collections."""

start gar@as 
"""A Group Assessment Record is created in ArchiveSpace. This documents the basic facts of the digital carrier, like any identifiers and the media type, to help the Transfer Service know how to proceed."""

move leg@mysmedia leg@shelf "Accept\nCarrier"
"""If a data owner can be identified, the media can be accepted by the service for transfer and will be placed on shelves in the Transfer Lab."""

move arc@stacks arc@pam "Connect\nTo PAM"
"""The archivist can transfer the carrier to a Pre-Appraisal Machine (PAM). This can be used to take a copy of the most common forms of media and make it accessible enough to appraise."""

derive arc@pam content@pam "Copy\nContent" [0,1]
"""The content of the carrier is copied onto PAM and inspected using the tools available there."""

derive gar@as iar@as "Create\nIndividual\nAssessment\nRecord"
"""If the contents of the carrier is deemed in scope, an Individual Assessment Record is created in ArchiveSpace. This creates a unique identifier for this transfer."""

move arc@pam arc@box "Place Media In\nDigital Carrier Box"@E@0.45
"""Carriers for processing are transferred to one of a number of Digital Carrier Boxes, depending on the collection the carriers belong to."""

start rec@db
"""An record is created for this item in the Transfer Service Data Tracker. This created the ID that will be used to track the item. This database acts as the digital asset register for this service."""

derive rec@db id@db "Create ID"
"""An identifier is created for this item. This identifier links this item together across ArchiveSpace, the Transfer Service, and the downstream Digital Preservation Service."""

delete content@pam "Delete\nAppraisal\nCopy"@N [0,1]
"""The appraisal copy is automatically deleted. <br><br> Note that if the source carrier is deemed out of scope, it will also be destroyed. If it's non-sensitive, the carrier is transferred to the IT department, and on to their eWaste contractor. If the carrier is sensitive, it is forensically wiped and shredded."""

space

move arc@box arc@shelf "Transfer\nCarrier Box"
"""The Transfer Service orders up the the carrier box and moves it to the shelves of the Transfer Lab"""

move id@db id@adele "Copy ID" 
"""The transfer identifier is copied from the tracker and transferred to the workstation."""

space

transform id@adele sip@adele "Create\nSIP Folder"
"""The identifier is used to create a SIP folder that will hold the transfer. It contains a data folder and a metadata folder, named according to item identifiers. The data folder will contain the physical or logical disk contents. The metadata folder will contain photographs and the log and hash manifest from the media extraction process."""

start photo@camera "Photograph\nCarrier"@N [0,1]
"""A camera attached to the workstation is used to record what the carrier look like."""

move photo@camera photo@adele "Take\nPhotographs"
"""Pictures are taken of the front and back of the carrier, and these photos are added to the metadata folder of the SIP."""

combine photo@adele "Add photos\nto SIP"
"""The photographs are added to the SIP metadata folder."""

space
move leg@shelf leg@hub "Connect\nCarrier" [0,1]
"""The carrier is connected or inserted into the appropriate drive of the workstation."""

space
copy leg@hub content@adele "Extract\nContent & Logs"@W [0,1]
"""The device in the workstation makes a copy of the content, logging the process as it goes, along with the checksums of each file. This may be a physical disk image of a logical copy of the disk contents, depending on teh situation."""

combine content@adele "Add data\nto SIP"
"""The extracted file contents and the log are written into the data and metadata folders of the SIP."""

move leg@hub leg@shelf "Reshelve\nCarrier"
"""When complete, the carrier is returned to the lab shelf, and for items from the archive, into the appropriate carrier box."""

move arc@shelf arc@box "Return\nCarrier Box"
"""Once the whole carrier box has been processed, the box is returned to the archive."""

move arc@box arc@stacks "Return Carrier"
"""Once in the archive, the carriers are retrieved from the carrier box and returned to the stacks."""

copy sip@adele sip@s3 "Upload with\nRClone"@W@0.75
"""Completed SIPs are the uploaded to a dedicated S3 bucket using <a href="https://rclone.org/">RClone</a>. Content appearing here will then be ingested downstream."""


end

""""""


```

### The Deposit Service



```js
import { renderDataflows } from "./dataflows.js";
renderDataflows();
```