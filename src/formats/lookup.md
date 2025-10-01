---
sql:
  formats: https://www.digipres.org/_data/formats/index/formats.parquet
---
# File Extension Lookup

First...

```js
const ext = view(
  Inputs.text({
    label: "Extension",
    placeholder: "Extension?",
    value: "r"
  })
);
```

```js
import {DuckDBClient} from "npm:@observablehq/duckdb";

const config = {
  filesystem: {
    forceFullHTTPReads: true
  }
}
const db = await DuckDBClient.of({exts: "https://www.digipres.org/_data/formats/index/extensions.parquet" }, config);
//const rows = await sql([`SELECT UNNEST(format_ids) AS ext FROM exts WHERE id == '${ext}'`]);
const rows = await db.sql([`SELECT UNNEST(format_ids) AS ext FROM exts WHERE id == '${ext}'`]);
```


```js
const fids = rows.toArray().map((r) => `'${r.ext}'`);
view(fids);
```


```js
Inputs.table(await sql([`SELECT * FROM formats WHERE id in (${fids})`]))
```

```js
Inputs.table(await sql([`SELECT * FROM formats WHERE '${ext}' in extensions`]))
```


```
// TODO

// Set up bookmarkable search results:
const search_params = new URLSearchParams(window.location.search);
// Support 'search-input' parameter:
const alt_key = 'search-input';
const alt_q = search_params.get(alt_key);
if( alt_q ) {
    search_params.set('q', alt_q );
    search_params.delete(alt_key);
}
// Do the search, if there is one:
pagefind.triggerSearch(search_params.get('q'));
// Set up the listener tom update the search parameters:
const search_input = document.querySelector('#search input');
search_input.addEventListener('input', (e) => {
    search_params.set('q', e.target.value);
    const new_url = `${window.location.pathname}?${search_params.toString()}`;
        history.pushState(null, '', new_url);
});

```