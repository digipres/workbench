import {FileAttachment} from "npm:@observablehq/stdlib";
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