# Dataflows
## Mapping out how data flows from place to place

## Introduction

This is a dataflow diagram, designed to show how data moves between different systems over time.  The different places where data can be stored are laid out from top to bottom, and the sequence of events the data can go through are plotted from left to right. 

As an example, here is what it looks like for a simplified version of how the Open Archival Information System describes the flow of data through an archive:

```{dataflow}
domain ar "The Archive"
domain dc "Designated Community"
place store.ar "Archival Storage"
place producer.dc "Producer"
place consumer.dc "Consumer"
data sip "Submission Information Package"
data aip "Archival Information Package"
data dip "Dissemination Information Package"
# Ingest
move sip@producer.dc aip@store.ar
# Access
copy aip@store.ar dip@consumer.dc
```

The lines of the 'tube map' layout show how the data moves overall, but you can also click/press on the event 'stations' to get more information about what is happening at each stage.

Add more complex version  in separate page?
 https://commons.wikimedia.org/wiki/File:OAIS_Functional_Model_(en).svg 
 


```js
import yaml from "npm:js-yaml@4.1.0";

// Load the first YAML doc, i.e. the frontmatter:
const dfs_txt = await FileAttachment("ffaa.md").text();
var dfs = [];
yaml.loadAll(dfs_txt, function (doc) { if(doc) dfs.push(doc) });

//display(dfs)

const df = dfs[0];
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

const div = html`<div style="height: ${height}px; width: 100%; font-family: 'Hammersmith One', sans-serif; fill: #001919; font-size: 14px; font-weight: normal;" />
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
container
    .selectAll(".label")
    .attr("data-bs-toggle", "popo0ver")
    .attr("data-bs-container", "body")
    .attr("data-bs-html", "true")
    .attr("data-bs-title", function (d) {
    return d.label;
    })
    .attr("data-tippy-content", function (d) {
        //console.log(data.lines);
        const index = df.places.findIndex( (p) => p.name == d.name);
        const itemList = Array.from(d.items).reduce((joined, el) => joined + "<br>" + el);
        // Look up the place and add info from there
        if( d.description ) {
            return `<b>${d.label}</b><br>${d.description}<br><br>${itemList}`;
        } else {
            return `<b>${d.label}</b><br><br>${itemList}`;
        }
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

// Set up zoom:
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