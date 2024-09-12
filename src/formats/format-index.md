# The Format Index (ALPHA)
## A format registry aggregation for analysis and exploration.

<div class="warning">
This page demonstrates very early-stage prototype systems and is not in any way final. More registries will be added and the database structure is not finalised.
</div>

## Introduction

This page demonstrates the first iteration of a new version of the [Format Registry Aggregator](https://www.digipres.org/formats/). Design goals includes:

- Do a better job of getting people the information they need quickly, while directing them back to the source pages as soon as possible.
- Rename it to be an Index rather than an Aggregator as that better reflects the design decision to route users back to the source.
- Add NARA and TCDB registry sources.
- Include software information from WikiData.
- Use the same flexible and powerful SQLite-based approach as the Publications Index.
- Adopt a sustainable UI rather than maintaining our own.

The following sections demonstrate some of the capabilities of this new iteration.

## Search The Format Index

This basic search just matches your text strings against any of the fields in the database. The table is quite wide!


```js
const db = FileAttachment("../data/registries.db").sqlite();
```

```js
const lines = db.sql`SELECT * FROM formats`;
const formats_search = view(Inputs.search((await lines), {placeholder: "Search format registry data…"}));
```

```js
view(Inputs.table(formats_search, { select: false, rows: 20 }));
```

### Faceted Browsing & SQL Queries

Note that more sophisticated analysis is possible [using Datasette Lite](https://lite.datasette.io/?url=https://raw.githubusercontent.com/digipres/workbench/main/src/data/registries.db#/registries/formats?_facet_size=8&_searchmode=raw&_facet=registry_id&_facet_array=genres&_facet_array=extensions&_facet_array=iana_media_types)


## Overall Statistics

How many records are there in each registry?

```js
const fr_tots = db.sql([`SELECT registry_id, COUNT(*) as count FROM formats GROUP BY registry_id;`]);
```

<div class="card">

```js
resize((width) => Plot.plot({
  title: `Registry Records`,
  subtitle: "Broken down by registry (not all registries are included yet!)",
  x: { tickFormat: (d) => d.toString() },
  color: { legend: true },
  width,
  marginLeft: 80,
  marks: [
    Plot.barX(fr_tots, {x: "count", y: "registry_id", fill: "registry_id", tip: true })
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
const fr_query = `SELECT registry_id, CAST(STRFTIME("%Y", ${date_selection.value}) AS INT) AS year, COUNT(*) as count FROM formats WHERE ${date_selection.value} != '' GROUP BY registry_id, year;`;
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
const pr = db.sql`SELECT genre.value as genre, CAST(STRFTIME("%Y", created) AS INT) AS year, COUNT(*) as count FROM formats, JSON_EACH(formats.genres) genre WHERE registry_id == 'pronom' GROUP BY genre.value, year ORDER BY year;`;
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

