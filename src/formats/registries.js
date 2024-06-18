import {FileAttachment} from "npm:@observablehq/stdlib";
import * as Plot from "npm:@observablehq/plot";
import 'npm:core-js/actual/set';

export const load_extension_data = async function() {
    // Load the data:
    const exts_dict = await FileAttachment("../data/extensions.json").json();
    
    // Create ordered array of dictionaries with registry-name, Sets-of-extensions, from the source data:
    var exts = Object.keys(exts_dict).map(function(key) {
        return  {
            reg_id: key, 
            extensions: new Set(exts_dict[key])
        };
    });
    
    // Sort the array based on the size of the sets:
    exts.sort(function(first, second) {
        return second.extensions.size - first.extensions.size;
    });
    
    // Calculate how many extensions are unique to each registry:
    exts.forEach( function (item, index) {
        // Make a copy of the set:
        var unique_exts = new Set(item.extensions);
        // Loop all and drop:
        exts.forEach( function (other_item, other_index) {
            if (index != other_index) {
                unique_exts = unique_exts.difference(other_item.extensions);
            }
        });
        // Record the results:
        item.unique_extensions = unique_exts;
        item.num_unique = unique_exts.size;
        item.num_extensions = item.extensions.size;
        item.percent_unique = 100.0*unique_exts.size/item.extensions.size;
    });
  
    return exts;
};


/* 
 * re-usable plot generation as this appears on multiple pages
 */
export const generate_exts_chart = async function(width) {
    const exts = await load_extension_data();

    // Set up the plot:
    const exts_chart = Plot.plot({
        title: "Comparing Format Registries",
        subtitle: "Based on counting file extensions",
        style: "overflow: visible;",
        width,
        marginBottom: 50,
        x: {grid: true, label: "Registry ID", tickRotate: -30 },
        y: {grid: true, label: "No. of File Extensions" },
        // Using the same label as 'x' stops both being shown in the tooltip:
        color: {legend: false, label: "Registry ID" },
        marks: [
            Plot.ruleY([0]),
            Plot.rectY(exts, {x: "reg_id", y: "num_extensions", fill: "reg_id", sort: { x: "y" }, tip: true }),
            Plot.text(exts, {x: "reg_id", y: "num_extensions", text: (d) => d.num_extensions, dy:-8, textAnchor: "middle"}),
            Plot.axisY({label: "Total Number of File Extensions"}),
        ]
    });

    return exts_chart;
}