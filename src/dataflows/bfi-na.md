# British Film Institute National Archive
## Dataflows at the BFI National Archive

<div class="tip">

This page reflects is based on a point-in-time understanding of how thing work at the BFI National Archive, as of 2026, based on publicly available resources and some discussions with BFI staff during and after a site visit. If you have any comments or corrections please let [me](https://anjackson.net/) know via: _andrew.jackson [at] dpconline.org_

</div>

## Introduction

The BFI's own [Data and Digital Preservation teams web page](https://www.bfi.org.uk/bfi-national-archive/look-behind-scenes/bfi-national-archive-teams/data-digital-preservation-teams) provides a concise introduction to their digital preservation activities. The [Further Information](#further-information) section below has links to more detailed information.

In this overview, the focus on the acquisition of born-digital A/V material and images. Digitisation is recognised as a source, but is not covered in any detail. Born-digital documents do not appear in the diagrams as those are not being actively preserved at this time.

## Ingest & Preservation

The following dataflow diagram summarises the flow of data into the BFI National Archive's Digital Preservation Infrastructure (DPI).

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
"""The BFI National Archive’s Conservation Centre is where items from the National Archive are digitised. See e.g. <a href="https://www.bfi.org.uk/features/day-life-bfi-national-archive">this blog post</a> to find out more."""

move data@cc data@nas "Internal\nTransfer"
"""The digitised items from the Conservation Centre are transferred to the PB-scale Network-Attached Storage (NAS) on the archive network."""

# ----

start item@depositors
"""The BFI also works with external partners to add born-digital productions to the national collections."""

derive item@depositors bd-data@depositors "Internet\nTransfer"@N
"""Born digital content may be delivered over the internet, where the external partner initiates the upload of a collection item."""

move bd-data@depositors bd-data@internet "Upload\nSent"
"""The upload happens over a dedicated physical connection."""

merge bd-data@internet bd-data@nas "Upload\nReceived"@W@0.82
"""The upload lands in the PB-scale Network-Attached Storage (NAS) on the archive network."""

space

derive item@depositors carrier@depositors "Copy To\nTransfer\nMedia"@N [0,1]
"""Born digital content can also be submitted on portable carriers (HDD/SSD/data tape).  For example, some submissions can be as large as 10TB in size, making internet transfer impractical."""
move carrier@depositors carrier@ts "Post/Courier\nTransfer Media"@E@0.4
"""The portable carrier is send to the BFI National Archive."""

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

copy record@cdi uid@nas "Retrieve\n UID"@W [0,1]
"""A unique identifier (UID) for the item is retrieved from the CID."""


space 
combine uid@nas "Rename\nusing UID"@N [0,0]
"""
The root folder of the digital media is renamed using the unique identifier from the CID. Note that all original file and folder names will be recorded in the CID.
"""
space
transform data@nas pp@nas "QC &\nValidation\n(& Wrapping)"@S
"""
The digital media undergoes validation and quality control, as appropriate based on the kind of content and the visual and audio encoding standards it is expected to meet. Usually a manifest is present, either added at source or included via the relevant standard, and this is used to verify completeness and fixity. The files are then prepared for the downstream <tt>autoingest</tt> process. This includes file renaming to an internal standard, and repackaging into a single binaries where appropriate. This may use the TAR format, but <a href="https://mediaarea.net/RAWcooked">RAWCooked</a> processing is very strongly preferred wherever the resulting 'FFv1 in Matroska' file is appropriate. For example, DPX files are normalised in this way. <a href="https://mediaarea.net/MediaConch">MediaConch</a> is used to define and implement policies in ways that can be shared between the parties involved.

<br><br>The resulting Preservation Package roughly corresponds to the OAIS notion of an Archival Information Package.
"""

space
derive pp@nas ar@nas "Create\nAccess\nRendition"@S [0,-1]
"""
Sometimes content is preserved in formats that cannot be transcoded for access, but in most cases low-bitrate lossy JPG and MP4 files are generated as "Access Renditions" (roughly corresponding to an OAIS Dissemination Information Package). Preservation Packages can use separate audio and video bitstreams, if this is how the standards-based source is built. But on access, a single Access Rendition is more useful, so a ProRes or MP4 file may be generated for staff or public access purposes.
"""

space
derive pp@nas ppmd@nas "Extract\nMetadata"@N [0,1]
"""
The <a href="https://mediaarea.net/en/MediaInfo">MediaInfo</a> tool use used to extract technical metadata from the Preservation Package and any Access Renditions.
"""

merge ppmd@nas record@cdi "Add Metadata To\nExtended Documentation"
"""
The CID is updated with standards compliant record(s), using EN 15907 (moving image), ISAD(G) (screen craft), RDA (library). Records are added for the Access Renditions and the Preservation Packages. The Preservation Package records also refer to the Access Renditions as well as containing the original file and folder names, the technical metadata from MediaInfo, and any access restrictions (for limiting onward delivery).
"""

copy pp@nas replica_1@tape1,replica_2@tape2 "Copy to\ntapes 1 & 2"
"""
At this point, the <tt>autoingest</tt> job takes over, and the the Preservation Package is passed to the tape libraries. Both are >20PB scale, and each uses a different tape technology (IBM3592 & LTO9). The tape library policy system manages replication.
"""

space
derive replica_1@tape1 checksum@tape1 "Calculate\nChecksum"@N [0,1]
"""
The data tape system calculates the MD5 sum of the content as it is written to tape. MD5 is used because this is well-supported by the data tape system and sufficient for detecting accidental transfer failures.
"""

move checksum@tape1 checksum@nas "Retrieve\nChecksum"@E
"""
The MD5 sum is retrieved from the tape library, unless the package was very large and had to be chunked for writing to tape. In that case, the package is read in full and the MD5 checksum is re-calculated.
"""
combine checksum@nas "Fixity\nCheck"@N 
"""
The retrieved MD5 checksum is compared with the local package checksum.
"""

derive replica_2@tape2 replica_3@tape2 "Copy to\ntape 3"@S [0,-1]
"""The second tape robot creates an additional copy on an additional, separate LTO9 tape."""

move replica_3@tape2 replica_3@vault "Transfer tape 3 to vault"@E
"""
As the third-copy tapes are filled, they are collected and transferred to a third location over 50 miles away. This disaster recovery strategy is tested annually through random recovery checks where the data is restored from selected tapes and the results verified against the records in the CID.
"""

copy ar@nas ar@access "Transfer"
"""The Access Rendition is transferred to a suitable storage location used to provide access to end users."""

delete data@nas,pp@nas,ar@nas "Delete\nWorking Copies"@E
"""All the intermediary file and the original submission are now deleted, after confirming lossless transfer to data tape."""


status "Ingest Complete"

end 
```


<!--

## Internet Access For Public Users

There are two different modes of access. Some content is available over the public web (rights clearance required), while virtually all collection material is discoverable via the collections search and is available on site, by submitting an access request. 


[A Colour Box | Replay](https://replay.bfi.org.uk/video/06895210-f265-5ae0-80e5-eb9b52d987bb), and [Collections Search | BFI | British Film Institute](https://collections-search.bfi.org.uk/web/Details/ChoiceFilmWorks/%20%20%20%20%20%20%20%20%20%20150000650)

Public internet access uses the 'access copies':

```dataflow
dataflow 1.0
title "BFI National Archive Public Access Workflow"
zoom 1.0
offset 25 25
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

## On-Premises Access For Public Users

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

## BFI Network Access For Staff Users

...

-->

## Further Information

Links and references discovered during this work.

### Blogs

- The blog series [Inside the Archive](https://www.bfi.org.uk/bfi-national-archive/inside-archive/inside-archive-blog):
  - [World Digital Preservation Day 2025 part one](https://www.bfi.org.uk/inside-the-archive/news/inside-archive-49-world-digital-preservation-day-2025-part-one)
  - [Inside the Archive #50: World Digital Preservation Day 2025 part two](https://www.bfi.org.uk/inside-the-archive/news/inside-archive-50-world-digital-preservation-day-2025-part-two)
  - [Inside the Archive #59: Screencraft, floppy disc fever and resilient TV capture | Inside the Archive](https://www.bfi.org.uk/inside-the-archive/news/inside-archive-59-screencraft-floppy-disc-fever-resilient-tv-capture)
  - [Inside the Archive #67: Collecting born-digital work | Inside the Archive](https://www.bfi.org.uk/inside-the-archive/news/inside-archive-67-collecting-born-digital-work)
- [For the love of FOSS](https://digitensions.home.blog/), published by Joanna White (Knowledge, Learning and Collections Developer).

### Presentations

- [iPRES 2024: “You oughta be in pictures”: Insights to Digital Moving Image Preservation from the BFI, EYE, and LOC](https://www.digipres.org/publications/ipres/ipres-2024/papers/you-oughta-be-in-pictures-insights-to-digital-moving-image-prese/)
- The MediaConch validation workflow and the [RAWCooked workflow](https://www.dpconline.org/docs/events-1/2023-events/workflow-webinars/2816-bfi-national-archive-dpx-rawcooked-workflow/file) were presented as part of the [Digital Preservation Workflow Webinars 2023](https://www.dpconline.org/events/eventdetail/114/-/digital-preservation-workflow-webinars-2023).
- [FOSDEM 2024](https://archive.fosdem.org/2024/) lightning talk: [System for Television Off-air Recording and Archiving, BFI National Television Archive](https://archive.fosdem.org/2024/schedule/event/fosdem-2024-2177-system-for-television-off-air-recording-and-archiving-bfi-national-television-archive/)  
- An introduction to STORA: System for Television Off-air Recording and Archiving: [Making the BFI National Archive the most open in the world? Start with open source.](https://blog.bfi.org.uk/knowledge-and-collections/start-with-open-source/) 
- [SIPping from the fount of collective knowledge](https://www.dpconline.org/blog/wdpd/blog-tom-wilson-wdpd2024)  


### Code

- The core `autoingest job` and related workflows are here: [bfidatadigipres/BFI_scripts](https://github.com/bfidatadigipres/BFI_scripts). 
- Converting DPX high-resolution DPX film scans to FFv1: [bfidatadigipres/dpx\_encoding](https://github.com/bfidatadigipres/dpx_encoding)  


```js
import { renderDataflows } from "./dataflows.js";
renderDataflows();
```