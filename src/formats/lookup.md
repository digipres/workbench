---
sql:
  formats: https://www.digipres.org/_data/formats/index/formats.parquet
  exts: https://www.digipres.org/_data/formats/index/extensions.parquet 
---
# File Extension Lookup

This is an early prototype of a format extensions lookup page that works something like https://www.digipres.org/formats/extensions/#*.sd2 i.e. bookmarkable URLs to individual entries

```js
// Set up Observable config to read the window hash and integrate it:
const window_hash = Generators.observe((notify) => {
  const hashchange = (event) => notify(window.location.hash);
  addEventListener("hashchange", hashchange);
  notify('');
  return () => removeEventListener("hashchange", hashchange);
});
```

```js
const q = window_hash.slice(1).replace(/^\*\./,'');
const ext = view(
  Inputs.text({
    label: "Extension",
    placeholder: "Extension?",
    value: q
  })
);
```


```js
const new_url = `${window.location.pathname}#${ext}`;
        history.pushState(null, '', new_url);
```

```js
const formats = await sql([`SELECT * FROM formats WHERE '${ext}' in extensions`]);
```

```js
Inputs.table(formats, {
  format: {
    name: (value, i) => formats.get(i).id + ":" + value.toLowerCase()
  }
})
```


```
// TODO Drop extensions.parquet OR just denormalise the full dataset and see if it's faster.
// TODO Support URLs like https://www.digipres.org/formats/extensions/#*.hpgl and map them to a virtual query, i.e. switch to full query syntax with search parameters?

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

```