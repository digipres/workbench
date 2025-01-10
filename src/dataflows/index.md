# Dataflows

<!-- Add in the font for that London Look -->
<link
    href="https://fonts.googleapis.com/css?family=Hammersmith+One"
    rel="stylesheet"
    type="text/css"
/>

```js
const dataa = await FileAttachment("pubs.json").json();

display(dataa)
```

```js
import yaml from "npm:js-yaml@4.1.0";

// Load the first YAML doc, i.e. the frontmatter:
const dfs_txt = await FileAttachment("bfi.md").text();
var dfs = [];
yaml.loadAll(dfs_txt, function (doc) { if(doc) dfs.push(doc) });
display(dfs)

const df = dfs[0];
const wf = df.workflows[0];

// Parser:
function parseItemInPlace( itemInPlace ) {
    const [item, place] = itemInPlace.split('@');
    const index = df.places.findIndex( (p) => p.id == place );
    if ( index >= 0 ) {
        return { item: item, place: place, index: index };
    } else {
        // Add a default place for this one:
        df.places.push({
            'id': place,
            'name': place
        });
        return { item: item, place: place, index: df.places.length - 1 };
    }
}

// Push into place:
function pushEvent(lines, stations, item, event, sx, sy, tx, ty){
        lines[item] = lines[item] || {
            "name": item,
            "color": event.color || "#aaa",
            "shiftCoords": event.shiftCoords || [0,0],
            "nodes": []
        };
        const markerAt = event.markerAt || 0.5;
        const markerPos = event.markerPos || "W";
        const dir = Math.sign(ty-sy);
        lines[item].nodes.push({
                "coords": [sx,sy],
                "marker": "interchange"
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
        //
        stations[event.name] = stations[event.name] || { "label": event.name };
}

const stations = {};
const lines = {};


// Loop through the events:
var time = 0;
const dt = 5;
const ds = 6;

// Loop through the events:
wf.events.forEach( event => {
    // Current time window
    const t1 = time*dt;
    const t2 = (time + 1)*dt;
    display(event);
    // Add new lines if there has been a copy event.
    if( event.type == "copy" && event.source ) {
        const source = parseItemInPlace(event.source);
        var targets = [];
        if( event.target ) {
            targets.push(parseItemInPlace(event.target));
        } else {
            targets = event.targets.map( (t) => parseItemInPlace(t) );
        }
        targets.forEach( (target ) => {
            const y1 = source.index*ds;
            const y2 = target.index*ds;
            pushEvent(lines, stations, target.item, event, t1, y1, t2, y2 )
        });
    }
    // Extend all active lines to t2 as needed:
    Object.keys(lines).forEach( (item ) => {
      const prev = lines[item].nodes.at(-1);
      if( prev.coords[0] < t2 ) {
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

display(data);

```


 
```js
import { tubeMap } from "npm:d3-tube-map";

var width = 1000;
var height = 800;

const div = html`<div style="height: 800px; width: 100%; font-family: 'Hammersmith One', sans-serif; fill: #001919; font-size: 14px; cursor: pointer; font-weight: normal;" />`;

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
var initialScale = 0.5;
var initialTranslate = [0, 0];

zoom.scaleTo(zoomContainer, initialScale);
/*
zoom.translateTo(
    zoomContainer,
    initialTranslate[0],
    initialTranslate[1]
);
*/

function zoomed(event) {
    svg.select("g").attr("transform", event.transform.toString());
}
```

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


```
js
const svg = view(html`<svg id="df" width="800" height="400"></svg>`);
```

```
js
import Snap from 'npm:snapsvg';
const s = new Snap("#df");
```

```
js

// Parser:
function parseItemInPlace( itemInPlace ) {
    const [item, place] = itemInPlace.split('@');
    const index = df.places.findIndex( (p) => p.id == place );
    return { item: item, place: place, index: index };
}

// Clear the existing SVG:
s.clear();

// Loop through the events:
var time = 0;
const dt = 20;
const ds = 40;
const ir = 4;
const l_style = {
                stroke: '#000',
                strokeWidth: 2
            };
// Loop through the events:
wf.events.forEach( event => {
    //display(event);
    if( event.type == "copy" && event.source ) {
        const source = parseItemInPlace(event.source);
        var targets = [];
        if( event.target ) {
            targets.push(parseItemInPlace(event.target));
        } else {
            targets = event.targets.map( (t) => parseItemInPlace(t) );
        }
        display(targets);
        targets.forEach( (target ) => {
            if( target.index < 0 ) return;
            display({ source: source, target: target });
            
            var arrow = s.polygon([0, 10, 4, 10, 2, 0, 0, 10]).attr({ fill: '#323232' }).transform('r90');
            var marker = arrow.marker(0, 0, 10, 10, 5, 5);

            const sx = source.index*ds;
            const sy = time*dt;
            const tx = target.index*ds;
            const ty = (time + 1)*dt;
            const tl = s.line( sx, sy, tx, ty );
            const sl = s.line( sx, sy, sx, ty );
            [tl].forEach( (l) => l.attr( l_style ));
            tl.attr({'markerEnd': marker});
            const tc = s.circle( tx, ty, ir );

            // Add on to list of items in each place:
            const place = df.places[target.index];
            place.items = place.items || {};
            place.items[target.item] = (place.items[target.item] || 0) + 1
            display(place)
        });
    }
    time = time + 1;
});
```

```
var bigCircle = s.circle(150, 150, 100);
// By default its black, lets change its attributes
bigCircle.attr({
    fill: "#bada55",
    stroke: "#000",
    strokeWidth: 5
});
// Now lets create another small circle:
var smallCircle = s.circle(100, 150, 30);
// Lets put this small circle and another one into a group:
var discs = s.group(smallCircle, s.circle(200, 150, 70));
// Now we can change attributes for the whole group
discs.attr({
    fill: "#fff"
});
// Now more interesting stuff
// Lets assign this group as a mask for our big circle
bigCircle.attr({
    mask: discs
});
// Despite our small circle now is a part of a group
// and a part of a mask we could still access it:
smallCircle.animate({r: 50}, 1000);
// We don’t have reference for second small circle,
// but we could easily grab it with CSS selectors:
discs.select("circle:nth-child(2)").animate({r: 50}, 1000);

```

