# The National Archives (UK) Custodial Copy Approach
## A decoupled Custodial Copy for cloud-based Digital Preservation Systems


<div class="caution" label="WARNING!">This is a work in progress! Everything may change!</div>

## Introduction

This page describes the [The National Archives (TNA)](https://www.nationalarchives.gov.uk/) of the UK's _Custodial Copy_ approach to digital preservation. 

Digital records are stored, actively preserved, and accessed using a commercial off-the-shelf digital preservation managed service. To mitigates supplier risks, simplify exit-planning, facilitate disaster recovery and business continuity, and ensure complete ongoing control of the data inside that service, the team has built a system which maintains an extracted decoupled copy of all digital files and metadata. 

## Custodial Copy Dataflow

```dataflow
dataflow 1.0
title "TNA Custodial Copy"
zoom 1.2
height 400
offset 30 16

data records "Records" black
data sip "Submission Information Package" darkred
data aip "Archival Information Package" red
data dip "Dissemination Information Package" green
data aip_ocfl "Archival Information Package in OCFL" blue

place ssys "Departmental Source\nRecords System"
place dpms "Cloud-based Commercial\nDigital Preservation\nManaged Service"
place tna-in "On-Site Archival\nStaff Workstation"
place tna-out "On-Site Archival\nAccess Station"
place tna-oc "On-Site Offline\nOCFL Repository"

start records@ssys
"""The National Archives of the UK accepts records from a wide range of government departments"""

copy records@ssys records@tna-in "Transfer"
"""Records intended for long-term retention are transferred to the workstation of the staff member(s) involved."""

transform records@tna-in sip@tna-in "Process"
"""Records are processed using DROID, and issues with the contents are raised with the donor, and PRONOM records are added or updated as deemed necessary."""

delete records@ssys "Deleted\nAfter Processing"@E
"""Once the transfer is complete and the records have been processed, the donor may delete their copy of the digital records."""

copy sip@tna-in sip@dpms "Upload"
"""
The staff member(s) involved ???
Integration software communicates with the commercial managed-service via a single small software client library, greatly simplifying future change of product vendor.
"""

transform sip@dpms aip@dpms "Ingest"@N
"""The Commercial Digital Preservation Managed Service ingests the records."""

delete sip@tna-in "Deleted\nAfter Ingest"@S
"""Once the records are verified as being the DPMS, the local copies are deleted."""
space
space

copy aip@dpms aip@tna-oc "Download &\nSynchronise"@E@0.5
"""
The client library is used to interact with the DPMS and download the records. Each digital file will be 
accompanied by an up-to-date vendor-agnostic copy of all metadata describing it
"""

transform aip@tna-oc aip_ocfl@tna-oc "Wrap In\nOCFL"
"""
Data is written in a product-agnostic form using Oxford Common File Layout, supporting file versioning and delete protection.
"""
space

derive aip@dpms dip@dpms "Generate\nAccess Copy"@N [0,1]
"""When a user requests access, a suitable access copy is generated"""
move dip@dpms dip@tna-out "Download"
"""The access copy is downloaded from the DPMS and access on local access terminals."""
space
delete dip@tna-out "Delete\nAfter Use"@N [0,1]
"""Access copies are deleted when they are no longer needed."""

space
copy aip_ocfl@tna-oc aip_ocfl@tna-out "Offline Access"
"""Offline Access via Disaster Recovery/Business Continuity UI: Simple searchable access interface to Custodial Copy for emergency use, and to provide ongoing confidence in offline copy as a long-term migration source."""


end

```

### Questions

- How does upload work exactly? 'Automated Ingest' vs what DPMS does?
- What does offline really mean, given pull/sync from DPMS? There must be intermediaries?

## Further Information

- Wider context: [How to manage your information - The National Archives](https://www.nationalarchives.gov.uk/information-management/manage-information/)
- [iPRES 2024 Poster:](https://www.digipres.org/publications/ipres/ipres-2024/papers/a-decoupled-custodial-copy-for-cloud-based-digital-preservation/) [A decoupled Custodial Copy for cloud-based Digital Preservation Systems | Zenodo](https://zenodo.org/records/13647420)
- Source code available at: [nationalarchives/dr2-custodial-copy](https://github.com/nationalarchives/dr2-custodial-copy)




```js
import { renderDataflows } from "./dataflows.js";
renderDataflows();
```
