# All About Formats
## Searching, analysing & comparing format registries

## Introduction

One of the most fundamental facets of preserving digital cultural materials is understanding the data formats they are in. Born-digital items are particularly challenging as, in comparison to the relatively constrained worlds of metadata and digitised materials, they come in a huge range of formats. This makes format identification a crucial step towards understanding the information and software dependencies we need to capture, to make future access possible.

As part of the [_Registries of Good Practice_ project](https://github.com/digipres/registries-of-practice-project), we have been indexing, analysing and comparing data from a wide range of format information sources (a.k.a. format registries) and format identification tools. This part of the DigiPres Workbench summarizes our findings so far and provides tools for you to explore further.

## The Registries

Building on [the work](https://anjackson.net/2016/06/08/frontiers-in-format-identification/#aggregating-format-registries) of the [DigiPres Format Aggregator](https://digipres.org/formats/), we use information from these sources:

```js
// Read the source data from the first sheet of this XLSX file:
const workbook = await FileAttachment("../data/format-sources.xlsx").xlsx();
const sources = workbook.sheet(workbook.sheetNames[0], {headers: true});
```

```js
// Using a JavaScript approach so HTML can be emitted while looping over data:
htl.html`
<table>
<thead>
    <tr><th>Key</th><th>Homepage</th><th>Description</th></tr>
</thead>
${sources.map(
    d => htl.html`<tr><td id="source_${d.key}">${d.key}</td><td><a href="${d.homepage}">${d.short_name}</a></tf><td>${d.title}</td></tr>`
)}
</table>`
```
You can find more information about the data sources on the [About the Registries](./about) page. 

But to make this set of different datasets really useful, we need to find ways of combining and the data. One of the most useful ways has been to simply compare registries based on the file extensions found in their format records.

```js
import { generate_exts_chart } from "./registries.js";
```
<div class="card">
  ${ resize((width) => generate_exts_chart(width) ) }
</div>


The [Combining Registries](./combine) page provides the details of how this is done, and outlines the assumptions involved.

## The Analysis Tools

There are three different analysis tools available for you to try.

- [Comparing Registries](./compare), which explores ways of comparing the contents of different format registries.
- [Format Diversity Estimation](./species), which uses the gaps between registries to estimate the total number of digital formats.
- [Using Collection Profiles](./profiles), which shows how to use file-extension format profiles to compare digital collections against others, and against the full set of available format registries.

