# The Format Index (ALPHA)
## A index across format registry for analysis and exploration.

<div class="warning">

This page demonstrates an early-stage prototype system. The interface and database structure is not finalised.

The rest of this site uses the data from the current [Format Registry Aggregator](https://www.digipres.org/formats/) system so the results here will be different to those on the rest of the site at this time.

</div>

## Introduction

This page demonstrates the first iteration of a new version of the [Format Registry Aggregator](https://www.digipres.org/formats/). Design goals includes:

- Do a better job of getting people the information they need quickly, while directing them back to the source pages as soon as possible.
- Rename it to be an Index rather than an Aggregator as that better reflects the design decision to route users back to the source.
- Add NARA and TCDB registry sources.
- Include software information from WikiData and NARA.
- Use the same flexible and powerful SQLite-based approach as the Publications Index.
- Adopt a sustainable UI rather than maintaining our own.

The following sections demonstrate some of the capabilities of this new iteration.

## Search The Format Index

This basic search just matches your text strings against the selected fields from the database. Note that more sophisticated analysis is possible [using Datasette Lite](https://lite.datasette.io/?url=https://raw.githubusercontent.com/digipres/digipres.github.io/master/_data/formats/registries.db#/registries/format?_facet_size=8&_searchmode=raw&_facet=registry_id).


```js
const db = FileAttachment("../data/registries.db").sqlite();
// NOTE Weirdly, loading the file locally from this site, as above, it brittle and often cuts out during the download when deployed on GitHub Pages. The below works more reliably...?
//const db = SQLiteDatabaseClient.open("https://www.digipres.org/_data/formats/registries.db");
```

```js
const lines = db.sql`
SELECT
  f.*,
  (SELECT GROUP_CONCAT(e.id, ', ')
    FROM format_extensions f_e
    JOIN extension e ON f_e.format_id = f.id
    WHERE f_e.extension_id = e.id
  ) AS extensions,
  (SELECT GROUP_CONCAT(mt.id, ', ')
    FROM format_media_types f_mt
    JOIN media_type mt ON f_mt.format_id = f.id
    WHERE f_mt.media_type_id = mt.id
  ) AS media_types
FROM format f
GROUP BY f.id
`;
```

```js
const search_fields = view(
  Inputs.select(
    new Map([
      ["Extensions & Media Types", ['extensions', 'media_types']],
      ["All Fields", ['name', 'version', 'extensions', 'media_types']],
    ]),
    {value: ['extensions', 'media_types'], label: "Search"}
  )
);
```

```js
const formats_search = view(Inputs.search((await lines), {
  placeholder: "Search for any substring…",
  columns: search_fields
  }));
```

```js

const id_prefix = {
  'ffw': 'http://fileformats.archiveteam.org/wiki/',
  'lcfdd': 'https://www.loc.gov/preservation/digital/formats/fdd/',
  'naradpf': 'https://www.archives.gov/files/lod/dpframework/id/',
  'pronom': 'https://www.nationalarchives.gov.uk/PRONOM/',
  'wikidata': 'http://www.wikidata.org/entity/'
}

function id_linker(pre) {
  return (id) => {
    const ida = id.split(/:(.+)/);
    if( ida[0] in pre ) {
      return htl.html`<a href="${pre[ida[0]]}${ida[1]}" target="_blank">${ida[0]}</a>`;
    } else {
      return id;
    }
  }
}

function urler(url) {
  if( url != null && url != "" ) {
    return htl.html`<a href="${url}" target="_blank">[link]</a>`;
  } else {
    return null;
  }
}

function clipper(max) {
  return (x) => {
    if( x.length > max ) {
      return x.substring(0, max) + "...";
    } else {
      return x;
    }
  }
}

const fmt = view(Inputs.table(formats_search, { 
  required: false, 
  multiple: false, 
  rows: 25, 
  layout: 'auto', 
  columns: ['id', 'name', 'version', 'extensions', 'media_types'],
  format: {
    'id': id_linker(id_prefix),
    'name': clipper(50)
  }}));
```

<style>
  dt {
    font-style: italic;
  }
</style>

<div class="grid grid-cols-2">
  <div class="">
    <h3>Full Format Record</h3>

```js
if( fmt ) {
  display(html`<dl>
<dt>ID & Link</dt>
<dd>${id_linker(id_prefix)(fmt.id)}</a></dd>
<dt>Name</dt>
<dd>${fmt.name || "-"}</dd>
<dt>Version</dt>
<dd>${fmt.version || "-"}</dd>
<dt>Summary</dt>
<dd>${fmt.summary || "-"}</dd>
<dt>Extensions</dt>
<dd>${fmt.extensions || "-"}</dd>
<dt>Media Types</dt>
<dd>${fmt.media_types || "-"}</dd>
<dt>Primary Media Type</dt>
<dd>${fmt.primary_media_type || "-"}</dd>
<dt>Parent Media Type</dt>
<dd>${fmt.parent_media_type || "-"}</dd>
<dt>Has Magic?</dt>
<dd>${fmt.has_magic}</dd>
<dt>Registry URL</dt>
<dd>${urler(fmt.registry_url) || "-"}</dd>
<dt>Registry Source Data URL</dt>
<dd>${urler(fmt.registry_source_data_url) || "-"}</dd>
<dt>Registry Index Data URL</dt>
<dd>${urler(fmt.registry_index_data_url) || "-"}</dd>
<dt>Created</dt>
<dd>${fmt.created || "-"}</dd>
<dt>Last Modified</dt>
<dd>${fmt.last_modified || "-"}</dd>
</dl>`)
} else {
  display(html`<i>no record selected</i>`)
}
```
  </div>
  <div class="">
  <h3>Software Support</h3>

```js
if( fmt ) {
  const fmt_sw = db.sql`
  SELECT
    s.*
  FROM software s
  JOIN formats_read_by_software f_s ON f_s.software_id == s.id
  JOIN format f ON f_s.format_id == f.id
  WHERE f.id = ${fmt.id}
  `;

  view(Inputs.table(await fmt_sw, {
    select: false, 
    layout: 'auto',
    rows: 40,
    columns: ['id', 'name', 'version', 'summary', 'license'],
    format: {
    'id': id_linker(id_prefix),
    'registry_url': urler
  }}))
} else {
  display(html`<i>no record selected</i>`)
}
```

  </div>
</div>

## Overall Statistics

How many records are there in each registry?

```js
const fr_tots = db.sql([`SELECT registry_id, COUNT(*) as count FROM format GROUP BY registry_id;`]);
```

<div class="card">

```js
resize((width) => Plot.plot({
  title: `Total Format Records`,
  subtitle: "Broken down by format information source",
  y: {grid: true, label: "Registry ID" },
  x: {grid: true, label: "# Format Records" },
  color: {legend: false, label: "Registry ID"},
  width,
  marginLeft: 80,
  marks: [
    Plot.barX(fr_tots, {x: "count", y: "registry_id", fill: "registry_id", tip: true, sort: { y: "x" }  })
  ] 
}))
```

</div>


## Records Over Time

Note that not all registries explicitly record the date of creation or modification of individual records.

```js
const date_options = [
  {label: "Year Created", value: "created"},
  {label: "Year Last Modified", value: "last_modified"},
];

const date_selection = view(Inputs.select(date_options, {
    label: "Show Records By",
    format: (t) => t.label,
}));
```


```js
const fr_query = `SELECT registry_id, CAST(STRFTIME("%Y", ${date_selection.value}) AS INT) AS year, COUNT(*) as count FROM format WHERE ${date_selection.value} != '' GROUP BY registry_id, year;`;
const fr = db.sql([`${fr_query}`]);
```


<div class="card">

```js
resize((width) => Plot.plot({
  title: `Registry Records By ${date_selection.label}`,
  subtitle: "Broken down by year and registry (not all registries are included yet!)",
  x: { tickFormat: (d) => d.toString() },
  color: { legend: true },
  width,
  marks: [
    Plot.barY(fr, {x: "year", y: "count", fill: "registry_id", tip: true })
  ] 
}))
```

</div>

## PRONOM Records by Genre

```js
const pr = db.sql`
SELECT 
  g.name as genre, 
  CAST(STRFTIME("%Y", created) AS INT) AS year, 
  COUNT(*) as count 
FROM format f
JOIN format_genres f_g ON f_g.format_id = f.id
JOIN genre g ON f_g.genre_id = g.id
WHERE registry_id == 'pronom' 
GROUP BY g.name, year ORDER BY year;
`;
```

<div class="card">

```js
resize((width) => Plot.plot({
  title: "PRONOM Records By Year of Creation & Genre",
  subtitle: "Note that this does not reflect when records are updated",
  x: { tickFormat: (d) => d.toString() },
  color: { legend: true },
  width,
  marks: [
    Plot.barY(pr, {x: "year", y: "count", fill: "genre", tip: true })
  ] 
}))
```

</div>

