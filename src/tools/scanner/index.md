# File System Scanner
## Scan your own files without installs or uploads


```js
// Check for browser support for the required APIs:
var browserNotSupported = false;

if ( window.showDirectoryPicker === undefined ) {
    browserNotSupported = true;
    display(html`<div class="caution" label="Your Web Browser Can't Do This!">This tool depends on experimental JavaScript features that are not supported by your current web browser.  At the time of writing, you need to use Chrome, Edge or Opera for this to work. Please take a look at <a href="https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker">this page</a> to find out more.</div>`);
}
```

<div class="tip">

This is a basic tool that runs in your web browser, scanning your local files without sending any data anywhere else.

It just counts the number of different file extensions, building up a simple collection profiles that you can use to e.g. [compare your files against other collections and information sources](../../formats/profiles).

If you want to run format identification in your browser, you could try [Siegfried.JS](https://siegfried-js.glitch.me/) for individual files, or [Demystify Lite](https://ross-spencer.github.io/demystify-lite/) to scan and report on sets of files.

</div>

```js
const exclude_dot_files = view(Inputs.radio([true, false], {label: "Exclude hidden files? (i.e. names that start with a dot):", value: true}));
const count_threshold = view(Inputs.range([1, 10000], {step: 1, value: 1, label: "Only include extensions with a file count of at least:" }));
const truncate_threshold = view(Inputs.range([1, 10000], {step: 1, value: 10, label: "When saving, truncate extensions with a file count lower than:" }));
const truncate_length = view(Inputs.range([1, 10000], {step: 1, value: 6, label: "When saving, low-frequency extensions to be no longer than:" }));
```

```js
    const worker_link = FileAttachment("worker.js");

    const worker = new Worker(worker_link.href);

    function appendToLog(message) {
      const output = document.getElementById('output');
      output.textContent += message
    }

    // This wraps the scan results listener so Observable Framework can track updates:
    const extensions = Generators.observe((change) => {
        // Extension table is defined in this block, and passed back as it updates:
        var extensions = {};
        change(extensions);

        // Listen for updates from the Worker thread:
        worker.addEventListener('message', (event) => {
            const { type, results, result, message } = event.data;

            console.log(`Processing message ${type}...`);

            if (type === 'scanResults') {
                console.log(results);
            } else if (type === 'scanWarning' ) {
              appendToLog(message);
            } else if (type === 'scanResult' ) {
                // Log it
                appendToLog(`Found file: ${result.name}, Size: ${result.size} bytes\n`);
                // Process the name for the file extensions:
                if( result.name.indexOf('.') > -1 && result.name.indexOf('.') < result.name.length ) {
                    const ext = result.name.substring(result.name.lastIndexOf('.') + 1).toLowerCase();
                    extensions[ext] = (extensions[ext] || 0 ) + 1;
                    // Let the Observable Framework know something has changed.
                    change(extensions);
                }
            } else if (type === 'newScanStarting' ) {
                extensions = {};
            } else if (type === 'error') {
                console.error(message);
            }
        });
    });

    async function scanFiles() {
      try {
        const fileHandles = await window.showOpenFilePicker();
        const output = document.getElementById('output');
        output.textContent = '';

        for (const fileHandle of fileHandles) {
          const file = await fileHandle.getFile();
          const result = { name: file.name, size: file.size };
          output.textContent += `File: ${file.name}, Size: ${file.size} bytes\n`;
        }
      } catch (err) {
        console.error(err);
      }
    }

    async function scanDirectory() {
      try {
        const dirHandle = await window.showDirectoryPicker();
        const output = document.getElementById('output');
        output.textContent = '';

        worker.postMessage({ type: 'scanDirectory', dirHandle, path: '', exclude_dot_files });
      } catch (err) {
        console.error(err);
      }
    }


```


```js
const scan_button = view(Inputs.button("Select Directory To Scan", {value: null, reduce: scanDirectory, disabled: browserNotSupported }));
```

<details>
  <summary>Progress Log</summary>
  <pre id="output"></pre>
</details>

```js
// Convert the dict/object into an array for plotting:
const ext_data = [];
for (const [key, value] of Object.entries(extensions)) {
    ext_data.push({
        extension: key,
        count: value
    })
}

```

```js
Plot.plot({
  title: "Distribution of file extensions",
  x: { grid: true, label: "Extension", tickRotate: -70, type: "band" },
  y: { grid: true, label: "Number of files" },
  width,
  marginBottom: 50,
  marks: [
    //Plot.ruleX([0]),
    //Plot.ruleY([0]),
    Plot.rectY(ext_data.filter( (d) => d.count >= count_threshold),
      {x: "extension", y: "count", sort: { x: '-y'}, tip: true })
  ]
})
```

```js
async function saveExtensionProfile() {
  try {
    // create a new handle
    const opts = {
      types: [
        {
          description: "Comma Separated Values",
          accept: { "text/csv": [".csv"] },
        },
      ],
    };
    const newHandle = await window.showSaveFilePicker(opts);

    // create a FileSystemWritableFileStream to write to
    const writableStream = await newHandle.createWritable();

    // write our file
    await writableStream.write("extension,count\n");
    for( const item of ext_data) {
        if( item.count >= count_threshold) {
          // Only output these...
          if( item.count >= truncate_threshold) {
            await writableStream.write(`${item.extension},${item.count}\n`);
          } else {
            await writableStream.write(`${item.extension.substring(0, truncate_length)},${item.count}\n`);
          }
        }
    }

    // close the file and write the contents to disk.
    await writableStream.close();
  } catch (err) {
    console.error(err.name, err.message);
  }
}


const scan_button = view(Inputs.button("Save Extension Profile", {value: null, reduce: saveExtensionProfile, disabled: ext_data.length == 0 }));
```


