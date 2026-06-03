---
sql:
  icufl: ./data/gpo-icufl-files.parquet
---
# GPO ICUFL
## A case study

```js

function item_linker(item_id, i) {
  if( item_id != null && item_id != "" ) {
    return htl.html`<a href="https://webapp1.dlib.indiana.edu/virtual_disk_library/index.cgi/${item_id}" target="_blank">${item_id}</a>`
;
  } else {
    return null;
  }
}

function show_big_int(x) {
  // Hacky but normal formatting (toLocaleString) doesn't work for BigInt numbers
  return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

```

```js
const ext = view(
  Inputs.text({
    label: "Extension",
    placeholder: "Extension?",
    value: "dbf"
  })
);
```

```js
const entries = await sql([`SELECT item_id, COUNT(*) as count, sum(size) as size FROM icufl WHERE LOWER(extension) == LOWER('.${ext}') GROUP BY item_id ORDER BY count DESC`]);
```

Found ${entries.numRows} items with extensions matching '.${ext}':


```js
const s = view(Inputs.table(entries, {
  format: {
    size: show_big_int,
    item_id: item_linker
  },
  required: false,
  multiple: false
}));
```

```js
if( s ) {
  const files = await sql([`SELECT media, fid, path, size FROM icufl WHERE LOWER(extension) == LOWER('.${ext}') AND item_id == '${s.item_id}' ORDER BY media ASC, path ASC`]);
  display(Inputs.table(files, { layout: 'auto', select: false }));
} else {
  display("Please select an item.");
}
```


```js
if( s ) {
  const exts = await sql([`SELECT LOWER(extension) AS extension, count(*) AS count, sum(size) as size FROM icufl WHERE item_id == '${s.item_id}' GROUP BY LOWER(extension) ORDER BY size DESC`]);
  display(Inputs.table(exts, { 
    layout: 'auto', 
    select: false,
    format: {
      size: show_big_int
      }
    }));
} else {
  const exts = null;
  display("Please select an item.");
}
```




Direct links require the `FID####` part, which is (presumably) in the METS/MARC but is not explicit elsewhere.

https://webapp1.dlib.indiana.edu/virtual_disk_library/index.cgi/4951822/FID2042/data/readme.txt

