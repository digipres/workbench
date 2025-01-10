# Dataflows

<!-- Add in the font for that London Look -->
<link
    href="https://fonts.googleapis.com/css?family=Hammersmith+One"
    rel="stylesheet"
    type="text/css"
/>

```js
const data_pubs = await FileAttachment("pubs.json").json();

//display(data_pubs)
```

```js
import yaml from "npm:js-yaml@4.1.0";

// Load the first YAML doc, i.e. the frontmatter:
const dfs_txt = await FileAttachment("bfi.md").text();
var dfs = [];
yaml.loadAll(dfs_txt, function (doc) { if(doc) dfs.push(doc) });

//display(dfs)

const df = dfs[0];
const wf = df.workflows[0];
```

```js
// Parser an item string, pulling out the place
// The final item includes the place
function parseItemInPlace( itemInPlace ) {
    const [id, place] = itemInPlace.split('@');
    const index = df.places.findIndex( (p) => p.id == place );
    if ( index >= 0 ) {
        return { item: itemInPlace, itemId: id, place: df.places[index], index: index };
    } else {
        // Add a default place for this one:
        df.places.push({
            'id': place,
            'name': place
        });
        return { item: itemInPlace, itemId: place, place: df.places.at(-1), index: df.places.length - 1 };
    }
}


function setupEntitiesForEvent( lines, stations, item, event ) {
    lines[item] = lines[item] || {
        "name": item,
        "color": event.color || "#aaa",
        "shiftCoords": event.shiftCoords || [0,0],
        "nodes": []
    };
    //
    stations[event.name] = stations[event.name] || { "label": event.label || event.name };
}

// Push into place:
function pushCopyEvent(lines, stations, item, event, sx, sy, tx, ty){
        const markerAt = event.markerAt || 0.5;
        const markerPos = event.markerPos || "W";
        const dir = Math.sign(ty-sy);
        lines[item].nodes.push({
                "coords": [sx+1,sy]
            },
            {
                "coords": [tx-2,sy]
            },
            {
                "coords": [tx-1,sy+dir*1]
            },
            {
                "name": event.name,
                "labelPos": markerPos,
                "coords": [tx-1, sy + markerAt*(ty-sy)]
            },
            {
                "coords": [tx-1, ty-dir*1]
            },
            {
            "coords": [tx, ty]
        });
}

function getTargets(event) {
    var targets = [];
    if( event.target ) {
        targets.push(parseItemInPlace(event.target));
    } else {
        targets = event.targets.map( (t) => parseItemInPlace(t) );
    }
    return targets;    
}
```

