---
sql:
  formats: https://www.digipres.org/_data/formats/index/formats.parquet
  exts: https://www.digipres.org/_data/formats/index/extensions.parquet 
---
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
// Clean up the extension:
const ext = ext_q.replace(/^[\*\.]+/,'');
// Return a promise as this will get resolved when writing the table:
const formats = sql([`SELECT * FROM formats WHERE '${ext}' in extensions`]);
// And update the URL for the page
search_params.set('ext', ext);
const new_url = `${window.location.pathname}?${search_params.toString()}`;
history.pushState(null, '', new_url);
```

```js

function registry_linker(value, i, formats) {
  const reg_url = formats.get(i).registry_url;
  const title = (value.length > 50) ? value.substring(0,50) + "..." : value;
  if( reg_url ) {
    return html`<a href="${reg_url}" target="_blank">${title}</a>`;
  } else {
    return html`${title}`;
  }
}
```

```js
Inputs.table(formats, {
  layout: 'auto',
  columns: [ 
    'registry_id',
    'name',
    'version',
    'extensions'
  ],
  format: {
    name: registry_linker
  }
})
```

<details>
<summary>Debug Info</summary>

Raw results for the first row:

```js
formats.get(0)
```

</details>


## Notes

- Supports fragment-based queries, so it can replace the format aggregator (e.g. https://www.digipres.org/formats/extensions/#*.sd2)

### To Do

- Drop extensions.parquet or switch it to denormalise the full dataset and see if it's faster.
- Registry URLs :
  - missing prefix for Just Solve
  - Have erroneous trailing slash for LOC
  - Go nowhere for file, mediainfo, tcdb, trid
  - Don't work for NARA
  - Have an extra `pronom:` in for PRONOM
