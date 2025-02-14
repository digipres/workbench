# Dataflows
## Mapping out how data flows from place to place

## Introduction

This is a dataflow diagram, designed to show how data moves between different systems over time.  The different places where data can be stored are laid out from top to bottom, and the sequence of events the data can go through are plotted from left to right. 

As an example, here is what it looks like for a simplified version of how the Open Archival Information System describes the flow of data through an archive:

The lines of the 'tube map' layout show how the data moves overall, but you can also click/press on the event 'stations' to get more information about what is happening at each stage.

Add more complex version  in separate page?
 https://commons.wikimedia.org/wiki/File:OAIS_Functional_Model_(en).svg 
 


```js
import yaml from "npm:js-yaml@4.1.0";
import { parseDataflow } from "./dataflows.js";

// Load the first YAML doc, i.e. the frontmatter:
const dfs_txt = await FileAttachment("bfi.md").text();
var dfs = [];
yaml.loadAll(dfs_txt, function (doc) { if(doc) dfs.push(doc) });
var df = dfs[0];


df = parseDataflow( await FileAttachment("oais-simple.dfl").text() );

display(df)
```
```js
const wf = df.workflows[0];
```


```js
import { tubeMap } from "npm:d3-tube-map";
import * as bootstrap from 'npm:bootstrap'
import * as Popper from "npm:@popperjs/core"
import { generateTubeMapData } from "./dataflows.js";

const data = generateTubeMapData(df, wf);

var width = 1000;
var height = 500;

const div = html`<div style="height: ${height}px; width: 100%; border: 1px solid lightgray;" />
<style>
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

function getPlaceByName(df, name) {
        const index = df.places.findIndex( (p) => p.name == name);
        return df.places[index];
}

function formatEvent(e) {
    if( e.type == "derive" ) {
        return `<i>Derive ${e.target} from ${e.source}</i>.<br>${e.description || ''}`;
    } else if( e.type == "copy") {
        return `<i>Copy ${e.source} to ${e.target}</i>.<br>${e.description || ''}`;
    } else if( e.type == "move") {
        return `<i>Move ${e.source} to ${e.target}</i>.<br>${e.description || ''}`;
    } else if( e.type == "merge") {
        return `<i>Merge ${e.source} into ${e.target}</i>.<br>${e.description || ''}`;
    } else if( e.type == "delete") {
        return `<i>Delete ${e.targets.join(', ') || e.target}</i>.<br>${e.description || ''}`;
    } else if( e.type == "start") {
        return `<i>Starts with ${e.item.item}</i>.<br>${e.description || ''}`;
    } else if( e.type == "end") {
        return `<i>Ends with ${e.item.item}</i>.<br>${e.description || ''}`;
    } else {
        return `<i>${JSON.stringify(e, null, 2)}</i>`;
    }
}

container.datum(data).call(map);
container
    .selectAll(".label")
    .attr("font-family", "Hammersmith One")
    .attr("data-tippy-content", function (d) {
        //console.log(data.lines);
        console.log(d);
        const eventList = Array.from(d.events).map(formatEvent).join(" ");
        // Format the whole thing:
        return `<b>${d.label}</b><br>${eventList}`;
    })
    .attr("tabindex", 0);

display(div);

// Enable tool tips:
tippy('[data-tippy-content]',{
    allowHTML: true,
    sticky: true,
    trigger: 'click mouseenter focus',
    interactive: true,
    // Need to do this to see interactive tooltips:
    // https://atomiks.github.io/tippyjs/v5/faq/#my-tooltip-appears-cut-off-or-is-not-showing-at-all
    appendTo: document.body
});

// Work with the SVG:
var svg = container.select("svg");

// Make SVG size match initial size:
svg.attr('height', height);
svg.attr('width', width);

// Add reference to get the font:
svg.append('defs')
            .append('style')
            .attr('type', 'text/css')
            .text("@import url('https://fonts.googleapis.com/css?family=Hammersmith+One');");

// Set up zoom:
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

async function saveSvg(value) {
  try {
    // create a new handle
    const opts = {
      types: [
        {
          description: "SVG",
          accept: { "image/svg": [".svg"] },
        },
      ],
      suggestedName: 'dataflow.svg',
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

const xmlns = "http://www.w3.org/2000/xmlns/";
const xlinkns = "http://www.w3.org/1999/xlink";
const svgns = "http://www.w3.org/2000/svg";

function serialize(svg) {
    svg = svg.cloneNode(true);
    const fragment = window.location.href + "#";
    const walker = document.createTreeWalker(svg, NodeFilter.SHOW_ELEMENT);
    while (walker.nextNode()) {
      for (const attr of walker.currentNode.attributes) {
        if (attr.value.includes(fragment)) {
          attr.value = attr.value.replace(fragment, "#");
        }
      }
    }
    svg.setAttributeNS(xmlns, "xmlns", svgns);
    svg.setAttributeNS(xmlns, "xmlns:xlink", xlinkns);
    const serializer = new window.XMLSerializer;
    const string = serializer.serializeToString(svg);
    return new Blob([string], {type: "image/svg+xml"});
}


const save_button = view(Inputs.button("Save as SVG", {value: serialize(svg.node()), reduce: saveSvg, disabled: false }));
```

```js
function rasterize(svg) {
  let resolve, reject;
  const promise = new Promise((y, n) => (resolve = y, reject = n));
  const image = new Image;
  image.onerror = reject;
  image.onload = () => {
    const rect = svg.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    // Get the bounding box and scale up for better resolution image:
    var bBox = svg.getBBox();
    canvas.width = 4*bBox.width;
    canvas.height = 4*bBox.height;
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    context.canvas.toBlob(resolve);
  };
  image.src = URL.createObjectURL(serialize(svg));
  return promise;
}

async function saveImage(value) {
  try {
    // create a new handle
    const opts = {
      types: [
        {
          description: "PNG",
          accept: { "image/png": [".png"] },
        },
      ],
      suggestedName: 'dataflow.png',
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


const save_png_button = view(Inputs.button("Save as PNG", {value: await rasterize(svg.node()), reduce: saveImage, disabled: false }));
```
