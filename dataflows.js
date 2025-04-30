import { showSaveFilePicker } from 'file-system-access';
import { tubeMap } from "d3-tube-map";
import {html} from "htl";
import * as d3 from "d3";
import tippy from "tippy.js"

// Parser an item string, pulling out the place
// The final item includes the place
function parseItemInPlace( df, itemInPlace ) {
    //console.log(`Splitting ${itemInPlace}`);
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


function setupEntitiesForEvent( lines, stations, item, event, parentShiftCoords ) {
    lines[item] = lines[item] || {
        "name": item,
        "color": event.color || "#aaa",
        "shiftCoords": event.shiftCoords || parentShiftCoords || [0,0], 
        "nodes": []
    };
    // Set up the station:
    stations[event.name] = stations[event.name] || {
        "label": event.label || event.name,
        "items": new Set(),
        "events": new Set()
    };
    // Remember the lines that meet this station:
    stations[event.name].items.add(item);
    // Remeber the events associated with this station:
    stations[event.name].events.add(event);
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

function getTargets(df, event) {
    var targets = [];
    if( event.target ) {
        targets.push(parseItemInPlace(df, event.target));
    } else {
        targets = event.targets.map( (t) => parseItemInPlace(df, t) );
    }
    return targets;    
}

export function generateTubeMapData(df, wf) {

    const stations = {};
    const lines = {};
    
    // Loop through the events:
    var time = 0;
    const dt = 5;
    const ds = -8; // Negative so the order matches what's in the source
    
    // Loop through the events:
    wf.events.forEach( event => {
        //display(event);
        // Current time window
        const t1 = time*dt;
        const t2 = (time + 1)*dt;
        // Add new lines if there has been a copy event.
        if( event.type == "copy" || event.type == "move" ) {
            const source = parseItemInPlace(df, event.source);
            var targets = getTargets(df, event);
            targets.forEach( (target ) => {
                const y1 = source.index*ds;
                const y2 = target.index*ds;
                // Default to doing a move:
                var item = source.item;
                // If it's a move, update the source item instead:
                if( event.type == "copy") {
                    item = target.item;
                    // Pass properties through by default:
                    event.color = event.color || lines[source.item].color;
                    event.shiftCoords = event.shiftCoords || lines[source.item].shiftCoords || [0,0];
                } 
                setupEntitiesForEvent(lines, stations, item, event );
                pushCopyEvent(lines, stations, item, event, t1, y1, t2, y2 );
                // But if it's a move, rename the line to match the new location:
                if( event.type == "move") {
                    lines[target.item] = lines[item];
                    lines[target.item].name = `${source.itemId}@${target.place.id}`;
                    delete lines[target.item].terminated;
                    delete lines[event.source];
                }
            });
        } else if( event.type == "merge" ) {
            const source = parseItemInPlace(df, event.source);
            var targets = getTargets(df, event);
            targets.forEach( (target ) => {
                const y1 = source.index*ds;
                const y2 = target.index*ds;
                // Where we start from:
                var item = source.item;
                setupEntitiesForEvent(lines, stations, item, event );
                pushCopyEvent(lines, stations, item, event, t1, y1, t2, y2 );
                // Record as a merge:
                lines[item].name = `${target.itemId}@${target.place.id}`;
            });
        } else if( event.type == "derive" || event.type == "rename" ) {
            const source = parseItemInPlace(df, event.source);
            var targets = getTargets(df, event);
            targets.forEach( (target ) => {
                var item = target.item;
                const y2 = target.index*ds;
                var parentShiftCoords = null;
                if( lines[source.item] ) parentShiftCoords = lines[source.item].shiftCoords || [0,0];
                setupEntitiesForEvent(lines, stations, item, event, parentShiftCoords );
                lines[item].nodes.push({
                    "coords": [0.5*(t1+t2),y2],
                    "name": event.name,
                    "labelPos": event.markerPos || "S",
                    "marker": event.marker || undefined,
                    "shiftCoords": event.markerShiftCoords || event.shiftCoords|| lines[source.item].shiftCoords || [0,0]
                });
                if( event.type == "rename") {
                    lines[source.item].terminated = t2;
                    lines[source.item].nodes.push({
                      "coords": [0.5*(t1+t2),y2],
                    });
                }
            });
        } else if( event.type == "start" ) {
            var sources = getTargets(df, event);
            sources.forEach( ( source ) => {
                const item = source.item;
                const source_event = {
                    'type': 'start',
                    'name': source.place.name,
                    'label': source.place.name,
                    'color': event.color,
                    'item': source
                }
                setupEntitiesForEvent(lines, stations, item, source_event );
                const y = source.index * ds;
                lines[source.item].nodes.push({
                    "coords": [t1,y],
                    "name": source.place.name,
                    "labelPos": "W"
                },{
                    "coords": [t1+1,y]
                });
                // End this item as these are just start-point markers
                //lines[source.item].terminated = t1;
                // Note that start point is marked:
                lines[source.item].markedAtStart = true;
            });
        } else if( event.type == "delete" ) {
            const targets = getTargets(df, event);
            targets.forEach( (target) => {
                var item = target.item;
                const y2 = target.index*ds;
                setupEntitiesForEvent(lines, stations, item, event );
                if (lines[item]) {
                    //console.log(item)
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
                if( target.markedAtStart ) return;
                const source = parseItemInPlace(df, target.name);
                const endpoint_name = source.place.name+'_END';
                const source_event = {
                    'type': "end",
                    'name': endpoint_name,
                    'label': source.place.name,
                    'item': source,
                    'color': event.color
                }
                setupEntitiesForEvent(lines, stations, item, source_event );
                const y = target.nodes.at(-1)['coords'][1];
                target.nodes.push({
                    "coords": [t2,y],
                    "name": endpoint_name,
                    "labelPos": "E"
                });
            });
        }
        // Extend all active lines to t2 as needed:
        Object.keys(lines).forEach( (item ) => {
          const prev = lines[item].nodes.at(-1);
          if( prev && prev.coords && prev.coords[0] < t2 && lines[item].terminated == undefined ) {
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

    return data;
}


export function parseDataflow(text) {
    // Set up basic structure
    const dfs = {
        title: '',
        places: [],
        items: [],
        workflows: [],
    }
    var workflow = { title: '', events: [] };
    dfs.workflows.push(workflow);
    // Place to store longer comments:
    var multilineComment = null;
    // Loop over the lines:
    var lineCounter = 0;
    const lines = text.split('\n');
    lines.forEach(function(line) {
        // Up the counter:
        lineCounter += 1;
        // Are we in a multiline comment?
        if( multilineComment != null ) {
            if ( line.startsWith('"""') ) {
                //console.log("Multiline-comment ends!" + multilineComment);
                multilineComment = null;
            } else {
                multilineComment += line;
            }
        } else {
            // Normal line handling:
            line = line.trim();
            if( line.startsWith('#')) {
                //console.log("Comment " + line);
            } else if ( line.startsWith('"""') ) {
                //console.log("Multiline-comment begins!");
                multilineComment = "";
            } else {
                // Split the line on spaces, unless quoted.
                const l = line.match(/(?:[^\s"]+|"[^"]*")+/g);
                if( l == null ) {
                    return;
                }
                // Set up an event:
                var event = undefined;
                // Parse the line parts and create an event with the right shape:
                if( ["move", "copy", "derive", "rename", "merge"].includes(l[0])) {
                    event = {
                        label: l[3] || l[0],
                        type: l[0],
                    };
                    // Parse offset if any:
                    if( l[4] ) {
                        event.shiftCoords = JSON.parse(l[4])
                    }
                    // Specific adjustments:
                    if( l[0] == "copy") {
                        event.source = l[1];
                        event.targets = l[2].split(",");
                        event.color = event.source;
                    } else if( l[0] == "merge") {
                        event.sources = l[1].split(","),
                        event.target = l[2]
                        event.color = event.target;
                    } else {
                        event.source = l[1],
                        event.target = l[2]
                        event.color = event.target;
                    }
                } else if( ["space", "end"].includes(l[0])) {
                    // Push this event in:
                    event = {
                        label: l[1] || l[0],
                        type: l[0],
                    }
                } else if( l[0] == "delete" || l[0] == "start" ) {
                    // FIXME Kinda broken because only one color is allowed and there could be multiple starts
                    event = {
                        label: l[2] || l[0],
                        type: l[0],
                        targets: l[1].split(','),
                        color: l[1]
                    }
                } else if( l[0] == "place") {
                    const place = {
                        id: l[1],
                        name: l[2] || l[1]
                    }
                    place.name = place.name.replace(/^"(.*)"$/, '$1');
                    dfs.places.push(place)
                } else if( l[0] == "data") {
                    const data = {
                        id: l[1],
                        name: l[2] || l[1],
                        color: l[3] || undefined
                    }
                    dfs.items[data.id] = data;
                } else if( l[0] == "title" ) {
                    dfs.title = l[1].replace(/^"(.*)"$/, '$1');
                }
                // Record the event, if set:
                if( event != undefined) {
                    // Force a unique event 'name' (internal reference):
                    event.name = `l-${lineCounter}`;
                    // Extract any position, strip any quotes (e.g. label@W or "This thing"@S ):
                    if( event.label ) {
                        if( event.label.includes('@')) {
                            const [new_label, pos] = event.label.split('@');
                            event.label = new_label;
                            event.markerPos = pos;
                        }
                        event.label = event.label.replace(/^"(.*)"$/, '$1');
                    }
                    // Convert color
                    if( event.color ) {
                        const item = event.color.split('@');
                        event.color = dfs.items[item[0]].color || undefined;
                    }
                    // Record the event in the sequence:
                    workflow.events.push(event);
                }
            }
        }
    });

    return dfs;
}


export async function generateDataflow(dfl, width=800, height=600) {

    const df = parseDataflow( dfl );

    const wf = df.workflows[0];

    const data = generateTubeMapData(df, wf);

    const div = html`<div style="height: ${height}px; width: ${width}; border: 1px solid lightgray;" />
    <style>
    .label text {
      cursor: pointer
    }
    </style>
    `;
    
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
            //console.log(d);
            const eventList = Array.from(d.events).map(formatEvent).join(" ");
            // Format the whole thing:
            return `<b>${d.label}</b><br>${eventList}`;
        })
        .attr("tabindex", 0);
    
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

    // Attach a reference here so we can use it from the client: 
    div.svg = svg;


    return div;
}

export function enableTooltips() {
    tippy('[data-tippy-content]',{
        allowHTML: true,
        sticky: true,
        trigger: 'click mouseenter focus',
        interactive: true,
        // Need to do this to see interactive tooltips:
        // https://atomiks.github.io/tippyjs/v5/faq/#my-tooltip-appears-cut-off-or-is-not-showing-at-all
        appendTo: document.body
    });
}

const xmlns = "http://www.w3.org/2000/xmlns/";
const xlinkns = "http://www.w3.org/1999/xlink";
const svgns = "http://www.w3.org/2000/svg";

export function serialize(svg) {
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

export async function saveSvg(value) {
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
  

export function rasterize(svg) {
    let resolve, reject;
    const promise = new Promise((y, n) => (resolve = y, reject = n));
    const image = new Image;
    image.onerror = reject;
    image.onload = () => {
      const rect = svg.getBoundingClientRect();
      const canvas = document.createElement('canvas');
      // Get the bounding box and scale up for better resolution image:
      var bBox = svg.getBBox();
      canvas.width = 2*bBox.width; // This 2x4 avoids the PNG being all squished. Not clear why!
      canvas.height = 4*bBox.height;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      context.canvas.toBlob(resolve);
    };
    image.src = URL.createObjectURL(serialize(svg));
    return promise;
  }
  
  export async function saveImage(value) {
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

export async function renderDataflows() {

    const dataflows = [];

    var codes = document.getElementsByClassName('language-dataflow');
    for (var i=0; i < codes.length; i++) {
      const dataflow = await generateDataflow(codes[i].innerText);
      const dataflowId = `dataflow-${i}`;
      var current = document.getElementById(dataflowId);
      if( current != null ) {
        console.log(`Reusing ${dataflowId}...`);
        current.replaceChildren(dataflow);
      } else {
        console.log(`Inserting ${dataflowId}...`);
        const inserted = codes[i].parentElement.insertAdjacentElement('afterend', dataflow);
        inserted.id = dataflowId;
        codes[i].parentElement.hidden = true;
      }
    }
    enableTooltips();
}
