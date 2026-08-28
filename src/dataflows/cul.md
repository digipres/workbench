# Cambridge University Library
## Dataflows for some of CUL's digital preservation services

<div class="caution" label="WARNING!">This is a work in progress! Everything may change!</div>

## Introduction

This page uses Dataflow diagrams to explore some of the digital preservation services at [Cambridge University Library](https://www.lib.cam.ac.uk/) (CUL).

For more information, visit [the CUL digital preservation homepage](https://www.lib.cam.ac.uk/digitalpreservation) or read the blogs posts from [Digital Preservation at the University of Cambridge Libraries and Archives](https://digitalpreservation-blog.lib.cam.ac.uk/).

## Digital Preservation Services

The Digital Preservation Services are a sophisticated suite of preservation tools and services working across on-site and cloud-hosted systems. You can find an overview in this blog: [Building our repository ingest workflow](https://digitalpreservation-blog.lib.cam.ac.uk/building-our-repository-ingest-workflow-e09a0d2cdddc)

Here we use a Dataflow diagram to dig a little deeper into the overall preservation architecture, after which we will present a deep-dive into one particularly interesting component: [the Transfer Service](#the-digital-preservation-service).

```dataflow
dataflow 1.0
title "CUL Digital Preservation Services Overview"
zoom 1.4
offset 23 21

data ros "Research Outputs" orange
data ro "Research Output" orange
data bdsc "Born Digital Special Collections" black
data dsc "Digitised Special Collections" brown
data pp "Preservation Package" red
data pp_2 "Preservation Package" #cc0000
data pp_3 "Preservation Package" darkred
data md "Item Metadata" darkgreen

place apollo "Apollo\n(Research Outputs)"
place apollo_export "Apollo Export (AWS S3)"
place dsc_drive "Digitised Images\nShared Drive"
place dep_s3 "Deposit Service\nExport (AWS S3)"
place ts "Transfer Service Export\n(AWS S3 + Data Tracker)"
place workbench "Workbench"
place solr "Solr Search\nService"
place aws_step "AWS Function"
place fedora "Fedora Server"
place aws_s3 "AWS S3 Standard"
place aws_s3_2 "AWS S3 Glacier"
place azure_blobs "Azure Blob Store"

start ros@apollo
start dscs@dsc_drive
start bdsc@dep_s3
start bdsc@ts

copy bdsc@ts bdsc@aws_step "Copy For\nProcessing"
copy bdsc@dep_s3 bdsc_2@aws_step "Copy For\nProcessing"@E
space

derive dscs@dsc_drive dsc@dsc_drive "Monitor\nShared Drive" [0,-1]
move dsc@dsc_drive dsc@aws_step "Copy For\nProcessing"


derive ros@apollo ro@apollo "Generate Export\nOf AIPs & Changes"@N [0,1]
move ro@apollo ro@apollo_export "Write To S3 Bucket"
space

copy ro@apollo_export ro@aws_step "Copy For\nProcessing"@W@0.07 [0,1]
space


transform bdsc@aws_step pp@aws_step "Assemble\nPreservation\nPackage"

move pp@aws_step pp@fedora "Upload To\nFedora"@E
space 

move pp@fedora pp@aws_s3 "Write To S3\nPreservation Storage"

delete bdsc_2@aws_step,dsc@aws_step,ro@aws_step "Clean Up"@N
space

copy pp@aws_s3 pp@fedora "Read From S3\nPreservation Storage"@E
move pp@fedora pp@aws_step
derive pp@aws_step md@aws_step "Derive"@N [0,1]
move md@aws_step md@solr
delete pp@aws_step "Clean Up"
copy md@solr md@workbench

copy pp@aws_s3 pp@fedora "Read From S3\nPreservation Storage"@E
move pp@fedora pp@workbench

derive pp@aws_s3 pp_2@aws_s3 " " [0,-1]
move pp_2@aws_s3 pp_2@aws_s3_2

derive pp_2@aws_s3_2 pp_3@aws_s3_2 " " [0,-2]
move pp_3@aws_s3_2 pp_3@azure_blobs

end

```


## The Transfer Service

This particular service handles a range of digital media, transferring content from a range of different storage carriers including legacy media like floppy disks. See [the Transfer Service homepage](https://www.lib.cam.ac.uk/digitalpreservation/services/transfer-service) for more information.

The overall dataflow for this service is shown below. You can use your mouse to navigate the map and hover over the name of each 'station' to find out more about every event in the dataflow.

```dataflow
dataflow 1.0
title "CUL Transfer Service"
zoom 2.0
height 800
offset 34 30

data arc "Archives" darkred
data sup "Supplemental Material" darkred
data leg "Legacy Material" red
data assessment "Assessment" red
data content "Content" red
data photo "Photographs of Legacy Carriers" green
data sip "SIP" black
data gar "Group Assessment Record" darkblue
data iar "Individual Assessment Record" darkblue
data uar "Updated Assessment Record" darkblue
data rec "Transfer Service Record" darkblue
data rep "Transfer Service Report" darkblue
data id "Transfer Service Item ID" blue

place stacks "The Archival Stacks"
place as "ArchivesSpace"
place pam "PAM Workstation"
place rr "Reading Room\nTheses Collection"
place supspread "Supplemental Thesis\nCarriers Spreadsheet"
place box "Archives Digital Carrier Box"
place rrbox "Reading Room Digital Carrier Box"
place mysmedia "Mystery Media"
place shelf "Transfer Lab Shelf"
place camera "Camera"
place hub "Attached to Workstation"
place adele "ADELE/FRED/Tom Jr/Mac\nWorkstations"
place db "Transfer Service Data Tracker"
place s3 "Digital Repository\nS3 Bucket"


start arc@stacks "Digital Carrier In Archive" [0,2]
"""Digital carriers are often discovered during archival processing. When they are found, a Group Assessment Record is set up in ArchivesSpace."""

start leg@mysmedia "Legacy Media In Collections" [0,1]
"""Material is also found on various carriers within the library collections."""

move leg@mysmedia leg@shelf "Accept\nCarrier"
"""If a data owner can be identified, the media can be accepted by the service for transfer and will be placed on shelves in the Transfer Lab."""

start sup@rr "Supplementary Material In Reading Rooms" [0,2]
"""
This source of digital content comes from supplemental material alongside Ph.D. theses.
"""

start rec@supspread
"""
A shared spreadsheet is used to coordinate the handling of supplementary material.
"""

derive rec@supspread iar@supspread "Add Entry\nFor Carrier"@N
"""
A basic record and an identifier associated with the thesis is recorded in the shared spreadsheet. This identifier can then be used in the Transfer Service Data Tracker.
"""

move sup@rr sup@rrbox "Place Media In\nDigital Carrier Box"@E@0.6
"""
The reading room staff label the media with the thesis identifier (with multiple media items being identified by a trailing <tt>_1/_2/</tt>etc.) and place them in a dedicated carrier box. 
"""
move sup@rrbox sup@shelf "Transfer\nCarrier Box"
"""The Reading Room carrier box is transferred to the shelves of the Transfer Lab."""

start gar@as 
"""A Group Assessment Record is created in ArchiveSpace. This documents the basic facts of the digital carrier, like any identifiers and the media type, to help the Transfer Service know how to proceed."""

move arc@stacks arc@pam "Connect\nTo PAM"@W@0.3
"""The archivist can transfer the carrier to a Pre-Appraisal Machine (PAM). This can be used to take a copy of the most common forms of media and make it accessible enough to appraise."""

derive arc@pam content@pam "Copy\nContent" [0,1]
"""The content of the carrier is copied onto PAM and inspected using the tools available there."""

derive gar@as iar@as "Create\nIndividual\nAssessment\nRecord"@N
"""If the contents of the carrier is deemed in scope, an Individual Assessment Record is created in ArchiveSpace. This creates a unique identifier for this transfer."""

move arc@pam arc@box "Place Media In\nDigital Carrier Box"@E@0.45
"""Carriers for processing are transferred to one of a number of Digital Carrier Boxes, depending on the collection the carriers belong to."""

start rec@db
"""An record is created for this item in the Transfer Service Data Tracker. This created the ID that will be used to track the item. This database acts as the digital asset register for this service."""

derive rec@db id@db "Create/Import\nIdentifier
"""An identifier is created or imported for this item (with spaces/slashes/special characters replaced by underscores). For archival media, this is minted in ArchiveSpace and links this item together across ArchiveSpace, the Transfer Service, and the downstream Digital Preservation Service."""

delete content@pam "Delete\nAppraisal\nCopy"@N [0,1]
"""The appraisal copy is automatically deleted. <br><br> Note that if the source carrier is deemed out of scope, it will also be destroyed. If it's non-sensitive, the carrier is transferred to the IT department, and on to their eWaste contractor. If the carrier is sensitive, it is forensically wiped and shredded."""

space

move arc@box arc@shelf "Transfer\nCarrier Box"
"""The Transfer Service orders up the the carrier box and moves it to the shelves of the Transfer Lab"""

move id@db id@adele "Copy\nIdentifier" 
"""The transfer identifier is copied from the tracker and pasted into the command line for a Powershell script that helps set up the right folder structure on the workstation."""

space

transform id@adele sip@adele "Create\nSIP Folder"
"""The Powershell script uses the identifier to create a SIP folder that will hold the transfer. It contains a data folder and a metadata folder, named according to item identifiers. The data folder will contain the physical or logical disk contents. The metadata folder will contain photographs and the log and hash manifest from the media extraction process."""

start photo@camera "Photograph\nCarrier"@N [0,1]
"""A camera attached to the workstation is used to record what the carrier look like."""

move photo@camera photo@adele "Take\nPhotographs"
"""Pictures are taken of the front and back of the carrier, and these photos are added to the metadata folder of the SIP."""

delete photo@adele "Add photos\nto SIP"
"""The photographs are added to the SIP metadata folder."""

space
move leg@shelf leg@hub "Connect\nCarrier" [0,1]
"""The carrier is connected or inserted into the appropriate drive of the workstation."""

space

derive leg@hub assessment@hub "Assess\nContent"@N
"""The contents of the carrier is inspected in order to determine how to proceed. In the case of supplementary thesis material, the contents of the carrier is also compared with any relevant records on the <a href="https://www.repository.cam.ac.uk/">Apollo institutional repository</a> (run by the Open Research Systems team)."""
space
delete assessment@hub "Decide\nStrategy"@N [0,1]
"""Depending on the outcome of the assessment, an appropriate transfer strategy is chosen. This may be a full disk image, or a logical copy of the contents of the carrier, or the content may not be copied at all if it is deemed to be a duplicate of content held elsewhere. For supplementary material, it may also make sense to notify Open Research Team and discuss whether the content should be added to the relevant Apollo record."""

copy leg@hub content@adele "Content\nExtraction"@W [0,1]
"""The device in the workstation makes a copy of the content, logging the process as it goes, along with the checksums of each file. This may be a physical disk image of a logical copy of the disk contents, potentially via emulation, depending on the situation."""

delete content@adele "Add data\nto SIP"
"""The extracted file contents and the log are written into the data and metadata folders of the SIP."""

move leg@hub leg@shelf "Reshelve\nCarrier"
"""When complete, the carrier is returned to the lab shelf, and for items from the archive, into the appropriate carrier box."""

move arc@shelf arc@box "Return\nCarrier Box"
"""Once the whole carrier box has been processed, the box is returned to the archive."""

move arc@box arc@stacks "Return Carrier"
"""Once in the archive, the carriers are retrieved from the carrier box and returned to the stacks."""

move sup@shelf sup@rrbox "Return\nCarrier Box"@E
move sup@rrbox sup@rr "Return\nCarrier"@E

copy sip@adele sip@s3 "Upload with\nRClone"@W@0.75
"""Completed SIPs are the uploaded to a dedicated S3 bucket using <a href="https://rclone.org/">RClone</a>. Content appearing here will then be ingested downstream."""

space 

derive rec@db rep@db "Update\nTransfer\nRecord"
"""The Transfer Service Data Tracker record is updated to include a report on the technical details of the transfer, including: Which workstation was used. Which programs and versions. Which connectors, and which specific drives."""

derive iar@supspread uar@supspread "Update\nCarrier\nEntry"@N
"""The outcome of the transfer is recorded in the shared spreadsheet."""

derive iar@as uar@as "Update\nAssessment\nRecord"@N
"""The outcome of the transfer is recorded in ArchiveSpace. If transfers are unsuccessful, the record will note if the transfer may be possible given more time or resources."""

end

""""""

```

At the end of the process, all digital material destined for long-term preservation is uploaded to an S3 bucket. This is used to hand content over to the Digital Repository, which can also pull in the records in the Transfer Service Data Tracker as needed.






```js
import { renderDataflows } from "./dataflows.js";
renderDataflows();
```