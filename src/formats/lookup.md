---
sql:
  formats: https://www.digipres.org/_data/formats/index/formats.parquet
  exts: https://www.digipres.org/_data/formats/index/extensions.parquet 
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

// Supported forcing full read because GitHub wasn't supporting range requests, but they fixed that!
const config = {
  customUserAgent: "Wild Bob",
  filesystem: {
    forceFullHTTPReads: false
  }
}
const db = await DuckDBClient.of({exts: "https://www.digipres.org/_data/formats/index/extensions.parquet" }, config);
```

```js
Inputs.table(await sql([`SELECT * FROM formats WHERE '${ext}' in extensions`]))
```


```
// TODO Support URLs like https://www.digipres.org/formats/extensions/#*.hpgl and map them to a virtual query

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