# Publications
## Analysing data on publications related to digital preservation

## Introduction

As part of the [Registries of Good Practice project](https://github.com/digipres/registries-of-practice-project#registries-of-good-practice-project) we are building an [index of publications related to digital preservation](http://www.digipres.org/publications/).  That process involves bringing the index data together as an [SQLite](https://sqlite.org/) database.

This page provides an initial proof-of-concept showing how analysis and visualisation tools can be applied to that database, and used to generate visualisations that help us understand and explore the data.  It runs in your browser, downloads the database, and generates graphs based on SQL queries.

```js
import {SQLiteDatabaseClient} from "npm:@observablehq/sqlite";

const db = SQLiteDatabaseClient.open("https://raw.githubusercontent.com/digipres/digipres-practice-index/main/releases/practice.db");
```


## Publication Types Over Time

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
).plot({ color: { legend: true }, x: { tickFormat: (d) => d.toString() } })
```
