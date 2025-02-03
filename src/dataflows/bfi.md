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
