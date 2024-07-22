---
toc: true
---

# Welcome to the DigiPres Workbench

## Tools, analysis and technical resources for practical digital preservation

Here you'll find a collection of tools, reports, visualisations and tutorials to help you to preserve your digital collections. You can use the menu on the left or the plots and links below to get started.

<div class="caution" label="⚠️ Confound it all! ⚠️">You've found my 'secret' project! Feel free to look around, but please don't publicise this site or post about it until it's ready... The launch will be at <a href="https://ipres2024.pubpub.org/">iPRES 2024</a>, which isn't that far away. So until then... <br>
<br>
<img src="./kiskis.gif" width="100%" title="...keep it secret...keep it safe...">
<br>
<br>Thank you!
<br>Andy
</div>

```js
const db = await FileAttachment("data/registries.db").sqlite();
const fr = db.sql`SELECT registry_id, CAST(STRFTIME("%Y", created) AS INT) AS year, COUNT(*) as count FROM formats WHERE registry_id == 'pronom' GROUP BY year ORDER BY year;`;
```

```js
import { generate_exts_chart } from "./formats/registries.js";
```

<div class="grid grid-cols-2" style="grid-auto-rows: auto;">
  <div class="card">

```js
resize((width) => Plot.plot({
  title: 'PRONOM Registry Records Over Time',
  subtitle: "Cumulative growth by year of creation",
  y: { tickFormat: (d) => d.toString() },
  color: { legend: false },
  width,
  marginTop: 0,
  marginLeft: 50,
  height: 420,
  marks: [
    Plot.barX(fr, 
        Plot.mapX("cumsum", {x: "count", y: "year", fill:  "registry_id", tip: true, sort: { y: "-y" } })
    )
  ] 
}))
```

  <p style="text-align: center"><a href="./formats/about">Click here for more statistics from format registries...</a></p>
  </div>
  <div class="card">

```js
    resize((width) => generate_exts_chart(width) )
```

  <p style="text-align: center"><a href="./formats/">Click here for more information about formats...</a></p>
  </div>
</div>


---

## Next steps

Here are some things you could try...

<div class="grid grid-cols-4">
  <div class="card">
    <a href="./formats/">Analyse and compare different data format registries</a>, to find out which ones might help you understand your digital collections.
  </div>
  <div class="card">
    Use collection format profiles to <a href="./formats/profiles">compare your own collections against other collections and against the various format registries.</a>
  </div>
  <div class="card">
    Read about how a <a href="./formats/species">ecological model of formats as different species</a> allows us to use the gaps between format registries to estimate the total number of data formats across the digital world.
  </div>
  <div class="card">
    Understand the <a href="./publications/">data behind the index of publications related to digital preservation</a>, and the networks beneath.
  </div>
</div>


---

## Inspirations

The DigiPres Workbench was inspired by:

- The [Wikidata for Digital Preservation portal](https://wikidp.org/) by [Katherine Thornton, Kenneth Seals-Nutt, Euan Cochrane & Carl Wilson](https://wikidp.org/about).
- The [GLAM Workbench](https://glam-workbench.net/) by [Tim Sherratt](https://timsherratt.au/).
- [Library of Congress Format Descriptions Visualization](https://bits.ashleyblewer.com/blog/2023/12/04/library-of-congress-format-description-visualization/) by [Ashley Blewer](https://ashleyblewer.com/).
- [Demystify](http://exponentialdecay.co.uk/blog/demystify-lite-and-demystify-2-0-0-released/) and [Demystify-lite](https://ross-spencer.github.io/demystify-lite/) by [Ross Spencer](http://exponentialdecay.co.uk/).
- [Datasette](https://datasette.io/) and [Datasette-lite](https://lite.datasette.io/).
 by [Simon Willison](https://simonwillison.net/).
 - The [Observable Framework](https://observablehq.com/framework/), which is the open source engine used to create and maintain this site.

---

## Funding & Sustainability

The initial development of this site was funded by Yale University Library and the Digital Preservation Coalition (DPC) as part of the [_Registries of Good Practice_ project](https://github.com/digipres/registries-of-practice-project).

This site is designed with long-term sustainability in mind, and the DPC will endeavour to maintain and update this site in the future.


---

## Contact

Contact information for the primary author, Andy Jackson, is available [here](https://anjackson.net/). If that doesn't work, get in touch via the [Digital Preservation Coalition](https://www.dpconline.org/).

We also hosts a monthly [Preservation Registries Special Interest Group](https://www.dpconline.org/digipres/pr-sig) call, which is open to anybody interested in understanding or working on the information resources that make digital preservation possible.