# Format Registry Comparison

<https://upset.app/>

The most common set visualization approach – Venn Diagrams – doesn’t scale beyond three or four sets. UpSet, in contrast, is well suited for the quantitative analysis of data with more than three sets.

```js
import { load_extension_data } from "./registries.js";
import { extractCombinations, render } from 'npm:@upsetjs/bundle';

const exts = await load_extension_data();


const registries = [];
const reg_items = {};

exts.forEach( function (item, index) {
    // Store the registry IDs:
    registries.push(item.reg_id);
});
registries.push('uploaded');

```

```js
const csvfile = view(Inputs.file({label: "CSV file", accept: ".csv", required: true}));
```

```js
const uploaded = await csvfile.csv();
display(uploaded);
if( uploaded ) {
    const uploaded_item = { reg_id: 'uploaded', extensions: [] };
    uploaded.forEach( function (item, index) {
        var ext = item.extension.trim();
        ext = `*.${ext}`;
        uploaded_item.extensions.push(ext);
    });
    exts.push(uploaded_item);
}

```

```js
const selected = view(Inputs.checkbox(registries, {label: "Registries", value: registries , format: (x) => x}));
```

```js
// We have Registry_ID -> [extensions] but we need extension -> Registry_IDs
const ext_to_regs = {};
exts.forEach( function (item, index) {
    // Filter down the list, to the selected ones, but keep the order consistent:
    if( selected.includes(item.reg_id) ) {
    // Go through the extensions for this registry:
    item.extensions.forEach( function (ext, ext_index) {
        if( !(ext in ext_to_regs) ) {
            ext_to_regs[ext] = []
        }
        ext_to_regs[ext].push(item.reg_id);
    });
    }
});

// Convert to list in UpSetJs format:
const upset_input = [];
for (const [key, value] of Object.entries(ext_to_regs)) {
  upset_input.push( { name: key, sets: value });
}

//display(upset_input);
```



```js
const { sets, combinations } = extractCombinations(upset_input, {type: 'distinctIntersection'});
//display(combinations)


let selection = null;

function onHover(set) {
  selection = set;
  var exts = " ";
  if( set != null ) {
    exts = set.name + " extensions: " + set.elems.reduce(function(acc, item, index) {
      return acc + (index === 0 ? '' : ', ') + item.name;
    }, '');
    d3.select("#upset_set").node().textContent = exts;
  }
  //console.log(set);
  rerender();
}

function rerender() {
  const props = { sets, combinations, width: "900", height: 600, selection, onHover };
  render(d3.select("#upset").node(), props);
}

rerender();

```

<div id="upset" style="overflow-x:scroll;"></div>
<pre id="upset_set" style="overflow-x:scroll;"> </pre>

