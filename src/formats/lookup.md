---
sql:
  formats: https://www.digipres.org/_data/formats/index/formats.parquet
  exts: https://www.digipres.org/_data/formats/index/extensions.parquet 
---
# File Extension Lookup

First...

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


Querying the `formats.parquet` directly:

```js
const new_url = `${window.location.pathname}#${ext}`;
        history.pushState(null, '', new_url);
```

```js
Inputs.table(await sql([`SELECT * FROM formats WHERE '${ext}' in extensions`]))
```

Querying the `extensions.parquet` file instead:

```js
Inputs.table(await sql([`SELECT * FROM exts WHERE id == '${ext}'`]))
```


```
// TODO Drop extensions.parquet OR just denormalise the full dataset and see if it's faster.
// TODO Support URLs like https://www.digipres.org/formats/extensions/#*.hpgl and map them to a virtual query

window.addEventListener("hashchange", () => {
  console.log("The hash has changed!");
});

```