---
toc: true
---

# Welcome to the DigiPres Workbench

## Tools, analysis and technical resources for practical digital preservation

<div class="caution" label="Project Status">

This is an experimental prototype created as part of the [Registries of Good Practice project](https://github.com/digipres/registries-of-practice-project). Things may evolve and break over time! See the [Funding & Sustainability](#funding-%26-sustainability) section below for more details.

</div>

The DigiPres Workbench is a collection of tools, reports, visualisations and tutorials to help you to preserve your digital collections. 

Here's a high-level view of what this is for, what we're doing now, and what we're thinking of doing in the future (indicated by dashed and dotted boxes)...

```js
display(await FileAttachment("dpw-overview.svg").image({width:640}));
```

You can use the menu on the left or the plots and links below to get started.

---

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
    Use the <a href="./tools/sandbox">DigiPres Sandbox</a> to play with command-line DigiPres tools in the cloud without installing any software, or even leaving your browser.
  </div>
  <div class="card">
    Understand the <a href="./publications/">data behind the index of publications related to digital preservation</a>, and the networks beneath.
  </div>
  <div class="card">
    Explore the <a href="./workshops/">Workshop Resources & Activities</a> that we're using to gather feedback on what's been built so far.
  </div>
</div>


---

## Inspirations

The DigiPres Workbench was inspired by:

- The [Wikidata for Digital Preservation portal](https://wikidp.org/) by [Katherine Thornton, Kenneth Seals-Nutt, Euan Cochrane & Carl Wilson](https://wikidp.org/about).
- The [GLAM Workbench](https://glam-workbench.net/) by [Tim Sherratt](https://timsherratt.au/).
- [Demystify](http://exponentialdecay.co.uk/blog/demystify-lite-and-demystify-2-0-0-released/) and [Demystify-lite](https://ross-spencer.github.io/demystify-lite/) by [Ross Spencer](http://exponentialdecay.co.uk/).
- The [Siegfried](https://www.itforarchivists.com/siegfried) format identification tool and [benchmark tests](https://www.itforarchivists.com/siegfried/benchmarks) by [Richard Lehane](https://www.itforarchivists.com/).
- [Library of Congress Format Descriptions Visualization](https://bits.ashleyblewer.com/blog/2023/12/04/library-of-congress-format-description-visualization/) by [Ashley Blewer](https://ashleyblewer.com/).
- The [Virtual Preservation Environment for Research (ViPER)](https://viper.openpreservation.org/) by [The Open Preservation Foundation](https://openpreservation.org/) & [The Dutch Digital Heritage Network](https://netwerkdigitaalerfgoed.nl/en/).
- The PLANETS Testbed ([briefing paper](https://www.dcc.ac.uk/guidance/briefing-papers/technology-watch-papers/planets-testbed), [article](https://journal.code4lib.org/articles/83))
- [Datasette](https://datasette.io/) and [Datasette-lite](https://lite.datasette.io/).
 by [Simon Willison](https://simonwillison.net/).
 - The [Observable Framework](https://observablehq.com/framework/), which is the open source engine used to create and maintain this site.

---

## Funding & Sustainability

The initial development of this site was funded by Yale University Library and the Digital Preservation Coalition (DPC) as part of the [_Registries of Good Practice_ project](https://github.com/digipres/registries-of-practice-project).

<div class="warning">

This site is designed with long-term sustainability in mind, and the DPC will endeavour to maintain and update this site in the future. 

However, the purpose of these prototype is to help us explore what is _really_ needed and which approaches are more sustainable, so the content and function of this service may change radically over time. 

We need your feedback in order to get this right, so please let use know what you think!

</div>

---

## Contact

Contact information for the primary author, Andy Jackson, is available [here](https://anjackson.net/). If that doesn't work, get in touch via the [Digital Preservation Coalition](https://www.dpconline.org/).

We also hosts a monthly [Preservation Registries Special Interest Group](https://www.dpconline.org/digipres/pr-sig) call, which is open to anybody interested in understanding or working on the information resources that make digital preservation possible.