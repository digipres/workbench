# British Film Institute National Archive
## Dataflows at the BFI National Archive

<div class="warning">

This page reflects my understanding of how thing work at the BFI National Archive, as of 2025, based on publicly available resources and some discussions with BFI staff during and after a site visit. I may have made many errors and omitted many omissions!

If you have any comments or corrections please let [me](https://anjackson.net/) know via: _andrew.jackson [at] dpconline.org_

</div>


## Introduction

The BFI's own [Data and Digital Preservation teams web page](https://www.bfi.org.uk/bfi-national-archive/look-behind-scenes/bfi-national-archive-teams/data-digital-preservation-teams) provides a concise introduction to their digital preservation activities. A number of posts on more detailed technical matters are available via [For the love of FOSS](https://digitensions.home.blog/), published by Joanna White (Knowledge and Collections Developer).

## Bitstream Preservation Dataflow

The following dataflow diagram summarises the flow of data into the BFI National Archive's Digital Preservation Infrastructure (DPI). This general dataflow is shared across all content streams.


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
place rr "Reading Room"
place website "BFI Website"
place cdi "Collections\nInformation\nDatabase (CID)"
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

delete data@workspace,aip@workspace,dip@workspace "Delete Working Copies"@S 
"""All the intermediary file and the original submission are now deleted."""

status "Ingest Complete"

end 
```

At the end of the ingest process, there are immediately accessible 'access copies' (DIPs) and the 'preservation copies' (AIPs) are stored on multiple tapes.  The Collections Information Database (CID) contains all metadata needed for management and discovery of content, along with the appropriate identifier for the information packages that contain the digital assets. The CID remains the master metadata store, and this metadata is preserved independently of the DPI.

The code for the core `autoingest job` and related workflows is here: [bfidatadigipres/BFI_scripts](https://github.com/bfidatadigipres/BFI_scripts).

## Access Dataflow

There are two different modes of access. Some content is available over the public web, and some is only available on site. 

### Internet Access

Public internet access uses the 'access copies':

```dataflow
dataflow 1.0
title "BFI National Archive Public Access Workflow"
zoom 0.84
offset 0 0
height 300

data request "User Request/Query" black
data web "Website Data" purple
data data "Source Data" black
data aip-id "Archival Information Package Identifier" darkblue
data aip "Archival Information Package" red
data dip "Dissemination Information Package" green
data dips "Dissemination Information Packages" green
data replica_1 "Tape 1" red
data replica_3 "Tape 3" darkred
data lookup "Look up ID" darkblue
data get_dip "Get DIP" green
data get_aip "Get AIP" red

place internet "Internet"
place rr "Reading\nRoom"
place website "BFI Website"
place cdi "Collections\nInformation\nDatabase (CID)"
place access "Access Storage"
place workspace "Working Storage"
place tape1 "Tape Robot 1"
place tape2 "Tape Robot 2"
place vault "Tape Vault"

start request@internet
start web@website
start aip-id@cdi
start dips@access

move request@internet request@website " "@N
transform request@website lookup@website "Lookup\nItem"@N [0,0]
move lookup@website lookup@cdi " "@N
move lookup@cdi lookup@website " "@N

transform lookup@website get_dip@website "Extract\nAIP ID"@N
move get_dip@website get_dip@access " "@N 
transform get_dip@access dip@access "Read\nDIP"@N 
move dip@access dip@website  " "@N

move dip@website dip@internet  " "@N

end 
```

### On-Site Access

The highest-quality 'preservation copies' are only available on site, and are retrieved from tape on demand:


```dataflow
dataflow 1.0
title "BFI National Archive On-Site Access Workflow"
zoom 1.0
offset 6 4
height 350

data request "User Request/Query" black
data web "Website Data" purple
data data "Source Data" black
data aip-id "Archival Information Package Identifier" darkblue
data aip "Archival Information Package" red
data dip "Dissemination Information Package" green
data replica_1 "Tape 1" red
data replica_3 "Tape 3" darkred
data lookup "Look up ID" darkblue
data get_dip "Get DIP" green
data get_aip "Get AIP" red
data aip_tape "AIP Tape" darkred

place internet "Internet"
place rr "Reading\nRoom"
place website "BFI Website"
place cdi "Collections\nInformation\nDatabase (CID)"
place access "Access Storage"
place workspace "Working Storage"
place tape1 "Tape Robot 1"
place tape2 "Tape Robot 2"
place vault "Tape Vault"


start request@rr
start web@website
start aip-id@cdi
start dip@access
start replica_1@tape1

move request@rr request@website "Request Item"@W
transform request@website lookup@website "Lookup\nItem"@N [0,0]
move lookup@website lookup@cdi "Query Item"@W
move lookup@cdi lookup@website "Return\nMetadata"@E

transform lookup@website get_aip@website "Extract\nAIP ID"@N

move get_aip@website get_aip@tape1 "Request AIP"@W@0.75
derive get_aip@tape1 aip_tape@tape1 "Retrieve\nTape" [0,-1]
space
transform get_aip@tape1 aip@tape1 "Read\nAIP"@N
move aip@tape1 aip@access  "Return AIP"@W
delete aip_tape@tape1 "Unload\nTape"
move aip@access aip@website  "Transfer AIP"@W@0.7
move aip@website aip@rr  "Deliver AIP"@W

end 
```

## Content Stream Variations

Building on the generic DPI workflow, different types of content are handled as follows:

- Items for different streams land in different folders in the `workspace` working area.
- Custom Python scripts process items by arranging them in and moving them between folders under shared naming conventions.
- If the stream is not fully automated, any manual Digital Acquisitions or QC work is done at this point. If all is well, a corresponding `autoingest job` is created.
- Crucially, significant events and distinct copies are registered in the CID. This is automated wherever possible.
- Any access restrictions are added to the CID, can be seen in the DPI.

Some links and notes about the details on the content stream variations are given below.

### Digital Film

* [iPRES 2024: “You oughta be in pictures”: Insights to Digital Moving Image Preservation from the BFI, EYE, and LOC](https://deploy-preview-30--digipres-org-publications.netlify.app/ipres/ipres-2024/papers/you-oughta-be-in-pictures-insights-to-digital-moving-image-prese)  

### Digitised Video & Film

* [Digital Preservation Workflow Webinars 2023](https://www.dpconline.org/events/eventdetail/114/-/digital-preservation-workflow-webinars-2023) (recordings available via that link):  
  * Stephen McConnachie, BFI \- MediaConch workflow  
    * MediaConch as a policy checking tool. See [the policy registry](https://mediaarea.net/MediaConchOnline/publicPolicies).
    * Bash Intro Recommendations:
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
    * BFI sponsoring feature development. Working with developers to test fixes prior to release.
    * MD5Frame: important reversible data that rawcooked can check, i.e. checking the content not the technical metadata.  
    * Workflow systems need to be engineered to cope with transient errors due to e.g. overload.
    * Audio/Image separation of workflows at the institutional levels.
    * 6 NASs, 64 thread transcoding server, 3 QNAP, Isilon. 100Gb network locally.

### System for Television Off-air Recording and Archiving

* [FOSDEM 2024](https://archive.fosdem.org/2024/) lightning talk: [System for Television Off-air Recording and Archiving, BFI National Television Archive](https://archive.fosdem.org/2024/schedule/event/fosdem-2024-2177-system-for-television-off-air-recording-and-archiving-bfi-national-television-archive/)  
* [Making the BFI National Archive the most open in the world? Start with open source.](https://blog.bfi.org.uk/knowledge-and-collections/start-with-open-source/) An introduction to STORA: System for Television Off-air Recording and Archiving

### Born Digital Documents

* [SIPping from the fount of collective knowledge \- Digital Preservation Coalition](https://www.dpconline.org/blog/wdpd/blog-tom-wilson-wdpd2024)  

```js
import { renderDataflows } from "./dataflows.js";
renderDataflows();
```