# Publications
## Analysing data on publications related to digital preservation

## Introduction

As part of the [Registries of Good Practice project](https://github.com/digipres/registries-of-practice-project#registries-of-good-practice-project) we are building an [index of publications related to digital preservation](http://www.digipres.org/publications/).  That process involves bringing the index data together as an [SQLite](https://sqlite.org/) database.

This page provides an initial proof-of-concept showing how analysis and visualisation tools can be applied to that database, and used to generate visualisations that help us understand and explore the data.  It runs in your browser, downloads the database, and generates graphs based on SQL queries.

Note that at the current time, the index only contains the iPRES conference proceedings dataset.

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

```js
Plot.barY(
  pubs, {x: "year", y: "count", fill: "type", tip: true }
).plot({ x: { tickFormat: (d) => d.toString() } })
```

## iPRES Keywords Over Time

Here we use a more complex query to unpack the array of keywords associated with each paper, and then count how often each keyword is used each year.  We then limit the result set to keywords that are used at least three times in a given year, to keep the size of the data set manageable and focussed.

```
SELECT year, keyword.value as keyword, COUNT(*) as count FROM publications, JSON_EACH(publications.keywords) keyword GROUP BY year, keyword.value HAVING COUNT(*) >= 3 ORDER BY year ASC, count DESC
```

```js
const auths = db.sql`SELECT year, keyword.value as keyword, COUNT(*) as count FROM publications, JSON_EACH(publications.keywords) keyword GROUP BY year, keyword.value HAVING COUNT(*) >= 3 ORDER BY year ASC, count DESC`; 
// Similar JSON_EACH(publications.creators) creator, 
```

The data can then be visualised as an [ordinal scatterplot](https://observablehq.com/@observablehq/plot-ordinal-scatterplot), where ongoing usage should show up as horizontal sequences of dots, with the dot size indicating the number of papers using that keyword in that year:


```js
Plot.dot(
  auths, {x: "year", y: "keyword", r: "count", tip: true }
).plot({ marginLeft: 200, x: { tickFormat: (d) => d.toString() } })
```

This plot vividly illustrates that publication keywords have been used in different ways over the years.