# British Film Institute National Archive
## Dataflows at the BFI National Archive

<div class="warning">

This page reflects my understanding of how things worked at the BFI National Archive, at one point in time, based on publicly available resources and some discussions with BFI staff during and after a site visit. I may have made many errors or omitted many omissions!

If you have any comments or corrections please let [me](https://anjackson.net/) know via: _andrew.jackson [at] dpconline.org_

</div>


## Introduction

The BFI's own [Data and Digital Preservation teams web page](https://www.bfi.org.uk/bfi-national-archive/look-behind-scenes/bfi-national-archive-teams/data-digital-preservation-teams) provides a rich and concise introduction to their digital preservation activities.

- Mixture of technical and non-technical staff across the teams. This includes a specialist _Knowledge and Collections_ developer who can develop and maintain the necessary custom components, and also support in-house training of technical skills.
  - Blog of current role holder, Joanna White: [For the love of FOSS](https://digitensions.home.blog/)
- Open by default. See [github.com/bfidatadigipres](https://github.com/bfidatadigipres)
- Hardware systems dedicated solely to digital preservation are managed by the staff in these teams.
- Service function names are used for components in preference to product names, which helps to keep the roles clear without pinning things to particular implementations. For example, documentation refers to the Digital Preservation Infrastructure (DPI) or Collections Information Database (CID). The CID is currently Axiell Collections, but this may change in the future. Or more than one product or system may be needed to deliver an overall function, as for the DPI. This may also help keep teams and individuals focussed on their service needs and thus open to alternative implementations rather than considering themselves single-product specialists. 

## Ingest Dataflow

The following dataflow diagram summarises the flow of data into the BFI National Archive's Digital Preservation Infrastructure (DPI). It focusses on the overall dataflow shared across all content streams.

The core workflow of ingesting content into the DPI ‘autoingest job’ code is at [bfidatadigipres/BFI_scripts](https://github.com/bfidatadigipres/BFI_scripts).

```dataflow
dataflow 1.0
title "BFI National Archive Ingest Workflow"
zoom 0.8
height 600

data data "Source Data" black
data aip-id "Archival Information Package Identifier" darkblue
data aip "Archival Information Package" red
data dip "Dissemination Information Package" green
data replica_3 "Tape 3" darkred

place internet "Internet"
place bt-net "ISP Connection"
place cdi "Collections\nInformation Database (CID)"
place access "Access Storage"
place workspace "Working Storage"
place tape1 "Tape Robot 1"
place tape2 "Tape Robot 2"
place vault "Tape Vault"

start data@internet 
"""Digital collections material is deposited by third-parties over the internet, via a dedicated connection."""

move data@internet data@workspace "Deposit"
"""Deposits arrive and are places in working storage, as Submission Information Packages (SIP). The precise details depend on the content stream."""

space 
derive data@workspace aip-id@workspace "Mint\nAIP ID"@N [0,1]
"""An identifier is created for the archival information package."""

space 
derive data@workspace aip@workspace "Generate\nthe AIP"@S [0,-1]
"""An archival information package is generated from the submitted data. This stage varies a great deal between content streams. It may be manual or automated."""

move aip-id@workspace record@cdi "Record\nAIP ID"
"""If the AIP was generated successfully, the AIP ID is recorded in the Collections Information Database."""

copy aip@workspace replica_1@tape1,replica_2@tape2 "Copy to\ntapes 1 & 2"
"""The AIP is then copied to two tapes managed by two separate tape robots."""

derive replica_2@tape2 replica_3@tape2 "Copy to\ntape 3"@S [0,-2]
"""The second tape robot creates an additional copy on a separate tape."""

move replica_3@tape2 replica_3@vault "Transfer tape 3 to vault"@E
"""As the third-copy tapes are filled, they are collected and transferred to a third location."""

derive aip@workspace dip@workspace "Create DIP"@N [0,1]
"""A smaller access copy, or Dissemination Information Package (DIP), is generated from the SIP/AIP."""

copy dip@workspace dip@access "Copy DIP"
"""The access copy is transferred to the storage location used to provide access to end users."""

delete data@workspace,aip@workspace,dip@workspace "Delete Working Copies"@E 
"""All the intermediary file and the original submission are now deleted."""

status "Ingest Complete"

end 
```

At the end of the ingest process, the Collections Information Database (CID) should contain all metadata needed for management and discovery of content, along with the appropriate identifier for the information packages that contain the digital assets.

## Access Dataflow

```dataflow
dataflow 1.0
title "BFI National Archive Access Workflow"
zoom 0.8
height 600

data request "User Request/Query" black
data data "Source Data" black
data aip-id "Archival Information Package Identifier" darkblue
data aip "Archival Information Package" red
data dip "Dissemination Information Package" green
data replica_1 "Tape 1" red
data replica_3 "Tape 3" darkred
data lookup "Look up ID" blue
data get_dip "Get DIP" green

place internet "Internet"
place rr "Reading Room"
place website "BFI Website"
place cdi "Collections\nInformation Database (CID)"
place access "Access Storage"
place workspace "Working Storage"
place tape1 "Tape Robot 1"
place tape2 "Tape Robot 2"
place vault "Tape Vault"


start request@internet
start aip-id@cdi
start dip@access
start replica_1@tape1

move request@internet request@website
derive request@website lookup@website "lookup"@N [0,1]
move lookup@website lookup@cdi
move lookup@cdi lookup@website

transform lookup@website get_dip@website
move get_dip@website get_dip@access
move get_dip@access get_dip@website

move get_dip@website get_dip@internet

end 
```



## Content Streams

This section notes how individual types of content, or content streams, are implemented within the wider context. 

- Different streams land in different folders.
- Custom Python scripts process items arranged in folders under shared naming conventions.
- If the stream is not fully automated, any manual Digital Acquisitions or QC work is done at this point. If all is well, a corresponding ‘autoingest job’ is created.
- Crucially, significant events and distinct copies are registered in the CID.
- Any access restrictions are added to the CID, can be seen in the DPI.

### Digital Film

* [iPRES 2024: “You oughta be in pictures”: Insights to Digital Moving Image Preservation from the BFI, EYE, and LOC](https://deploy-preview-30--digipres-org-publications.netlify.app/ipres/ipres-2024/papers/you-oughta-be-in-pictures-insights-to-digital-moving-image-prese)  
  * (Intending to make a dataflow diagram of the ingest process you presented)

### Digitised Video & Film

* [Digital Preservation Workflow Webinars 2023](https://www.dpconline.org/events/eventdetail/114/-/digital-preservation-workflow-webinars-2023) (recordings available for DPC members):  
  * Stephen McConnachie, BFI \- MediaConch workflow  
    * Mentioned in the context of a project, Heritage 2020?  
    * MediaConch  
      * Policy checking tool  
      * [Policy registry](https://mediaarea.net/MediaConchOnline/publicPolicies)  
    * Bash Intro Recommendations  
      * [https://amiaopensource.github.io/ffmprovisr/](https://amiaopensource.github.io/ffmprovisr/)   
      * [https://wizardzines.com/zines/bite-size-bash/](https://wizardzines.com/zines/bite-size-bash/)   
      * [https://smallsharpsoftwaretools.com/](https://smallsharpsoftwaretools.com/)   
    * Scripting loops of MediaConch CLI, supplied ID and format ID (file extension based), to route to the right MediaConch policy  
    * [Reconsidering the Checksum for Audiovisual Preservation](https://dericed.com/papers/reconsidering-the-checksum-for-audiovisual-preservation/)   
    * Shared concrete tools and policies make the workflow better, because the supplier can deploy exactly the same practice upstream.  
    * Policies need to be living documents, to adapt to feedback and process, with experts on both sides.  
  * Joanna White, BFI \- [RAWCooked workflow](https://www.dpconline.org/docs/events-1/2023-events/workflow-webinars/2816-bfi-national-archive-dpx-rawcooked-workflow/file)  
    * Digitisation Output, high res film scan, DPX \-\> FFV1  
    * [https://github.com/bfidatadigipres/dpx\_encoding](https://github.com/bfidatadigipres/dpx_encoding)   
    * [https://mediaarea.net/RAWcooked](https://mediaarea.net/RAWcooked)   
    * BFI sponsoring feature development  
    * Md5frame important reversible data rawcooked check, checking the content not the technical metadata.  
    * Airflow pipeline next  
    * Keep logs forever  
    * Transient errors due to overload, retries worked,  
    * Working with developers to test fixes prior to release.  
    * Audio/Image separation of workflows at the institutional levels  
    * 6 NASs, 64 thread transcoding server, 3 QNAP, Isilon. 100Gb network locally.

### Web Archiving (full or extracted)

No further information at present.

### STORA

* [FOSDEM 2024](https://archive.fosdem.org/2024/) lightning talk: [System for Television Off-air Recording and Archiving, BFI National Television Archive](https://archive.fosdem.org/2024/schedule/event/fosdem-2024-2177-system-for-television-off-air-recording-and-archiving-bfi-national-television-archive/)  
* [Making the BFI National Archive the most open in the world? Start with open source.](https://blog.bfi.org.uk/knowledge-and-collections/start-with-open-source/) An introduction to STORA: System for Television Off-air Recording and Archiving

### Born Digital Documents

* Blog: [SIPping from the fount of collective knowledge \- Digital Preservation Coalition](https://www.dpconline.org/blog/wdpd/blog-tom-wilson-wdpd2024)  
* Tools: Archivematica, FTK?  
  * Archivematica being used as an ingest/processing system.   
  * Note that the approach to bit preservation (tape robots) does not really align with Archivematica’s assumptions about how bit preservation should be managed. But deferring storage-level fixity checking to the actual storage technology makes more and more sense, e.g. S3 etc. So there’s something to unpack here.  
* DPC Checksum guidance was used, not sure of precise context??? Was it [DPC releases new Technology Watch Guidance Note – Which checksum algorithm should I use? \- Digital Preservation Coalition](https://www.dpconline.org/news/checksum-twgn-public-launch) ?  
* Question that arose: Which format identification tools should you use when, and why?  
* No current plans to automate the push to DPI, which makes sense as this is a new area which needs plenty of time to mature. (There’s some important generic point here about how difficult and risky it is to prematurely optimise a process before you’ve had a real chance to learn its wrinkles and edge-cases. Capability building versus requirements gathering? Is the relative ‘chaos’ of born digital a discomforting problem?).

```js
import { renderDataflows } from "./dataflows.js";
renderDataflows();
```