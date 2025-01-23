---
title: "Flickr Foundation"
places:
- id: flickr
  name: Flickr.com
- id: flickr-commons
  name: Flickr Commons
- id: collection
  name: "Print\nCollection"
- id: workstation
  name: "Workstation"
- id: archive
  name: "Archival System"
workflows:
- name: Accessible Archives
  initialZoom: 0.9
  events:
  - type: start
    sources: 
    - all@collection
    color: "#444"
    shiftCoords: [0,1] # TBD!!!!
  - type: derive
    name: "Select"
    source: all@collection
    target: toScan@collection
    markerPos: "N"
    color: "#444"
  - type: move
    name: "Transfer"
    source: toScan@collection
    target: toScan@workstation
  - type: derive
    name: "Digitise"
    source: toScan@workstation
    target: scanned@workstation
    color: "red"
    shiftCoords: [0,-1]
  - type: merge
    name: "Return"
    source: toScan@workstation
    target: all@collection
  - type: space
  - type: derive
    name: "Describe\n(baseline)"
    source: scanned@workstation
    target: metadata@workstation
    shiftCoords: [0,0]
    markerPos: "N"
    color: "darkblue"
  - type: space
  - type: copy
    name: "Upload Access Copy"
    source: scanned@workstation
    target: scanned@flickr
    markerAt: 0.7
  - type: copy
    name: "Upload Metadata"
    source: metadata@workstation
    target: metadata@flickr
    markerPos: "E"
    markerAt: 0.7
  - type: space
  - type: copy
    name: "Store Archive Copy"
    source: scanned@workstation
    target: scanned@archive
  - type: copy
    name: "Store Metadata"
    source: metadata@workstation
    target: metadata@archive
    markerPos: "E"
  - name: Delete Working Copies
    type: delete
    marker: interchange
    markerShiftCoords: [0,-0.5]
    markerPos: "E"
    targets:
    - metadata@workstation
    - scanned@workstation
  - type: derive
    name: "Annotate"
    source: metadata@flickr
    target: annotations@flickr
    marker: interchange
    color: "black"
    markerPos: "N"
    description: "Metadata being added, modified and enhanced by Flickr users."

  - type: space
  
  - type: derive
    name: "Create\nLifeboat"
    source: annotations@flickr
    target: lifeboat@flickr
    shiftCoords: [0,-2]
    markerPos: "S"
    color: "orange"
  - type: move
    name: "Download Lifeboat"
    source: lifeboat@flickr
    target: lifeboat@workstation
  - type: derive
    name: "Extract\nAnnotations"
    source: lifeboat@workstation
    target: annotations@workstation
    markerPos: "S"
    color: green
    shiftCoords: [0,-3]
  - type: copy
    name: Ingest Annotations
    source: annotations@workstation
    target: annotations@archive
    markerPos: "E"
    markerAt: 0.35
  - type: delete
    name: "Delete Lifeboat"
    marker: interchange
    markerPos: "E"
    markerShiftCoords: [0,-2.5]
    targets:
    - annotations@workstation
    - lifeboat@workstation
  - type: space
    name: ""
  - type: space
    name: ""
  - type: end
---
