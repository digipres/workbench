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
    value: observable.params.ext
  })
);
```

```js
const rows = await sql([`SELECT UNNEST(format_ids) AS ext FROM exts WHERE id == '${ext}'`]);
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

The current ext is ${observable.params.ext}.
