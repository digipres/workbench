# Combining Format Registries
## Implementation details, assumptions & approximations


<div class="note">
This page documents the assumptions and approximations that underlie the various analysis tools and reports in the <i>Formats</i> section of the DigiPres Workbench.
</div>

## Introduction

Different format registries use different levels of definitions of format for their records. Most work at the same broad format level of granularity as file extensions and [Internet Media Types](https://www.iana.org/assignments/media-types/media-types.xhtml). Others are more fine-grained, and seek to identify individual format versions and/or profiles or format usage. This latter group includes PRONOM, which is the _de facto_ 'preservation grade' format registry and is integrated into many digital preservation tools and workflows.

But to meaningfully combine and compare registries, we need to choose some level of granularity that allows us to align the different datasets.

## File Extensions

The simplest way to make this work is to discard the finer-grained information and just compare format registries based on the file extensions they refer to. For example, following graph just counts how many distinct file extensions they are in each format registry:

```js
import { generate_exts_chart } from "./registries.js";
```
<div class="card">
  ${ resize((width) => generate_exts_chart(width) ) }
</div>

Even in this case, different registries handle things in slightly different ways. Most just specify extensions as simple strings, where for example `xmpl` would mean any file that ended in `.xmpl` or indeed `.XMPL` or `.Xmpl`. In contract, Apache Tika's format registry is based on the [Shared MIME-info Database specification](https://specifications.freedesktop.org/shared-mime-info-spec/shared-mime-info-spec-latest.html) which uses the [glob syntax](https://specifications.freedesktop.org/shared-mime-info-spec/shared-mime-info-spec-latest.html#idm45387609262192). i.e. like `*.xmpl`, but also like `*-gz`. Therefore, when comparing sets of extensions, we reduce them all to lower case and shift them to the `*.ext` glob syntax.

This is a good way to get an idea of the overall size and coverage of different registry sources. Consequently, this approach is used in a number of different ways in the different pages of this site. However, there are some assumptions and issues here that should be kept in mind:

- Some formats might not have file extensions associated with them.
- Some _different_ formats may use the _same_ file extension.
- Rarely, the _same_ format might use _different_ file extensions.

Overall, extension-based analyses are likely to slightly underestimate the number of formats, and slightly overestimate the degree to which two different sets of formats overlap.

Note that this does not apply when the format extensions come from user-generated sources. Format registries can generally be trusted to only include accurate file extensions. End users sometimes drop or modify file extensions in unexpected ways, so this should be kept in mind when comparing registries against other sources of information.  Many problems can be avoided by ignoring extensions that contain spaces or appear to just be numbers, but this is not a comprehensive approach.


## Media Types

One alternative is to integrate all the different granularities into a consistent conformance hierarchy, using an extended Media Type syntax, as per [Talking About Formats](http://anjackson.net/keeping-codes/practice/talking-about-formats).

This is has been implemented at <http://www.digipres.org/formats/mime-types/>, but requires more work to make things fully consistent. However, it does show how PRONOM-style fine-grained format identification can be integrated as Media Type parameters. e.g. versions:

- application/pdf
  - application/pdf; version="1.0"
  - ...

Or ones with known 'super types' integrated with versions:

- application/zip
  - application/vnd.etsi.asic-e+zip
    - application/vnd.etsi.asic-e+zip; version="2.x"

Or even ones with additions intended tos make the hierarchy a bit more manageable:

- application/zip
  -  application/x-tika-ooxml (used by Apache Tika so it can route all OOXML to the same code)
     - application/vnd.openxmlformats-officedocument.wordprocessingml.document 
       - application/vnd.openxmlformats-officedocument.wordprocessingml.document; version="2007 onwards" 

This complex merged hierarchy is absolutely not authoritative and should not be used for automated format identification. It is only intended as a navigational aid for browsing and exploring the formats in the different registries.


