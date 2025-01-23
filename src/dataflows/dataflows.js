

// Parser an item string, pulling out the place
// The final item includes the place
function parseItemInPlace( df, itemInPlace ) {
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
function getSources(df, event) {
    var sources = [];
    if( event.source ) {
        sources.push(parseItemInPlace(df, event.source));
    } else {
        sources = event.sources.map( (s) => parseItemInPlace(df, s) );
    }
    return sources;    
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
                    event.shiftCoords = event.shiftCoords || lines[source.item].shiftCoords;
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
                if( lines[source.item] ) parentShiftCoords = lines[source.item].shiftCoords;
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
            var sources = getSources(df, event);
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
                    console.log(item)
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