```js

const stations = {};
const lines = {};

// Loop through the events:
var time = 0;
const dt = 5;
const ds = -6; // Negative so the order matches what's in the source

// Loop through the events:
wf.events.forEach( event => {
    //display(event);
    // Current time window
    const t1 = time*dt;
    const t2 = (time + 1)*dt;
    // Add new lines if there has been a copy event.
    if( event.type == "copy" || event.type == "move" ) {
        const source = parseItemInPlace(event.source);
        var targets = getTargets(event);
        targets.forEach( (target ) => {
            const y1 = source.index*ds;
            const y2 = target.index*ds;
            // Default to doing a move:
            var item = source.item;
            // If it's a move, update the source item instead:
            if( event.type == "copy") {
                item = target.item;
                // Pass the colour through by default:
                event.color = event.color || lines[source.item].color;
            } 
            setupEntitiesForEvent(lines, stations, item, event );
            pushCopyEvent(lines, stations, item, event, t1, y1, t2, y2 );
            // But if it's a move, rename the line to match the new location:
            if( event.type == "move") {
                lines[target.item] = lines[item];
                lines[target.item].name = `${source.itemId}@${target.place.id}`;
                delete lines[event.source];
            }
        });
    } else if( event.type == "derive" || event.type == "rename" ) {
        const source = parseItemInPlace(event.source);
        var targets = getTargets(event);
        targets.forEach( (target ) => {
            var item = target.item;
            const y2 = target.index*ds;
            setupEntitiesForEvent(lines, stations, item, event );
            lines[item].nodes.push({
                "coords": [0.5*(t1+t2),y2],
                "name": event.name,
                "labelPos": event.markerPos || "S",
                "marker": event.marker || undefined,
                "shiftCoords": event.markerShiftCoords || [0,0]
            });
            if( event.type == "rename") {
                lines[source.item].terminated = t2;
                lines[source.item].nodes.push({
                  "coords": [0.5*(t1+t2),y2],
                });
            }
        });
    } else if( event.type == "start" ) {
        const source = parseItemInPlace(event.source);
        const item = source.item;
        const source_event = {
            'name': source.place.name,
            'label': source.place.name,
            'color': event.color
        }
        setupEntitiesForEvent(lines, stations, item, source_event );
        const y = source.index * ds;
        lines[source.item].nodes.push({
            "coords": [t1,y],
            "name": source.place.name,
            "labelPos": "W"
        },{
            "coords": [t2,y]
        });
        // End this item as these are just start-point markers
        lines[source.item].terminated = 0;
    } else if( event.type == "delete" ) {
        const targets = getTargets(event);
        targets.forEach( (target) => {
            var item = target.item;
            const y2 = target.index*ds;
            setupEntitiesForEvent(lines, stations, item, event );
            if (lines[item]) {
                lines[item].terminated = t2;
            }
            lines[item].nodes.push({
                "coords": [0.5*(t1+t2),y2],
                "name": event.name,
                "labelPos": event.markerPos || "S",
                "marker": event.marker || undefined,
                "shiftCoords": event.markerShiftCoords || [0,0]
            })
        });
    } else if( event.type == "end" ) {
        Object.keys(lines).forEach( (item) => {
            const target = lines[item];
            if( target.terminated != undefined ) return;
            const source = parseItemInPlace(target.name);
            const source_event = {
                'name': source.place.name,
                'label': source.place.name,
                'color': event.color
            }
            setupEntitiesForEvent(lines, stations, item, source_event );
            const y = target.nodes.at(-1)['coords'][1];
            target.nodes.push({
                "coords": [t2,y],
                "name": source.place.name,
                "labelPos": "E"
            });
            // End this item as these are just start-point markers
            target.terminated = 0;
        });
    }
    // Extend all active lines to t2 as needed:
    Object.keys(lines).forEach( (item ) => {
      const prev = lines[item].nodes.at(-1);
      if( prev.coords && prev.coords[0] < t2 && lines[item].terminated == undefined ) {
        lines[item].nodes.push( {"coords": [t2, prev.coords[1]]} );
      }
    });
    // Increment the timer:
    time = time + 1;
});

const data = {
    "stations": stations,
    "lines": Object.values(lines)
}

```


 
```js
import { tubeMap } from "npm:d3-tube-map";

var width = 1000;
var height = 500;

const div = html`<div style="height: 500px; width: 100%; font-family: 'Hammersmith One', sans-serif; fill: #001919; font-size: 14px; font-weight: normal;" />
<style>
svg {
  overflow: visible;
}
.label text {
  cursor: pointer
}
</style>`;

const container = d3.select(div);

const map = tubeMap()
    .width(width)
    .height(height)
    .margin({
        top: 2,
        right: 2,
        bottom: 4,
        left: 10,
    })
    .on("click", function (name) {
        console.log(name);
    });

container.datum(data).call(map);

display(div);

var svg = container.select("svg");

const zoom = d3.zoom().scaleExtent([0.1, 6]).on("zoom", zoomed);

var zoomContainer = svg.call(zoom);
var initialScale = wf.initialZoom || 0.75;
var initialTranslate = wf.initialOffset || undefined; // e.g. [100,10] etc.

zoom.scaleTo(zoomContainer, initialScale);
if( initialTranslate ) {
    zoom.translateTo(
        zoomContainer,
        initialTranslate[0],
        initialTranslate[1]
    );
}

function zoomed(event) {
    svg.select("g").attr("transform", event.transform.toString());
}
```
<details>
<summary>Debug Info</summary>

```js
display(data);
```
</details>

```js
import { showSaveFilePicker } from 'npm:file-system-access';

async function saveHtml(value) {
  try {
    // create a new handle
    const opts = {
      types: [
        {
          description: "HTML",
          accept: { "text/html": [".html"] },
        },
      ],
      suggestedName: 'export.html',
      _preferPolyfill: false,
    };
    const newHandle = await showSaveFilePicker(opts);

    // create a FileSystemWritableFileStream to write to
    const writableStream = await newHandle.createWritable();

    // write our file
    await writableStream.write(value);

    // close the file and write the contents to disk.
    await writableStream.close();
  } catch (err) {
    console.error(err.name, err.message);
  }
}


const scan_button = view(Inputs.button("Save as HTML", {value: container.node().outerHTML, reduce: saveHtml, disabled: false }));
```