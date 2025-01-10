---
title: BFI Workflows
places:
- id: vault
  name: Tape Vault
- id: tape2
  name: Tape Robot 2
- id: tape1
  name: Tape Robot 1
- id: workspace
  name: "Working Storage"
  detail: "QNAP etc."
  people: "Who"
- id: bt-net
  name: "BT Connection"
- id: access
  name: "Access Storage"
- id: cdi
  name: Collections Information Database
  details: Axiell Collections
- id: internet
  name: "Internet"
workflows:
- name: BFI Ingest Workflow
  initialZoom: 0.7
  initialOffset:
  events:
  - type: start
    source: data@internet
    color: "#000"
  - name: "Deposit"
    type: move
    source: data@internet
    target: data@workspace
  - type: space
  - name: Mint-API-ID
    label: "Mint\nAIP ID"
    type: derive
    source: aip@workspace
    target: aip-id@workspace
    markerPos: N
    color: "#0000aa"
    shiftCoords: [0, 1]
    markerShiftCoords: [0,1]
  - type: space
  - name: "Rename\nas AIP"
    type: rename
    source: data@workspace
    target: aip@workspace
    marker: interchange
    markerShiftCoords: [0,0.5]
    markerPos: "N"
    color: "#ff0000"
  - name: "Record\nAIP ID"
    type: move
    source: aip-id@workspace
    target: record@cdi
    color: "#0000aa"
    shiftCoords: [0, 1]
    markerShiftCoords: [0,1]
  - type: space
  - name: "Copy to tape robot 1"
    type: copy
    source: aip@workspace
    target: replica_1@tape1
    color: "#ff0000"
  - name: "Copy to tape robot 2"
    type: copy
    source: aip@workspace
    target: replica_2@tape2
    markerAt: 0.72
    color: "#ff0000"
  - type: space
  - name: "Copy to\ntape 3"
    type: derive
    source: replica_2@tape2
    target: replica_3@tape2
    color: "#aa0000"
    shiftCoords: [0, -1]
    markerShiftCoords: [0,-1]
    markerPos: "S"
  - name: "Transfer tape 3 to vault"
    type: move
    source: replica_3@tape2
    target: replica_3@vault
    shiftCoords: [0, -1]
    markerPos: "E"
  - name: "Create DIP"
    type: derive
    source: aip@workspace
    target: dip@workspace
    color: "#008800"
    shiftCoords: [0, 1]
    markerPos: "N"
    markerShiftCoords: [0,1]
  - name: Copy DIP
    type: copy
    source: dip@workspace
    target: dip@access
    shiftCoords: [0, 1]
  - name: Delete Working Copies
    type: delete
    targets:
    - aip@workspace
    - dip@workspace
    marker: interchange
    markerPos: "E"
    markerShiftCoords: [0,0.5]
  - name: Ingest Complete
    type: status
  - type: end
---
