
```js
import yaml from "npm:js-yaml@4.1.0";

// Load the first YAML doc, i.e. the frontmatter:
const dfs_txt = await FileAttachment("ffaa.md").text();
var dfs = [];
yaml.loadAll(dfs_txt, function (doc) { if(doc) dfs.push(doc) } );
var df = dfs[0];
var wf = df.workflows[0];

```

```js
html`<pre><code>dataflow 1.0
title "${df.title}"
${df.places.map((p, i) => `place ${p.id} "${p.name}"\n`)}
${df.workflows[0].events.map((e,i) => {
    var line = `${e.type} `
    if( e.source ) {
        line += `${e.source} `;
    } else if (e.sources) {
        line += `${e.sources.join(',')} `;
    }
    
    if( e.target) {
        line += `${e.target} `;
    } else if (e.targets) {
        line += `${e.targets.join(',')} `;
    }

    if( e.name ) {
      line += `"${e.name.replace('\n', '\\n')}"`;
    }
    if( e.markerPos ) {
        line += `@${e.markerPos}`
    }
    if( e.markerShiftCoords ) {
        line += ` [${e.shiftCoords}]`;
    }
    return `${line}\n`;
})}
</code><pre>`
```




