# Publications
## Analysing data on publications related to digital preservation

## Introduction

As part of the [Registries of Good Practice project](https://github.com/digipres/registries-of-practice-project#registries-of-good-practice-project) we are building an [index of publications related to digital preservation](http://www.digipres.org/publications/).  That process involves bringing the index data together as an [SQLite](https://sqlite.org/) database.

This page provides an initial proof-of-concept showing how analysis and visualisation tools can be applied to that database, and used to generate visualisations that help us understand and explore the data.  It runs in your browser, downloads the database, and generates graphs based on SQL queries.

<div class="warning">Note that at the current time, the index only contains the first version of the iPRES conference proceedings dataset. There may be some data quality issues due to how the data has been collected, which these visualisations may help to uncover!</div>

```js
import {SQLiteDatabaseClient} from "npm:@observablehq/sqlite";

const db = SQLiteDatabaseClient.open("https://raw.githubusercontent.com/digipres/digipres-practice-index/main/releases/practice.db");
```


## iPRES Publication Types Over Time

This graph uses a simple SQL query to group and count all the types of publication over time.

```
SELECT year, type, COUNT(*) as count FROM publications GROUP BY year, type;
```

```js
const pubs = db.sql`SELECT year, type, COUNT(*) as count FROM publications GROUP BY year, type;`;
```

The results can then be presented as a stacked bar chart.

<div class="grid grid-cols-1">
${ resize((width) => Plot.plot({
  x: { tickFormat: (d) => d.toString() },
  width,
  marks: [
    Plot.barY(pubs, {x: "year", y: "count", fill: "type", tip: true })
  ] 
})
)}
</div>


## iPRES Keyword Usage

First we look at the number of publications for each keyword. The list is very long, so it's not practical to plot all the labels, but you can hover over to see each entry.

```js
const kwdsd = db.sql`SELECT keyword.value as keyword, COUNT(*) as count FROM publications, JSON_EACH(publications.keywords) keyword GROUP BY keyword.value ORDER BY count DESC`; 
// Similar JSON_EACH(publications.creators) creator, 
```

```js
Plot.plot({
  y: {grid: true, type: 'sqrt'},
  x: {grid: false, label: "keyword", tickRotate: -50 },
  //marginBottom: 100,
  color: {legend: false},
  marks: [
    Plot.rectY(kwdsd, {y: "count", x: "keyword", fill: "keyword", tip: true, sort: { x: "-y" }}),
    Plot.axisX({ticks: []}),
  ]
})
```

We can analyse this a bit more closely by collecting the different terms together, by how often each one is used. So, entries on the left are used one or two times across the whole corpus, and entries on the right are the most commonly used keywords.


```js
Plot.plot({
  y: {grid: true, type: 'sqrt'},
  color: {legend: false},
  marks: [
    Plot.rectY(kwdsd, Plot.binX({y: "count"}, {x: "count", fill: "keyword", tip: true}))
  ]
})
```

This emphasises how the majority of keywords are only used a few times across the corpus. 

If plot the number of authors that use a keyword versus the number of times it is used in total, the plot is less dominated by the keywords that are only used once, as these almost all overlap. This lets us look for broader trends.


```js
const kwdsa = db.sql`SELECT keyword, COUNT(author) as authors, SUM(count) as pubs FROM (
SELECT keyword.value as keyword, creator.value as author, COUNT(*) as count FROM publications, JSON_EACH(publications.keywords) keyword, JSON_EACH(publications.creators) creator GROUP BY keyword.value, creator.value ORDER BY keyword ASC, count DESC
) GROUP BY keyword ORDER BY keyword ASC`;
```

```js
Plot.plot({
  x: {grid: true, type: 'sqrt'},
  y: {grid: true, type: 'sqrt'},
  color: {legend: false},
  marks: [
    Plot.dot(kwdsa, {y: "pubs", x: "authors", fill: "keyword", tip: true})
  ]
})
```

???

Most publications are not classified using keywords that help locate the item???

- Too general (used for loads).
- Too specific (used one or twice).
- Repeated from title or abstract.

???

## iPRES Keywords Over Time

Here we use a more complex query to unpack the array of keywords associated with each paper, and then count how often each keyword is used each year.  We then limit the result set to keywords that are used at least three times in a given year, to keep the size of the data set manageable and focussed.

```
SELECT year, keyword.value as keyword, COUNT(*) as count FROM publications, JSON_EACH(publications.keywords) keyword GROUP BY year, keyword.value HAVING COUNT(*) >= 3 ORDER BY year ASC, count DESC
```

```js
const kwds = db.sql`SELECT year, keyword.value as keyword, COUNT(*) as count FROM publications, JSON_EACH(publications.keywords) keyword GROUP BY year, keyword.value HAVING COUNT(*) >= 3 ORDER BY year ASC, count DESC`; 
// Similar JSON_EACH(publications.creators) creator, 
```

The data can then be visualised as an [ordinal scatterplot](https://observablehq.com/@observablehq/plot-ordinal-scatterplot), where ongoing usage should show up as horizontal sequences of dots, with the dot size indicating the number of papers using that keyword in that year.

<div class="tip">The text is quite small on this visualisation so you might find it needs a large screen.</div>

<div class="grid grid-cols-1">${
Plot.dot(
  kwds, {x: "year", y: "keyword", r: "count", fill: "lightgray", stroke: "black", tip: true }
).plot({ marginLeft: 200, x: { tickFormat: (d) => d.toString() } })
}</div>

This plot vividly illustrates that publication keywords have been used in different ways over the years.


## iPRES Author Network

We can also pull out the authors, and make a graph where the size of each node indicates the number of publications they have been listed as an author of. We represent co-authorship as links between authors, with the width of the line indicating the number of times they have published together.

This requires quite a lot of manipulation of the raw data, but the network can then be displayed using a slightly modified version of a [widely-used network visualisation method](https://observablehq.com/framework/lib/d3).

<div class="warning">This isn't easy to interact with on a mobile device. Try using a laptop or desktop computer.</div>

<div class="tip">Scroll down and press the <b>Go!</b> button to start the visualisation. When the network is visible, you can hover your mouse pointer over any node inside the dashed border and it will show the author's name and publication count.</div>

```js
// Get the creator strings, and parse them into lists of creators:
const creators_str = await db.sql`SELECT creators FROM publications;`;
var creators = creators_str.map( c => JSON.parse(c.creators));

// Generate a list of the unique nodes, counting how often they occur:
const nodes_counter = {}
creators.map( cs => cs.map( c => {
  nodes_counter[c] =  1 + (nodes_counter[c] || 0);
}));
const node_index = Object.keys(nodes_counter);
//display(node_index);

// Assemble an index of nodes including the counts:
const node_list = [];
for ( var i = 0; i < node_index.length; i++ ) {
  node_list.push( { 
    id: i,
    name: node_index[i],
    count: nodes_counter[node_index[i]],
    group: 0
  });
}
//display(nodes);

// Now the links...

// Generates each combination, storing node indexes, and sorted so node pairs always match:
function generate_combinations(array, nodes) { 
  var result = array.reduce( (acc, v, i) =>
    acc.concat(array.slice(i+1).map( w => [nodes.indexOf(v) , nodes.indexOf(w)].sort() )),
  []);
  return result;
}

// Extract out all the individual creator pairs from papers:
const single_links = creators.flatMap( c => generate_combinations(c, node_index));
// Sort the array so we can count unique entries more easily:
single_links.sort();

// Now count them:
var count = 1;
const links = [];
// Loop over the sorted array, looking at pairs:
for (var i = 0; i < single_links.length; i++)
{
    if (i < single_links.length - 1 && single_links[i].join(",") == single_links[i+1].join(","))
    {
      count +=1;
    }
    else
    {
        links.push( {
          source: single_links[i][0],
          target: single_links[i][1],
          value: count
        })
        count=1;
    }
}

//display(links);

const data = {
  nodes: node_list,
  links: links
}
```

```js
const width = 640;
const height = 640;
const color = d3.scaleOrdinal(d3.schemeObservable10);

// Copy the data to protect against mutation by d3.forceSimulation.
const links = data.links.map((d) => Object.create(d));
const nodes = data.nodes.map((d) => Object.create(d));

// Set up the graph
const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id((d) => d.id))
    .force("charge", d3.forceManyBody().strength(-5))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .on("tick", ticked)
    .stop();

const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto;");

const link = svg.append("g")
    .attr("stroke", "var(--theme-foreground-faint)")
    .attr("stroke-opacity", 0.3)
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke-width", (d) => d.value);
  
const node = svg.append("g")
    .attr("stroke", "var(--theme-background)")
    .attr("stroke-width", 1.0)
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", (d) => 1 + d.count )
    .attr("fill", (d) => color(d.group))
    .call(drag(simulation));

node.append("title")
    .text((d) => d.name + ": " + d.count);

function ticked() {
  link
    .attr("x1", (d) => d.source.x)
    .attr("y1", (d) => d.source.y)
    .attr("x2", (d) => d.target.x)
    .attr("y2", (d) => d.target.y);

  node
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y);
}

function restarter() {
  simulation.restart();
}
```

```js
function drag(simulation) {

  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
}
```
<!-- This is, quite accidentally, the most awesome effect ever! -->
<div class="grid grid-cols-1" style="border: 1.5px #ccc dashed;">
${svg.node()}
</div>

```js
const graph = view(Inputs.button("Go!", {label: "View the network", value: null, reduce: () => restarter() } ));
```

```js
const highlight = view(Inputs.text({ label: "Highlight by name", placeholder:"any part of someone's name"}));
```

```js
// Highlight some items:
d3.selectAll("circle").attr("fill", (d) => {
  console.log(d);
  if( highlight.length > 0 && d.name && d.name.toLowerCase().indexOf(highlight.toLowerCase()) >= 0 ) {
    return 'red';
  } else {
    return color(d.group)
  }
  });
```