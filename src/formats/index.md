# All About Formats
## Searching, analysing & comparing format registries

## Introduction

One of the most fundamental facets of preserving digital cultural materials is understanding the data formats they are in. Born-digital items are particularly challenging as, in comparison to the relatively constrained worlds of metadata and digitised materials, they come in a huge range of formats. This makes format identification a crucial step towards understanding the information and software dependencies we need to capture, to make future access possible.

As part of the [_Registries of Good Practice_ project](https://github.com/digipres/registries-of-practice-project), we have been indexing, analysing and comparing data from a wide range of format information sources (a.k.a. format registries) and format identification tools. 

In line with [our principles](https://github.com/digipres/registries-of-practice-project?tab=readme-ov-file#principles), our goal is to highlight and support all the great work being done in this field. We want to understand the ecosystem our registries are part of, and how we can make things better in an evidenced and targeted way.

## The Registries

Building on [the work](https://anjackson.net/2016/06/08/frontiers-in-format-identification/#aggregating-format-registries) of the [DigiPres Format Aggregator](https://digipres.org/formats/), we use information from these sources:

```js
// Read the source data from the first sheet of this XLSX file:
const workbook = await FileAttachment("../data/format-sources.xlsx").xlsx();
const sources = workbook.sheet(workbook.sheetNames[0], {headers: true});
```

<table>
<thead>
    <tr><th>Key</th><th>Homepage</th><th>Description</th></tr>
</thead>
${sources.map(
    d => htl.html`<tr><td id="source_${d.key}">${d.key}</td><td><a href="${d.homepage}">${d.short_name}</a></tf><td>${d.title}</td></tr>`
)}
</table>

You can find more information about the data sources on the [About the Registries](./about) page. 

But to make this set of different datasets really useful, we need to find ways to combine them. One of the most useful ways has been to simply compare registries based on the file extensions found in their format records.

```js
import { generate_exts_chart } from "./registries.js";
```
<div class="card">
  ${ resize((width) => generate_exts_chart(width) ) }
</div>

The [Combining Format Registries](#combining-format-registries) section below provides the details of how this is done, and outlines the assumptions involved.

## The Analysis Tools

There are three different analysis tools available for you to try.

- [Comparing Registries](./compare), which explores ways of comparing the contents of different format registries.
- [Using Collection Profiles](./profiles), which shows how to use file-extension format profiles to compare digital collections against others, and against the full set of available format registries.
- [Format Diversity Estimation](./species), which uses the gaps between registries to estimate the total number of digital formats.


## Combining Format Registries

<div class="note">
This section documents the assumptions and approximations that underlie the various analysis tools and reports in the <i>Formats</i> section of the DigiPres Workbench.
</div>

Different format registries use different levels of definitions of format for their records. Most work at the same broad format level of granularity as file extensions and [Internet Media Types](https://www.iana.org/assignments/media-types/media-types.xhtml). Others are more fine-grained, and seek to identify individual format versions and/or profiles of format usage. This latter group includes PRONOM, which is the _de facto_ 'preservation grade' format registry and is integrated into many digital preservation tools and workflows.

These differences mean that, to meaningfully combine and compare registries, we need to choose some level of granularity that allows us to align them.

<div class="warning">
These complex merged datasets are absolutely not authoritative and should not be used for automated format identification. They are only intended as aids for analysing, browsing and exploring the formats in the different registries.
</div>

### File Extensions

The simplest way to make this work is to discard the finer-grained information and just compare format registries based on the file extensions they refer to. But even in this case, different registries handle things in slightly different ways. Most just specify extensions as simple strings, where for example `xmpl` would mean any file that ended in `.xmpl` or indeed `.XMPL` or `.Xmpl`. In contrast, Apache Tika's format registry is based on the [Shared MIME-info Database specification](https://specifications.freedesktop.org/shared-mime-info-spec/shared-mime-info-spec-latest.html) which uses the [glob syntax](https://specifications.freedesktop.org/shared-mime-info-spec/shared-mime-info-spec-latest.html#idm45387609262192). This covers simple extensions like `*.xmpl`, but also supports rarer forms like `*-gz`. Therefore, when comparing sets of extensions, we reduce them all to lower case and shift them to the `*.ext` glob syntax.

This is a good way to get an idea of the overall size and coverage of different registry sources. Consequently, this approach is used in a number of different ways in the different pages of this site. However, there are some assumptions and issues here that should be kept in mind:

- Some formats might not have file extensions associated with them.
- Some _different_ formats may use the _same_ file extension.
- Sometimes, the _same_ format might use _different_ file extensions.

Overall, extension-based analyses are likely to slightly underestimate the number of formats, and slightly overestimate the degree to which two different sets of formats overlap.

Note that this does not apply when the format extensions come from user-generated sources. Format registries can generally be trusted to only include accurate file extensions. End users sometimes drop or modify file extensions in unexpected ways, so this should be kept in mind when comparing registries against other sources of information.  Many problems can be avoided by ignoring extensions that contain spaces or appear to just be numbers, but this is not a comprehensive approach.


### Media Types

One alternative is to integrate all the different granularities into a consistent conformance hierarchy, using an extended Media Type syntax, as described in [Talking About Formats](https://anjackson.net/keeping-codes/practice/talking-about-formats#extended-mime-types).

This is has been implemented at <http://www.digipres.org/formats/mime-types/>, but requires more work to make things fully consistent. However, it does show how PRONOM-style fine-grained format identification can be integrated as Media Type parameters. e.g. versions:

- `application/pdf`
  - `application/pdf; version="1.0"`
  - ...

Or ones with known 'super types' integrated with versions:

- `application/zip`
  - `application/vnd.etsi.asic-e+zip`
    - `application/vnd.etsi.asic-e+zip; version="2.x"`

Or even ones with custom entries intended to make the hierarchy a bit more manageable:

- `application/zip`
  -  `application/x-tika-ooxml` _(used by Apache Tika so it can route all OOXML to the same code)_
     - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
       - `application/vnd.openxmlformats-officedocument.wordprocessingml.document; version="2007 onwards"`
