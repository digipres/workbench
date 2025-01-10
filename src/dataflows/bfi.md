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
  events:
  - name: "Deposit"
    type: copy
    source: data@internet
    target: data@workspace
    color: "#ff0000"
    shiftCoords: [0, 1]
    via: bt-net
  - name: "Create AIP"
    type: derive
    source: data@workspace
    target: aip@workspace
    marker: interchange
  - name: "Record AIP ID"
    type: copy
    source: aip-id@workspace
    target: record@cdi
    color: "#0000aa"
    markerPos: E
  - name: "Copy to tape robot 1"
    type: copy
    source: aip@workspace
    target: replica_1@tape1
    color: "#666"
  - name: "Copy to tape robot 2"
    type: copy
    source: aip@workspace
    target: replica_2@tape2
    markerAt: 0.72
    color: "#444"
  - name: "Copy to tape 3"
    type: copy-tmp
    source: replica_2@tape2
    target: replica_3@tape2
    color: "#000"
    shiftCoords: [0, -1]
  - name: "Transfer tape 3 to vault"
    type: copy
    source: replica_2@tape2
    target: replica_3@vault
    color: "#000"
    shiftCoords: [0, -1]
  - name: "Create DIP"
    type: derive
    source: aip@workspace
    target: dip@workspace
    color: "#008800"
  - name: Copy DIP
    type: copy
    source: dip@workspace
    target: dip@access
    color: "#008800"
  - name: Delete Working Copies
    type: delete
    targets:
    - aip@workspace
    - data@workspace
    - dip@workspace
  - name: Ingest Complete
    type: status
---
