# File Extension Lookup
## Finding formats across multiple information sources

Enter the file extension to look for, e.g. `pdf`/`tiff`/`dat`/etc.:

```js
// Support #*.ext fragment URLs
const q_hash = window.location.hash.slice(1);
// Prefer query ext=EXT URLs
const search_params = new URLSearchParams(window.location.search);
if( q_hash ) {
    search_params.set('ext', q_hash );
}
const q = search_params.get('ext');

const ext_q = view(
  Inputs.text({
    label: "Extension",
    placeholder: "Extension?",
    value: (q === null) ? "" : q
  })
);
```

```js
//  exts: https://www.digipres.org/_data/formats/index/extensions.parquet
// Set up the database connection:
const sql = await DuckDBClient.sql({formats: `https://www.digipres.org/_data/formats/index/formats.parquet`});
```

```js
// Clean up the extension:
const ext = ext_q.replace(/^[\*\.]+/,'');
// Return a promise as this will get resolved when writing the table:
const formats = sql([`SELECT * FROM formats WHERE '${ext}' in extensions AND name != ''`]);
// And update the URL for the page
if ( ext_q != "" ) {
  search_params.set('ext', ext);
  const new_url = `${window.location.pathname}?${search_params.toString()}`;
  history.pushState(null, '', new_url);
}
```

```js
function registry_linker(value, i, formats) {
  const reg_url = formats.get(i).registry_url;
  const truncated = truncateString(value, 35);
  if( reg_url ) {
    return html`<a href="${reg_url}" target="_blank">${truncated}</a>`;
  } else {
    return html`${truncated}`;
  }
}

function truncateString(str, num) {
  if (str.length > num) {
    return str.slice(0, num) + "...";
  } else {
    return str;
  }
}

function software_links(x) { 
  const items = []
  const value = x.toArray().forEach( (r) => {
    if( r.name ) {
      if( r.registry_url ) {
        items.push(html`<a href="${r.registry_url}" target="_blank">${r.name}</a>`)
      } else {
        items.push(html`${r.name}`)
      }
      items.push(", ")
    }
  });
  // Return the items, dropping the ", " at the end:
  if( items.length > 0 ) {
    return html`${items.slice(0, items.length-1)}`;
  } else {
    return '';
  }
}

```

```js

const selected = view(Inputs.table(formats, {
  required: false,
  layout: 'fixed',
  sort: 'name',
  columns: [ 
    'registry_id',
    'name',
    'extensions',
    'readers',
    'writers'
  ],
  header: {
    'registry_id': 'source'
  },
  width: {
    'name': 300
  },
  format: {
    name: registry_linker,
    extensions: (x) => truncateString(x.toArray().join(', '), 16),
    readers: software_links,
    writers: software_links
  }
}));
```
## Selected formats

${ (selected.length == 0 ) ? html`<div class='tip'>Use left-hand column of the table above to select formats of interest, and they will appear here as cards showing more details about each format.</div>` : "" }

<div class="grid grid-cols-3">
${selected.reverse().map( (f) => {
  return html`<div class="card">
  <h2>${f.name} ${f.version}</h2>
  <h3><a href="${f.registry_url}">${f.id}</a></h3>
  <p style="overflow:hidden">${(f.summary && f.summary.length > 200) ? f.summary.substring(0,200) + "..." : f.summary}</p>
  <p><b>Extensions:</b> ${f.extensions.toArray().join(", ")}</p>
  <p><b>Media Types:</b> ${f.media_types.toArray().join(", ")}</p>
  <p><b>Readers:</b>${software_links(f.readers)}</p>
  <p><b>Writers:</b>${software_links(f.writers)}</p>
  <details><summary>Debug</summary><pre>${JSON.stringify(f.toJSON(), null, 2)}</pre></details>
  </div>`;
})}
</div>


## Notes

- Supports fragment-based queries, so it can replace the format aggregator (e.g. https://www.digipres.org/formats/extensions/#*.sd2)

## To Do

- Drop extensions.parquet or switch it to denormalise the full dataset and see if it's faster.
- File registry has a lot of empty names
- Registry URLs :
  - Go nowhere for file, mediainfo, tcdb, trid
