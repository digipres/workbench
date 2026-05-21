# Your Collection Profiles
## Manage The Set Of Collection Profiles You Can Use

Here you can inspect the format profiles and add your own if you wish. They will be stored in your browser and won't be shared or uploaded anywhere.

```js
import { get_profiles, process_profile, get_local_profile_folder } from './profiles.js';
const source_profiles = await get_profiles();
const profiles = [];
source_profiles.forEach((p) => profiles.push(process_profile(p)));
```

```js

```

```js

// n.b. best to create new top-level objects in blocks, rather than update existing ones, as that makes if easier for Observable Framework to keep track of block dependencies:        

if( csvfile != null ) {
    const uploaded = await csvfile.csv();
    const locals = await get_local_profile_folder();
    console.log(csvfile)
    const in_stream = await csvfile.stream();
    const out_file = await locals.getFileHandle(csvfile.name, { create: true });
    const out_stream = await out_file.createWritable();
    in_stream.pipeTo(out_stream)

/*
    const uploaded_item = source_profiles.find((p) => p.key == user_profile_key);
    // If it's already in the source profiles list, just update the data (rather than creating another entry)
    if( uploaded_item ) {
        uploaded_item.raw_data = uploaded
    } else {
        source_profiles.push({
        key: user_profile_key, 
        title: "Your uploaded extension profile",
        raw_data: uploaded
        });
    };
    */
}


```


```js
// output the table:
const profile_overview = view(Inputs.table(profiles, {
    columns: [
        "title",
        "terms",
        "link",
        "total_count",
    ],
    header: {
        title: "Title",
        terms: "Terms",
        link: "Link",
        total_count: "Total Files",
    },
    format: {
        link: (d) => html`<a href="${d}" target="_blank">[open]</a>`
    },
    width: {
        title: "50%",
        terms: "10%",
        total_count: "15%",
    },
    sort: "title",
    multiple: false,
    rows: 20,
}));
```

```js

//view(Inputs.button("Save All As CSV...", {value: { data: source_profiles, columns: ['title', 'terms', 'link', 'total_count' ], name: "collection-profiles" }, reduce: save_dataset }));
```

```js
// Define defaults:
var default_1 = "yul";
var default_2 = "kb-edepot";

if( profile_overview ) {
    console.log(profile_overview);
    // Override default:
    default_1 = profile_overview.key;
    // And display:
    display(html`<div class="tip" label="${profile_overview.title}">
    <p>${profile_overview.description}</p>
    <table class="table">
    <tbody>
    <tr><th>Total Extensions</th><td>${d3.format(",")(profile_overview.raw_data.length)}</td></tr>
    <tr><th>Total Files</th><td>${d3.format(",")(profile_overview.total_count)}</td></tr>
    <tr><th>Total Unique, Usable Extensions</th><td>${d3.format(",")(profile_overview.ok_data_all.length)}</td></tr>
    <tr><th>Total Files With Usable Extensions</th><td>${d3.format(",")(profile_overview.total_ok_count)}</td></tr>
    <tr><th>Total <abbr title="Total number of extensions that could not be used, e.g. contained spaces, or were just numbers.">Unusable</abbr> Extensions</th><td><abbr title="${profile_overview.strange_extensions}">${d3.format(",")(profile_overview.strange.length)}</abbr></td></tr>
    <tr><th>Total Files With Unusable Extensions</th><td>${d3.format(",")(profile_overview.total_strange_count)}</td></tr>
    <tr><th>Frequency Cutoff</th><td>${profile_overview.frequency_cutoff}</td></tr>
    <tr><th>Truncated At</th><td>${profile_overview.truncated_at}</td></tr>
    <tr><th>Terms</th><td>${profile_overview.terms}</td></tr>
    <tr><th>Link</th><td>${ profile_overview.link && html`<a href="${profile_overview.link}">Click here for more information</a>` }</td></tr>
    </tbody>
    </table>
    </div`);
} else {
    display(html`<div class="tip">Select a row from the table to find out more.</div>`);
}

```


## Add your local collection profiles

You can add your own profile to this page, and analyse it without uploading your data anywhere:

```js
const csvfile = view(Inputs.file({label: "Add Your Own CSV Extension Profile", accept: ".csv"}));
```

### How do I create a suitable Extension Profile in CSV format?

Your file extension collection profile should have at least two columns, one called 'extension' and one called 'count'. Other columns will be ignored. This would look something like:

| extension | count |
| --------- | ---------- | 
| PDF       |        50  |
| DOCX      |       202  |
| pdf       |        12  |
| ...       |       ...  |

Note that extensions that are just numbers, or contain spaces, will be dropped. Note also that the system will attempt to convert the extensions into a canonical lower-case format, i.e. `*.pdf`, but you can just supply the extension e.g. `pdf` or `.pdf` and it should work it out.

Note that the `count` should be supplied as a plain number, e.g. `1024` rather than formatted like e.g. `1,024`.

If you want to include files with no extension, please use the special value `(no extension)` as the value for the `extension`. If there is a column with an empty string, it will be interpreted as `(no extension)`.

Finally, note that if the same (canonical) extension appears multiple times, the total file count will be add together all occurrences. e.g. in the example above, you'd end up with:

| extension | count |
| --------- | ---------- | 
| *.pdf     |        62  |

If your browser supports it, you can try generating an extension profile of some of your own files with the [DigiPres Workbench File System Scanner](../../tools/scanner/).

If you have any problems, please [get in touch via the contact details on the homepage](../../#contact).


```js

//view(Inputs.button("Save All As CSV...", {value: { data: source_profiles, columns: ['title', 'terms', 'link', 'total_count' ], name: "collection-profiles" }, reduce: save_dataset }));
```
