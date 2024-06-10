---
toc: true
---

# Welcome to the DigiPres Workbench

## Tools and technical resources for practical digital preservation

Here you'll find a collection of tools, reports, visualisations and tutorials to help you to preserve your digital collections. You can use the menu at the side or the plots and links below to get started.

<div class="grid grid-cols-2" style="grid-auto-rows: 504px;">
  <div class="card">${
    resize((width) => Plot.plot({
      title: "Your awesomeness over time 🚀",
      subtitle: "Up and to the right!",
      width,
      y: {grid: true, label: "Awesomeness"},
      marks: [
        Plot.ruleY([0]),
        Plot.lineY(aapl, {x: "Date", y: "Close", tip: true})
      ]
    }))
  }</div>
  <div class="card">${
    resize((width) => Plot.plot({
      title: "How big are penguins, anyway? 🐧",
      width,
      grid: true,
      x: {label: "Body mass (g)"},
      y: {label: "Flipper length (mm)"},
      color: {legend: true},
      marks: [
        Plot.linearRegressionY(penguins, {x: "body_mass_g", y: "flipper_length_mm", stroke: "species"}),
        Plot.dot(penguins, {x: "body_mass_g", y: "flipper_length_mm", stroke: "species", tip: true})
      ]
    }))
  }</div>
</div>

```js
const aapl = FileAttachment("aapl.csv").csv({typed: true});
const penguins = FileAttachment("penguins.csv").csv({typed: true});
```

---

## Next steps

Here are some ideas of things you could try…

<div class="grid grid-cols-4">
  <div class="card">
    Chart your own data using <a href="https://observablehq.com/framework/lib/plot"><code>Plot</code></a> and <a href="https://observablehq.com/framework/files"><code>FileAttachment</code></a>. Make it responsive using <a href="https://observablehq.com/framework/display#responsive-display"><code>resize</code></a>.
  </div>
  <div class="card">
    Create a <a href="https://observablehq.com/framework/project-structure">new page</a> by adding a Markdown file (<code>whatever.md</code>) to the <code>src</code> folder.
  </div>
  <div class="card">
    Add a drop-down menu using <a href="https://observablehq.com/framework/inputs/select"><code>Inputs.select</code></a> and use it to filter the data shown in a chart.
  </div>
  <div class="card">
    Write a <a href="https://observablehq.com/framework/loaders">data loader</a> that queries a local database or API, generating a data snapshot on build.
  </div>
  <div class="card">
    Import a <a href="https://observablehq.com/framework/imports">recommended library</a> from npm, such as <a href="https://observablehq.com/framework/lib/leaflet">Leaflet</a>, <a href="https://observablehq.com/framework/lib/dot">GraphViz</a>, <a href="https://observablehq.com/framework/lib/tex">TeX</a>, or <a href="https://observablehq.com/framework/lib/duckdb">DuckDB</a>.
  </div>
  <div class="card">
    Ask for help, or share your work or ideas, on the <a href="https://talk.observablehq.com/">Observable forum</a>.
  </div>
</div>


---

## Inspirations

The DigiPres Workbench was inspired by:

- The [GLAM Workbench](https://glam-workbench.net/) by [Tim Sherratt](https://timsherratt.au/) 
- [Library of Congress Format Descriptions Visualization](https://bits.ashleyblewer.com/blog/2023/12/04/library-of-congress-format-description-visualization/) by [Ashley Blewer](https://ashleyblewer.com/)
- [Demystify](http://exponentialdecay.co.uk/blog/demystify-lite-and-demystify-2-0-0-released/) and [Demystify-lite](https://ross-spencer.github.io/demystify-lite/) by [Ross Spencer](http://exponentialdecay.co.uk/) 
- [Datasette](https://datasette.io/) and [Datasette-lite](https://lite.datasette.io/)
 by [Simon Willison](https://simonwillison.net/)
 - The [Observable Framework](https://observablehq.com/framework/), which is the open source engine used to create and maintain this site.

---

## Funding & Sustainability

The initial development of this site was funded by Yale University Library and the Digital Preservation Coalition (DPC) as part of the [_Registries of Good Practice_ project](https://github.com/digipres/registries-of-practice-project).

This site is designed with long-term sustainability in mind, and the DPC will endeavour to maintain and update this site in the future.


---

## Contact

Contact information for the primary author, Andy Jackson, is available [here](https://anjackson.net/). If that doesn't work, get in touch via the [Digital Preservation Coalition](https://www.dpconline.org/).

