# Experimental Analyses

```js
import {SQLiteDatabaseClient} from "npm:@observablehq/sqlite";

const db = SQLiteDatabaseClient.open("https://raw.githubusercontent.com/digipres/digipres-practice-index/main/releases/practice.db");
```

## iPRES New Words This Year

```js
const words_by_year = db.sql`SELECT year, group_concat(abstract, " ") as text FROM publications GROUP BY year;`;
```

```js
var prior_words = new Set();
var new_words = new Set();
const target_year = 2024;

words_by_year.map( words => {
  var unique_words = new Set();
  words.text.split(" ").forEach( word => {
    unique_words.add(word.toLowerCase().replace(/[^\w\s\']|_/g, "").replace(/\s+/g, ""));
  });
  words.unique = unique_words;
  // Accumulate:
  if ( words.year < target_year ) {
    prior_words = prior_words.union(unique_words);
  } else if ( words.year == target_year ) {
    new_words = unique_words;
  }
});
// Remove!
new_words = new_words.difference(prior_words);

display(words_by_year);
display(prior_words);
display(new_words);
```

## iPRES Words Over Time

This is an attempt to do trend analysis based on word frequency in abstracts. It's interesting enough to keep here as the visualisations etc. may become more useful if the data can be improved.  But as things are, the quality of the results is poor. It seems likely that the abstracts are not enough to identify trends, at least without more sophisticated language analysis to cluster concepts that use different words.  Basing it on full-texts might also help. Also, the trends in the field may be weak.

```js
const words = db.sql`SELECT year, group_concat(abstract, " ") as text FROM publications GROUP BY year;`;
```

```js

const stop_words = ['i','me','my','myself','we','our','ours','ourselves','you','your','yours','yourself','yourselves','he','him','his','himself','she','her','hers','herself','it','its','itself','they','them','their','theirs','themselves','what','which','who','whom','this','that','these','those','am','is','are','was','were','be','been','being','have','has','had','having','do','does','did','doing','a','an','the','and','but','if','or','because','as','until','while','of','at','by','for','with','about','against','between','into','through','during','before','after','above','below','to','from','up','down','in','out','on','off','over','under','again','further','then','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','s','t','can','will','just','don','should','now', 'digital', 'preservation', 'e', 'use', 'used', 'talk', 'paper', 'long', 'short', 'data', 'information', 'presentation', 'workshop', 'also' ,'br', 'work' ,'different', 'kb', 'new'];

function wordFreq(string) {
    var words = string.replace(/[^a-zA-Z]/g, ' ').split(/\s/);
    var freqMap = {};
    words.forEach(function(w) {
        w = w.toLowerCase();
        if (!w || stop_words.includes(w)) {
          return;
        }      
        if (!freqMap[w]) {
            freqMap[w] = 0;
        }
        freqMap[w] += 1;
    });

    // Return in frequency order:
    return Object.entries(freqMap).sort(([, a],[, b]) => b-a).slice(0,10);
}

const all_words = new Set();
const all_years = new Set();
const total_words_per_year = {};
words.forEach((item, i) => {
  all_years.add(item.year);
  item.top_words = wordFreq(item.text);
    item.top_words.forEach((word, i) => {
      all_words.add(word[0]);
      total_words_per_year[item.year] = (total_words_per_year[item.year] || 0) + word[1];
  });

});

display(total_words_per_year);

const words_over_time = [];
all_years.forEach((year, yi) => {
  const year_item = words.find((item) => item.year == year );
  all_words.forEach((word, wi) => {
    const word_item = year_item.top_words.find((word_item) => word_item[0] == word);
    var count = 0;
    if( word_item ) {
      count = word_item[1];
    }
    words_over_time.push({
      word: word,
      year: year,
      count: count/total_words_per_year[year]
    });
  });
});
/*  item.top_words.forEach((word, i) => {
    words_over_time.push({
      word: word[0],
      year: item.year,
      count: word[1]
    });

  });
*/

```

```js
Plot.plot({
  height: 720,
  axis: null,
  marks: [
    Plot.areaY(words_over_time, {x: "year", y: "count", fy: "word"}),
    Plot.text(words_over_time, Plot.selectFirst({text: "word", fy: "word", frameAnchor: "top-left", dx: 6, dy: 6})),
    Plot.frame()
  ]
})
```

```js
Plot.plot({
  y: {
    grid: true,
    label: "fraction"
  },
  color: {legend: false },
  marks: [
    Plot.areaY(words_over_time, {x: "year", y: "count", z: "word", fill: "word", offset: 'wiggle', tip:true})
  ]
})
```