---
sql:
  #icufl: ./gpo-icufl-files.parquet
  icufl: https://www.digipres.org/practices/reports/gpo-icufl-collection-analysis-2026/data/gpo-icufl-files.parquet
  #icufl: https://digipres-practices.netlify.app/reports/gpo-icufl-collection-analysis-2026/data/gpo-icufl-files.parquet
  icufl_items: https://www.digipres.org/practices/reports/gpo-icufl-collection-analysis-2026/data/gpo-icufl-items.csv
---
# GPO IUCFL Collection Explorer
## A tool to help look for file formats and patterns in the Indiana University CD-ROM & Floppy Library

<div class="tip">

<a href="https://www.dpconline.org/"><img src="../../../images/DPCLogoSquareSmall.png" style="float: right; margin: 5px;"/></a>
This tool was developed as part of [this piece of work with the U.S. Government Publishing Office](https://www.digipres.org/practices/reports/gpo-icufl-collection-analysis-2026/us-gpo-icufl-review-2026.html). The work was funded by the [Digital Preservation Coalition Member Support programme](https://www.dpconline.org/digipres/discover-good-practice/dedicated-support-for-members). If you have any questions, please do [get in touch](mailto:info@dpconline.org).

</div>

## Purpose

The purpose of this tool is to help find formats and patterns of file extensions in the copy of the [Indiana University CD-ROM & Floppy Library](https://webapp1.dlib.indiana.edu/virtual_disk_library/) held by the U.S. Government Publishing Office. See [the full report](https://www.digipres.org/practices/reports/gpo-icufl-collection-analysis-2026/us-gpo-icufl-review-2026.html) for more details.


<div class="warning" label="Warning! May be slow!">
This system depends on a database file containing information on over six million files, over 175MB in size. It might take a while to start up and respond.
</div>

## Query
First, enter an extension of interest, e.g. `dbf`/`pdf`/`bat`/`shp`.

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
    value: ""
  })
);
```

```js
const entries = await sql([`SELECT item_id, COUNT(*) as count, sum(size) as size FROM icufl WHERE LOWER(extension) == LOWER('.${ext}') GROUP BY item_id ORDER BY count DESC`]);
```

Found ${entries.numRows} items with extensions matching '.${ext}'. The following table shoes a list of all items that match:


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

If you select an item in the list (using the small circle in the left-hand column), more details about the item will be shown below (although it might take a moment to update).

## Files with extension '${ext}' in the selected item

```js

function item_file_linker(path, i, d) {
  if( path != null && path != "" ) {
    const fid = d.get(i).fid;
    const full_path = `${fid}/${path}`;
    const file_name = full_path.substring(full_path.lastIndexOf('/')+1);
    const dir = full_path.substring(0, full_path.lastIndexOf('/'));
    return htl.html`<a href="https://webapp1.dlib.indiana.edu/virtual_disk_library/index.cgi/${q_item_id}/${dir}" target="_blank">${dir}</a>/<a href="https://webapp1.dlib.indiana.edu/virtual_disk_library/index.cgi/${q_item_id}/${full_path}" target="_blank">${file_name}</a>`;
  } else {
    return null;
  }
}

const files = await sql([`SELECT fid, path, size FROM icufl WHERE LOWER(extension) == LOWER('.${ext}') AND item_id == '${q_item_id}' ORDER BY media ASC, path ASC`]);
```

```js
Inputs.table(files, { 
  layout: 'auto', 
  select: false,
  format: {
    path: item_file_linker
  },
  columns: [
    "path",
    "size"
  ]
 })
```

## All file extensions in this item

This table shows all of the file extensions in the selected item, and counts up how many files have that extension, and now many bytes these files take up in total.

```js
const q_item_id = (s === null) ? 0 : s.item_id;
const exts = await sql([`SELECT LOWER(extension) AS extension, count(*) AS count, sum(size) as size FROM icufl WHERE item_id == '${q_item_id}' GROUP BY LOWER(extension) ORDER BY size DESC`])

display(Inputs.table(exts, { 
    layout: 'auto', 
    select: false,
    format: {
      size: show_big_int
      }
}));
```

This can be useful for spotting items with similar patterns of files extensions and file extensions that commonly appear together.
