---
title: BFI Workflows
places:
- id: internet
  name: "Internet"
- id: bt-net
  name: "BT Connection"
- id: cdi
  name: Collections Information Database
  details: Axiell Collections
- id: access
  name: "Access Storage"
- id: workspace
  name: "Working Storage"
  detail: "QNAP etc."
  people: "Who"
- id: tape1
  name: Tape Robot 1
- id: tape2
  name: Tape Robot 2
- id: vault
  name: Tape Vault
things:
- id: data
  name: Source Data
- id:  aip
  name: Archival Information Package
- id: aip-id
  name: Unique identifier for the Archival Information Package
workflows:
- name: BFI Ingest Workflow
  initialZoom: 0.7
  initialOffset:
  events:
  # ------------------------------
  # Getting the SIP
  # ------------------------------
  - type: start
    target: data@internet
    color: "#000"
  - name: "Deposit"
    type: move
    source: data@internet
    target: data@workspace
  - type: space
  # ------------------------------
  # Building the AIP
  # ------------------------------
  - name: Mint-API-ID
    label: "Mint\nAIP ID"
    type: derive
    source: data@workspace
    target: aip-id@workspace
    markerPos: N
    color: "#0000aa"
    shiftCoords: [0, 1]
  - type: space
  - name: "Generate\nthe AIP"
    type: derive
    source: data@workspace
    target: aip@workspace
    marker: interchange
    markerShiftCoords: [0,0]
    markerPos: "N"
    color: "#ff0000"
    shiftCoords: [0, -1]
  - name: "Record\nAIP ID"
    type: move
    source: aip-id@workspace
    target: record@cdi
    markerAt: 0.7
  # ------------------------------
  # AIP Storage & Replication...
  # ------------------------------
  - name: "Copy to\ntapes 1 & 2"
    type: copy
    source: aip@workspace
    targets:
    - replica_1@tape1
    - replica_2@tape2
    markerAt: 0.3
    shiftCoords: [0, -1]
  - name: "Copy to\ntape 3"
    type: derive
    source: replica_2@tape2
    target: replica_3@tape2
    color: "#bb0000"
    shiftCoords: [0, -2]
    markerPos: "S"
  - name: "Transfer tape 3 to vault"
    type: move
    source: replica_3@tape2
    target: replica_3@vault
    shiftCoords: [0, -1]
    markerPos: "E"
  # ------------------------------
  # Building the DIP
  # ------------------------------
  - name: "Create DIP"
    type: derive
    source: aip@workspace
    target: dip@workspace
    color: "#008800"
    shiftCoords: [0, -2]
    markerPos: "S"
  - name: Copy DIP
    type: copy
    source: dip@workspace
    target: dip@access
  - name: Delete Working Copies
    type: delete
    targets:
    - data@workspace
    - aip@workspace
    - dip@workspace
    marker: interchange
    markerPos: "E"
    markerShiftCoords: [0,-1]
  - name: Ingest Complete
    type: status
  - type: end
---



```dataflow
dataflow 1.0
title "BFI Workflows"
zoom 0.8
height 600

data data "Source Data" black
data aip-id "Archival Information Package Identifier" darkblue
data aip "Archival Information Package" red
data dip "Dissemination Information Package" green
data replica_3 "Tape 3" darkred

place internet "Internet"
place bt-net "BT Connection"
place cdi "Collections\nInformation Database"
place access "Access Storage"
place workspace "Working Storage"
place tape1 "Tape Robot 1"
place tape2 "Tape Robot 2"
place vault "Tape Vault"

start data@internet 
move data@internet data@workspace "Deposit"
space 
derive data@workspace aip-id@workspace "Mint-API-ID"@N [0,1]
space 
derive data@workspace aip@workspace "Generate\nthe AIP"@S [0,-1]
move aip-id@workspace record@cdi "Record\nAIP ID"
copy aip@workspace replica_1@tape1,replica_2@tape2 "Copy to\ntapes 1 & 2"
derive replica_2@tape2 replica_3@tape2 "Copy to\ntape 3"@S [0,-2]
move replica_3@tape2 replica_3@vault "Transfer tape 3 to vault"@E
derive aip@workspace dip@workspace "Create DIP"@S [0,-2]
copy dip@workspace dip@access "Copy DIP"
delete data@workspace,aip@workspace,dip@workspace "Delete Working Copies"@E 
status "Ingest Complete"
end 
```



```js
import { renderDataflows } from "./dataflows.js";
renderDataflows();
```