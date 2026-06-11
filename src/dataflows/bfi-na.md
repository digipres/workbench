# British Film Institute National Archive
## Dataflows at the BFI National Archive

<div class="warning">

This page reflects my understanding of how thing work at the BFI National Archive, as of 2025, based on publicly available resources and some discussions with BFI staff during and after a site visit. I may have made many errors and omitted many omissions!

If you have any comments or corrections please let [me](https://anjackson.net/) know via: _andrew.jackson [at] dpconline.org_

</div>


## Introduction

The BFI's own [Data and Digital Preservation teams web page](https://www.bfi.org.uk/bfi-national-archive/look-behind-scenes/bfi-national-archive-teams/data-digital-preservation-teams) provides a concise introduction to their digital preservation activities. [Inside the Archive blog](https://www.bfi.org.uk/bfi-national-archive/inside-archive/inside-archive-blog), recent entries

- [World Digital Preservation Day 2025 part one](https://www.bfi.org.uk/inside-the-archive/news/inside-archive-49-world-digital-preservation-day-2025-part-one)
- [Inside the Archive #50: World Digital Preservation Day 2025 part two](https://www.bfi.org.uk/inside-the-archive/news/inside-archive-50-world-digital-preservation-day-2025-part-two)
- [Inside the Archive #59: Screencraft, floppy disc fever and resilient TV capture | Inside the Archive](https://www.bfi.org.uk/inside-the-archive/news/inside-archive-59-screencraft-floppy-disc-fever-resilient-tv-capture)
- [Inside the Archive #67: Collecting born-digital work | Inside the Archive](https://www.bfi.org.uk/inside-the-archive/news/inside-archive-67-collecting-born-digital-work)

A number of posts on more detailed technical matters are available via [For the love of FOSS](https://digitensions.home.blog/), published by Joanna White (Knowledge, Learning and Collections Developer).

Q: No digitisation represented? Only born digital...
A (emailed): Not intentional, just reflecting what I'd thought about, and my focus on digital bitstreams rather than information carriers.

Note focus on acquisition of born digital material, digitisation is not covered in detail. This covers A/V and images, not documents, which are not currently preserved actively

## Digital Preservation Infrastructure (DPI) Dataflow

The following dataflow diagram summarises the flow of data into the BFI National Archive's Digital Preservation Infrastructure (DPI). This bitstream preservation dataflow is shared across all content streams.



```dataflow
dataflow 1.0
title "BFI National Archive Digital Preservation Infrastructure (DPI) Workflow"
zoom 2.0
offset 33 32
height 600

data item "Item" grey
data data "Data" black
data bd-data "Born-Digital Data" black
data carrier "Carrier" brown
data carrier-data "Carrier Data" black
data record "CID Record" blue
data cid "CID Preservation Package Identifier" blue
data pp "Preservation Package" red
data ppmd "Preservation Package Metadata" blue
data checksum "Checksum" orange
data ar "Access Rendition" green
data replica_3 "Tape 3" darkred

place rr "Reading Room"
place website "BFI Website"

place depositors "Third-Party\nPartners"
place internet "Internet"
place cc "BFI National Archive\nPhysical Collection"
place ts "Transfer Station"
place cdi "Collections\nInformation\nDatabase (CID)"
place access "Access Storage"
place nas "NAS Storage in Archive Network (PB-scale)"
place tape1 "Tape Robot 1"
place tape2 "Tape Robot 2"
place vault "Tape Vault"


start item@cc "BFI Holdings"
"""The BFI National Archive holds a large collection of film and television media and associated artefacts. Some of these may be selected for digitisation and digital preservation."""

derive item@cc data@cc "Digitise"
"""The BFI National Archive’s Conservation Centre is where items from the National Archive are digitised. See <a href="https://www.bfi.org.uk/features/day-life-bfi-national-archive">this blog post</a> to find out more."""

move data@cc data@nas "Internal\nTransfer"
"""The digitised items from the Conservation Centre are transferred to the PB-scale Network-Attached Storage (NAS) on the archive network."""

# ----

start item@depositors
"""The BFI also works with external partners to add born-digital productions to the national collections."""

derive item@depositors bd-data@depositors "Internet\nTransfer"@N
"""This"""

move bd-data@depositors bd-data@internet "Upload\nSent"
merge bd-data@internet bd-data@nas "Upload\nReceived"@W@0.82
"""Born digital content may be delivered over the internet, via a dedicated physical connection."""
space

derive item@depositors carrier@depositors "Copy To\nTransfer\nMedia"@N [0,1]
move carrier@depositors carrier@ts "Post/Courier\nTransfer Media"@E@0.4
"""Or data maybe submitted on portable carriers (HDD/SSD/data tape).  For example, some submissions can be as large as 10TB in size, making internet transfer impractical."""

derive carrier@ts carrier-data@ts "Extract\nDigital Media" [0,0]
"""The files held on the physical carrier are extracted on a network-isolated Transfer Station."""

merge carrier-data@ts carrier-data@nas "Internal\nTransfer"@W@0.7
"""The digital files are then transferred to the PB-scale Network-Attached Storage (NAS) on the archive network."""

delete carrier@ts "Return/Dispose\nTransfer Media"@E [0,1]
"""The physical media are then returned or disposed of in an appropriate manner."""


space

space 
start record@cdi "Basic\nDocumentation"@S [0,1]
"""A Basic Documentation metadata record is created for the item in the Collections Information Database (CID)."""

copy record@cdi cid@nas "Retrieve\n CID"@W [0,1]
"""The CID for the item is retrieved from the DCI."""


space 
combine cid@nas "Rename\nusing CID"@N [0,0]
"""
- UID from the CID record is use to name the digital media, but:
- Filenames and folder names stored in CID as acquired.
"""
space
transform data@nas pp@nas "QC &\nValidation\n(& Wrapping)"@S
"""
- We don't use BagIt or other AIP container/process, TAR or RAWCooked (latter very strongly preferred, where cannot use FFv1 Matroska)
- we do 
  - validation
  - QC
  - some normalisation 
  - prep for autoingest (file naming to standard)
  - some TAR, some RAWcooked
- only acquisitions here, not digitisation from physical collections, is this intentional?
- this diagram only covers A/V and images, not documents (not currently preserving actively) 
- visual + audio + encoding standards

- Usually a manifest is present, either from the source in the relevant standard. RAWCooked generated e.g. create from DPX files.
- Digital media records are created, write MediaInfo etc.
- Extract MediaInfo from files, sent to CID.
- AIP is called "Preservation Package"

- PP: A/V as separate bitstreams in some PP, usually in standards-based packages, ProRes sometimes use as AR and this combines them.
"""

space
derive pp@nas ar@nas "Create\nAccess\nRendition"@S [0,-1]
"""A smaller access copy, or Dissemination Information Package (DIP), is generated from the SIP/AIP.

- DIP is called "Access Renditions" low-bitrate lossy JPG and MP4 files access, and a reference to this is stored in the CID. precise details depend on the nature of the content. Preservation file media records also point to access.
- AR is from ? Always retaining the original, generated from a package that contains the original.

- Sometimes preserve in formats that cannot be transcoded for access. Don't always create ARs.

The autoingest job kicks in here
"""


space
derive pp@nas ppmd@nas "Extract\nMetadata"@N [0,1]

merge ppmd@nas record@cdi "Add Metadata To\nExtended Documentation"
"""If the AIP was generated successfully, the AIP ID is recorded in the Collections Information Database.
- TBC: "CID gets a record for every file ingest to the DPI, with automated metadata from MediaInfo (Python)" This is actually per package, right, every file?
- Any access restrictions are added to CID, displayed in the DPI, and used to limit onward delivery.
Manual and automated.
Standards compliant record(s) using EN 15907 (moving image), ISAD(G) (screen craft), RDA (library).
"""

copy pp@nas replica_1@tape1,replica_2@tape2 "Copy to\ntapes 1 & 2"
"""The AIP is then copied to two tapes managed by two separate tape libraries (>20PB scale, IBM3592 & LTO9, two different tape technologies???). - Policy on the tape library system, replication happens automatically."""
derive replica_2@tape2 replica_3@tape2 "Copy to\ntape 3"@S [0,-1]
"""The second tape robot creates an additional copy on a separate LTO9 tape."""

derive replica_1@tape1 checksum@tape1 "Calculate\nChecksum"@N [0,1]
"""
- Local MD5 is generated, which is strongly preferred by the data tape system. This is not a cryptographic use case.
- Retrieval check is from ?
  - Send to data-tape, it generates and MD as it writes to tape. This is used as the comparison usually, but can differ when the tape system has chunked things for writing to tape.
"""

move checksum@tape1 checksum@nas "Retrieve\nChecksum"@E
combine checksum@nas "Fixity\nCheck"@N 

move replica_3@tape2 replica_3@vault "Transfer tape 3 to vault"@E
"""As the third-copy tapes are filled, they are collected and transferred to a third location.
- Tape held over 50 miles away,, not networked, for diaster recovert. annual random recovery checks that the data restores, verified against CID.
"""

copy ar@nas ar@access "Transfer"
"""The access copy is transferred to the storage location used to provide access to end users."""

delete data@nas,pp@nas,ar@nas "Delete\nWorking Copies"@E
"""All the intermediary file and the original submission are now deleted, after confirming lossless transfer to data tape."""

status "Ingest Complete"

end 
```


At the end of the ingest process, there are immediately accessible 'access copies' (DIPs) and the 'preservation copies' (AIPs) are stored on multiple tapes.  The Collections Information Database (CID) contains all metadata needed for management and discovery of content, along with the appropriate identifier for the information packages that contain the digital assets. The CID remains the master metadata store, and this metadata is preserved independently of the DPI.

The code for the core `autoingest job` and related workflows is here: [bfidatadigipres/BFI_scripts](https://github.com/bfidatadigipres/BFI_scripts).

## Access Dataflow

There are two different modes of access. Some content is available over the public web (rights clearance required), while virtually all collection material is discoverable via the collections search and is available on site, by submitting an access request. 

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
place nas "Working Storage"
place tape1 "Tape Robot 1"
place tape2 "Tape Robot 2"
place vault "Tape Vault"

start request@internet
start web@website
start aip-id@cdi
start dips@access

move request@internet request@website "Request Item"@W
transform request@website lookup@website "Lookup\nItem"@N [0,0]
move lookup@website lookup@cdi "Query Item"@W
move lookup@cdi lookup@website "Return\nMetadata"@E

transform lookup@website get_dip@website "Extract\nAIP ID"@N
move get_dip@website get_dip@access "Find\nDIP"@W@0.7 
transform get_dip@access dip@access "Read\nDIP"@N 
move dip@access dip@website  "Return\nDIP"@E@0.3

move dip@website dip@internet  "Deliver DIP"@W

end 
```

### On-Site Access

Only BFI staff are able to access the highest-quality (very high bitrate) 'preservation copies'. These copies are retrieved from tape on demand:


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
place nas "Working Storage"
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
move aip@access aip@website  "Transfer AIP"@W@0.7
move aip@website aip@rr  "Deliver AIP"@W
delete aip_tape@tape1 "Unload\nTape"

end 
```

## Content Streams

Some links and notes about the details on the content stream variations are given below.

### Digital Film TBA ? focus on streamers for BFI part

* [iPRES 2024: “You oughta be in pictures”: Insights to Digital Moving Image Preservation from the BFI, EYE, and LOC](https://www.digipres.org/publications/ipres/ipres-2024/papers/you-oughta-be-in-pictures-insights-to-digital-moving-image-prese/)  

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