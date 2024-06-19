---
toc: true
---

# Welcome to the DigiPres Workbench

## Tools and technical resources for practical digital preservation

Here you'll find a collection of tools, reports, visualisations and tutorials to help you to preserve your digital collections. You can use the menu on the left or the plots and links below to get started.

```js
import { generate_exts_chart } from "./formats/registries.js";
```

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
    resize((width) => generate_exts_chart(width) )
  }</div>
</div>

```js
const aapl = FileAttachment("aapl.csv").csv({typed: true});
const penguins = FileAttachment("penguins.csv").csv({typed: true});
```

---

## Next steps

Here are some things you could try...

<div class="grid grid-cols-4">
  <div class="card">
    <a href="./formats/">Analyse and compare different data format registries</a>, to find out which ones might help you understand your digital collections.
  </div>
  <div class="card">
    Understand the <a href="./publications/">data behind the index of publications related to digital preservation</a>, and the networks beneath.
  </div>
</div>


---

## Inspirations

The DigiPres Workbench was inspired by:

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

