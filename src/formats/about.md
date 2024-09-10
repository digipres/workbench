# About the Registries
## Where does the format data come from?

<div class="warning">
This page is under development and has major gaps at present.
</div>

## Introduction

```js
const db = FileAttachment("../data/registries.db").sqlite();
```

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


```js
const lines = db.sql`SELECT * FROM formats`;
const formats_search = view(Inputs.search((await lines), {placeholder: "Search format registry data…"}));
```

```js
view(Inputs.table(formats_search, { select: false, rows: 20 }));
```


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


Note detailed analysis possible [using Datasette Lite](https://lite.datasette.io/?url=https://raw.githubusercontent.com/digipres/workbench/main/src/data/registries.db#/registries/formats?_facet_size=8&_searchmode=raw&_facet=registry_id&_facet_array=genres&_facet_array=extensions&_facet_array=iana_media_types)

## PRONOM

* https://www.nationalarchives.gov.uk/aboutapps/pronom/release-notes.xml
* [https://www.nationalarchives.gov.uk/aboutapps/fileformat/pdf/pronom\_4\_info\_model.pdf](https://www.nationalarchives.gov.uk/aboutapps/fileformat/pdf/pronom\_4\_info\_model.pdf)
* https://github.com/digital-preservation/PRONOM\_Research
* [https://api.pronom.ffdev.info/docs](https://api.pronom.ffdev.info/docs#/)
* https://preservica.com/resources/blogs-and-news/updating-preservica-following-a-pronom-update
* https://exponentialdecay.co.uk/blog/pronom-release-statistics/

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


## Nature???

This goes deep and prolly don't belong here.

TRiD probabilistic, binary only , PRONOM weakly validating, DROID vs SF? 

GHL: 
> Most languages are detected by their file extension defined in [`languages.yml`](https://github.com/github-linguist/linguist/blob/39fd5e93de98de3434cb3e857c5b1972c418f8c5/lib/linguist/languages.yml). For disambiguating between files with common extensions, Linguist applies some [heuristics](https://github.com/github-linguist/linguist/blob/39fd5e93de98de3434cb3e857c5b1972c418f8c5/lib/linguist/heuristics.rb) and a [statistical classifier](https://github.com/github-linguist/linguist/blob/39fd5e93de98de3434cb3e857c5b1972c418f8c5/lib/linguist/classifier.rb).

PDF Trailer issue:
https://openpreservation.org/blogs/when-pdf-not-pdf-format-identification-focus/

## WikiData

```sparql
select distinct ?uri ?uriLabel ?puid ?extension ?mimetype ?encodingLabel ?referenceLabel ?date ?relativityLabel ?offset ?sig
where
{
  { ?uri wdt:P31/wdt:P279* wd:Q235557 } UNION 
    { ?uri wdt:P31/wdt:P279* wd:Q26085352 }.       # Return records of type File Format and File Format Family.
  optional { ?uri wdt:P2748 ?puid.      }          # PUID is used to map to PRONOM signatures proper.
  optional { ?uri wdt:P1195 ?extension. }
  optional { ?uri wdt:P1163 ?mimetype.  }
  optional { ?uri p:P4152 ?object;                 # Format identification pattern statement.
    optional { ?object pq:P3294 ?encoding.   }     # We don't always have an encoding.
    optional { ?object ps:P4152 ?sig.        }     # We always have a signature.
    optional { ?object pq:P2210 ?relativity. }     # Relativity to beginning or end of file.
    optional { ?object pq:P4153 ?offset.     }     # Offset relatve to the relativity.
    optional { ?object prov:wasDerivedFrom ?provenance;
       optional { ?provenance pr:P248 ?reference;
                              pr:P813 ?date.
                }
    }
  }
  service wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE], en". }
}
order by ?uri
```



<iframe style="width: 100%; height: 50vh; border: none;" src="https://query.wikidata.org/embed.html#SELECT%20DISTINCT%20%3Furi%20%3FuriLabel%20%3Fpuid%20%3Fextension%20%3Fmimetype%20%3Fffw%20%3Flcfdd%20%3Fnarafpid%20%3FencodingLabel%20%3FreferenceLabel%20%3Fdate%20%3FrelativityLabel%20%3Foffset%20%3Fsig%0AWHERE%0A%7B%0A%20%20%23%20Return%20records%20of%20type%20File%20Format%20%28via%20instance%20or%20subclass%20chain%29%3A%0A%20%20%7B%20%3Furi%20wdt%3AP31%2a%2Fwdt%3AP279%2a%20wd%3AQ235557%20%7D.%0A%20%20%0A%20%20%23%20Only%20return%20records%20that%20have%20at%20least%20one%20useful%20format%20identifier%0A%20%20FILTER%20EXISTS%20%7B%20%3Furi%20wdt%3AP2748%7Cwdt%3AP1195%7Cwdt%3AP1163%7Cwdt%3AP3381%7Cwdt%3AP3266%7Cwdt%3AP11167%20%5B%5D%20%7D.%20%20%20%20%20%20%20%0A%20%20%0A%20%20OPTIONAL%20%7B%20%3Furi%20wdt%3AP2748%20%3Fpuid.%20%20%20%20%20%20%7D%20%20%20%20%20%20%20%20%20%20%23%20PUID%20is%20used%20to%20map%20to%20PRONOM%20signatures%0A%20%20OPTIONAL%20%7B%20%3Furi%20wdt%3AP1195%20%3Fextension.%20%7D%20%20%20%20%20%20%20%20%20%20%23%20File%20extension%0A%20%20OPTIONAL%20%7B%20%3Furi%20wdt%3AP1163%20%3Fmimetype.%20%20%7D%20%20%20%20%20%20%20%20%20%20%23%20IANA%20Media%20Type%0A%20%20OPTIONAL%20%7B%20%3Furi%20wdt%3AP3381%20%3Fffw.%20%7D%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20Entry%20in%20the%20Just%20Solve%20File%20Formats%20Wiki%0A%20%20OPTIONAL%20%7B%20%3Furi%20wdt%3AP3266%20%3Flcfdd.%20%7D%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20Library%20of%20Congress%20Format%20Descriptions%20ID%0A%20%20OPTIONAL%20%7B%20%3Furi%20wdt%3AP11167%20%3Fnarafpid.%20%7D%20%20%20%20%20%20%20%20%20%20%23%20NARA%20File%20Format%20Preservation%20Plan%20ID%0A%20%20OPTIONAL%20%7B%20%3Furi%20p%3AP4152%20%3Fobject%3B%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20Format%20identification%20pattern%20statement%0A%20%20%20%20OPTIONAL%20%7B%20%3Fobject%20pq%3AP3294%20%3Fencoding.%20%20%20%7D%20%20%20%20%20%23%20We%20don%27t%20always%20have%20an%20encoding%0A%20%20%20%20OPTIONAL%20%7B%20%3Fobject%20ps%3AP4152%20%3Fsig.%20%20%20%20%20%20%20%20%7D%20%20%20%20%20%23%20We%20always%20have%20a%20signature%0A%20%20%20%20OPTIONAL%20%7B%20%3Fobject%20pq%3AP2210%20%3Frelativity.%20%7D%20%20%20%20%20%23%20Relativity%20to%20beginning%20or%20end%20of%20file%0A%20%20%20%20OPTIONAL%20%7B%20%3Fobject%20pq%3AP4153%20%3Foffset.%20%20%20%20%20%7D%20%20%20%20%20%23%20Offset%20relatve%20to%20the%20relativity%0A%20%20%20%20OPTIONAL%20%7B%20%3Fobject%20prov%3AwasDerivedFrom%20%3Fprovenance%3B%0A%20%20%20%20%20%20%20OPTIONAL%20%7B%20%3Fprovenance%20pr%3AP248%20%3Freference%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20pr%3AP813%20%3Fdate.%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22%5BAUTO_LANGUAGE%5D%2C%20en%22.%20%7D%0A%7D%0AORDER%20BY%20%3Furi%0A" referrerpolicy="origin" sandbox="allow-scripts allow-same-origin allow-popups" ></iframe>


<iframe style="width: 80vw; height: 50vh; border: none;" src="https://query.wikidata.org/embed.html#select%20distinct%20%3Furi%20%3FuriLabel%20%3Fpuid%20%3Fextension%20%3Fmimetype%20%3FencodingLabel%20%3FreferenceLabel%20%3Fdate%20%3FrelativityLabel%20%3Foffset%20%3Fsig%0Awhere%0A%7B%0A%20%20%7B%3Furi%20wdt%3AP31%2Fwdt%3AP279%2a%20wd%3AQ235557%7D%20UNION%20%7B%3Furi%20wdt%3AP31%2Fwdt%3AP279%2a%20wd%3AQ26085352%7D.%20%23%20Return%20records%20of%20type%20File%20Format%20and%20File%20Format%20Family.%0A%20%20optional%20%7B%20%3Furi%20wdt%3AP2748%20%3Fpuid.%20%20%20%20%20%20%7D%20%20%20%20%20%20%20%20%20%20%23%20PUID%20is%20used%20to%20map%20to%20PRONOM%20signatures%20proper.%0A%20%20optional%20%7B%20%3Furi%20wdt%3AP1195%20%3Fextension.%20%7D%0A%20%20optional%20%7B%20%3Furi%20wdt%3AP1163%20%3Fmimetype.%20%20%7D%0A%20%20optional%20%7B%20%3Furi%20p%3AP4152%20%3Fobject%3B%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20Format%20identification%20pattern%20statement.%0A%20%20%20%20optional%20%7B%20%3Fobject%20pq%3AP3294%20%3Fencoding.%20%20%20%7D%20%20%20%20%20%23%20We%20don%27t%20always%20have%20an%20encoding.%0A%20%20%20%20optional%20%7B%20%3Fobject%20ps%3AP4152%20%3Fsig.%20%20%20%20%20%20%20%20%7D%20%20%20%20%20%23%20We%20always%20have%20a%20signature.%0A%20%20%20%20optional%20%7B%20%3Fobject%20pq%3AP2210%20%3Frelativity.%20%7D%20%20%20%20%20%23%20Relativity%20to%20beginning%20or%20end%20of%20file.%0A%20%20%20%20optional%20%7B%20%3Fobject%20pq%3AP4153%20%3Foffset.%20%20%20%20%20%7D%20%20%20%20%20%23%20Offset%20relatve%20to%20the%20relativity.%0A%20%20%20%20optional%20%7B%20%3Fobject%20prov%3AwasDerivedFrom%20%3Fprovenance%3B%0A%20%20%20%20%20%20%20optional%20%7B%20%3Fprovenance%20pr%3AP248%20%3Freference%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20pr%3AP813%20%3Fdate.%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20service%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22%5BAUTO_LANGUAGE%5D%2C%20en%22.%20%7D%0A%7D%0Aorder%20by%20%3Furi%20limit%20100" referrerpolicy="origin" sandbox="allow-scripts allow-same-origin allow-popups" ></iframe>

[here](https://w.wiki/AMhF) or [here](https://query.wikidata.org/sparql?query=select%20distinct%20%3Furi%20%3FuriLabel%20%3Fpuid%20%3Fextension%20%3Fmimetype%20%3FencodingLabel%20%3FreferenceLabel%20%3Fdate%20%3FrelativityLabel%20%3Foffset%20%3Fsig%0Awhere%0A%7B%0A%20%20%3Furi%20wdt%3AP31%2Fwdt%3AP279*%20wd%3AQ235557.%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20Return%20records%20of%20type%20File%20Format.%0A%20%20optional%20%7B%20%3Furi%20wdt%3AP2748%20%3Fpuid.%20%20%20%20%20%20%7D%20%20%20%20%20%20%20%20%20%20%23%20PUID%20is%20used%20to%20map%20to%20PRONOM%20signatures%20proper.%0A%20%20optional%20%7B%20%3Furi%20wdt%3AP1195%20%3Fextension.%20%7D%0A%20%20optional%20%7B%20%3Furi%20wdt%3AP1163%20%3Fmimetype.%20%20%7D%0A%20%20optional%20%7B%20%3Furi%20p%3AP4152%20%3Fobject%3B%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20Format%20identification%20pattern%20statement.%0A%20%20%20%20optional%20%7B%20%3Fobject%20pq%3AP3294%20%3Fencoding.%20%20%20%7D%20%20%20%20%20%23%20We%20don%27t%20always%20have%20an%20encoding.%0A%20%20%20%20optional%20%7B%20%3Fobject%20ps%3AP4152%20%3Fsig.%20%20%20%20%20%20%20%20%7D%20%20%20%20%20%23%20We%20always%20have%20a%20signature.%0A%20%20%20%20optional%20%7B%20%3Fobject%20pq%3AP2210%20%3Frelativity.%20%7D%20%20%20%20%20%23%20Relativity%20to%20beginning%20or%20end%20of%20file.%0A%20%20%20%20optional%20%7B%20%3Fobject%20pq%3AP4153%20%3Foffset.%20%20%20%20%20%7D%20%20%20%20%20%23%20Offset%20relatve%20to%20the%20relativity.%0A%20%20%20%20optional%20%7B%20%3Fobject%20prov%3AwasDerivedFrom%20%3Fprovenance%3B%0A%20%20%20%20%20%20%20optional%20%7B%20%3Fprovenance%20pr%3AP248%20%3Freference%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20pr%3AP813%20%3Fdate.%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20service%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22en%2C%20en%22.%20%7D%0A%7D%0Aorder%20by%20%3Furi)