# The National Archives (UK) Custodial Copy Approach

## A decoupled Custodial Copy for cloud-based Digital Preservation Systems

<div class="caution" label="WARNING!">This is a work in progress! Everything may change!</div>

## Introduction

This page describes the [The National Archives (TNA)](https://www.nationalarchives.gov.uk/) of the UK's *Custodial Copy* approach to digital preservation.

Digital records are stored, actively preserved, and accessed using a commercial off-the-shelf digital preservation managed service (DPMS). To mitigates supplier risks, simplify exit-planning, facilitate disaster recovery and business continuity, and ensure complete ongoing control of the data inside that service, the team has built a system which maintains an extracted decoupled copy of all digital files and metadata.

## Transferring Digital Records

We begin with users in our transferring bodies with a set of records ready to transfer. These records will have previously gone through a sensitivity review organised by the transferring body, and the records will now be on the user’s file system ready to upload to the Transfer Digital Records (TDR) service.

```dataflow
dataflow 1.0
title "UK National Archives: Transfer Digital Records"
zoom 1.0
height 400
offset 24 20

data records "Records" black
data md "Metadata" darkblue
data pkg "Files & JSON" darkred
data pkg_ok "Files & JSON (reviewed)" red

place ssys "Transferring Body's\nFile System"
place tna-wrk "On-Site Archival\nStaff Workstation"
place tdr-in "TDR Ingest\nS3 Bucket"
place tdr-prc "TDR Ingest State\nS3 Bucket"
place tdr-out "TDR Export\nS3 Bucket"

start records@ssys
"""Records prepared and ready for transfer to the National Archives."""

derive records@ssys md@ssys "Define/Derive\nMetadata"@N [0,1]
"""Metadata is determined or derived locally, to be uploaded via the TDR web interface."""

copy records@ssys records@tdr-in "Upload Files"
"""Users upload the records through a web UI into the TDR, which is backed by AWS S3 storage."""

transfer records@tdr-in records@tdr-prc "Check & Transfer"
"""The TDR then performs checks on the uploaded files to ensure they are safe to handle and of known file formats, including processing with DROID/PRONOM. As records progress through these checks they move through several S3 buckets but here, for simplicity, we show this as a single 'processing' location."""

transfer md@ssys md@tdr-prc "Upload\nMetadata"@E
"""The user will then upload their metadata into TDR and this will go through more checks to validate it..."""
space
combine records@tdr-prc,md@tdr-prc pkg@tdr-prc "Reconcile"
"""...and then reconcile it against the uploaded files."""

space 
copy pkg@tdr-prc pkg@tna-wrk "Manual\nReview\nAccess"@E
"""Once all checks pass, the metadata will go through a manual review process by TNA before the user can click to complete the transfer to us."""
space
transform pkg@tdr-prc pkg_ok@tdr-prc "Passes\nManual\nReview"
delete pkg@tna-wrk "Delete\nReview\nCopy"@E

copy pkg_ok@tdr-prc pkg_ok@tdr-out "Transfer"@E
"""Once the user completes this transfer, TDR outputs the records as files+JSON sidecars into S3 for our preservation service to act upon."""

space
delete pkg_ok@tdr-prc "Delete\nTemporary\nCopies"@N

end
```

## Preservation Service & Custodial Copy

Our preservation service consists of 3 parts, [the automated workflow to ingest to the cloud managed system](https://github.com/nationalarchives/dr2-ingest/blob/5e588f966d65dc796a6c4805a312994ffc468e0b/docs/images/dr2-end-to-end.svg "https://github.com/nationalarchives/dr2-ingest/blob/5e588f966d65dc796a6c4805a312994ffc468e0b/docs/images/dr2-end-to-end.svg"), the cloud managed system itself, and [our custodial copy system](https://github.com/nationalarchives/dr2-custodial-copy "https://github.com/nationalarchives/dr2-custodial-copy"). 

The workflow prepares [Open Preservation Exchange (OPEX)](https://developers.preservica.com/documentation/open-preservation-exchange-opex) packages for their current cloud-based commercial Digital Preservation Management System (DPMS). After these packages are ingested or updated by the DPMS, a custodial copy is take and stored in [Oxford Common File Layout (OCFL)](https://ocfl.io/) packages and held independently of the DPMS. 

```dataflow
dataflow 1.0
title "TNA Custodial Copy"
zoom 1.2
height 525
offset 24 12

data pkg_ok "Files & JSON (reviewed)" red
data opex "OPEX Package" darkred
data checksum "Fixity Information" orange
data opex_out "OPEX Package Updates" blue
data ocfl "OCFL Package" darkblue
data ac "Access Copy" green


place tna-wrk "On-Site Archival\nStaff Workstation"
place tdr-out "TDR Export\nS3 Bucket"
place dr2-ingest-state "DR2 Ingest State\nS3 Bucket"
place dr2-ingest "DR2 Ingest\nS3 Bucket"
place dpms "Cloud-based Commercial\nDigital Preservation\nManaged Service"
place tna-cc "On-Site\nOCFL Repository"
place tna-tape-1 "Tape 1"
place tna-tape-2 "Tape 2"
place tna-tape-3 "Tape 3"
place tna-tape-3-offsite "Tape 3\n(Held Offsite)"


start pkg_ok@tdr-out
"""Packages from the TDR service arrive via the TDR Export S3 Bucket"""

copy pkg_ok@tdr-out pkg_ok@dr2-ingest-state "Copy For Processing"
"""The first of these begins by copying the S3 objects into its own storage and transforming many individual records into a package to be ingested to the cloud managed system."""

derive pkg_ok@dr2-ingest-state opex@dr2-ingest-state "Extract\nRecords"@N [0,1]
transfer opex@dr2-ingest-state opex@dr2-ingest "Assemble\nOPEX Package"
"""This transformation goes through several steps, firstly creating a single JSON file containing all the metadata for the contents of the package, and then using that data to create an OPEX package for the cloud managed system."""

copy opex@dr2-ingest opex@dpms "Ingest\nTo DPMS"
"""When an OPEX is ready we trigger an ingest in the cloud managed system to read the OPEX package and copy into its own managed storage."""

space
derive opex@dpms checksum@dpms "Calculate\nFixity"@N [0,2]
transfer checksum@dpms checksum@dr2-ingest  "Read\nFixity"@E
combine checksum@dr2-ingest opex@dr2-ingest "Confirm\nTransfer"@N
"""Following the ingest, we confirm that each record in our OPEX package now exists in the cloud managed system and that the fixity matches."""

space

derive opex@dpms opex_out@dpms "Read OPEX\nPackage\nUpdates" [0,0]
"""Once in the cloud managed system, we’re listening for changes to items inside of it and react to new ingests or updates to existing items."""
transfer opex_out@dpms opex_out@tna-cc "Download"@E
transform opex_out@tna-cc ocfl@tna-cc "Store As\nOCFL Packages"
"""This change data is fed to our custodial copy system, which interrogates the cloud managed system to download files and metadata to our OCFL repo, transforming it on the way through."""

copy ocfl@tna-cc ocfl@tna-tape-1,ocfl@tna-tape-2,ocfl@tna-tape-3 "Copy OCFL onto\nthree tapes."
"""Once in our OCFL repo, the item is stored on disk storage, which we then synchronise to tape for resilience; we write 3 tape copies."""

move ocfl@tna-tape-3 ocfl@tna-tape-3-offsite "Tape 3\nTaken Offsite"@E
"""One of the three tape copies is then sent off-site."""

delete opex@dr2-ingest "Delete"@N [0,1]
"""Once we have confirmation that the tape copies have written and the tapes have been distributed, we remove the record data from our temporary storage in TDR and our ingest process."""
delete pkg_ok@dr2-ingest-state "Delete"@E
delete pkg_ok@tdr-out "Delete"@N


derive opex@dpms ac@dpms "Generate Access\nCopies/Thumbnails/etc."@N [0,2]
"""The cloud managed system does its own work to characterise the files and produce thumbnails/access copies."""

space
copy ac@dpms ac@tna-wrk
"""Users within TNA can navigate our digital archive through this system to query and access record content."""

end

```

## Further Information

- Wider context: [How to manage your information - The National Archives](https://www.nationalarchives.gov.uk/information-management/manage-information/)
- [iPRES 2024 Poster:](https://www.digipres.org/publications/ipres/ipres-2024/papers/a-decoupled-custodial-copy-for-cloud-based-digital-preservation/) [A decoupled Custodial Copy for cloud-based Digital Preservation Systems \| Zenodo](https://zenodo.org/records/13647420)


```js
import { renderDataflows } from "./dataflows.js";
renderDataflows();
```