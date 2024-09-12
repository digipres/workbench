export async function save_dataset(dataset) {
    // Get the data and the columns:
    const {data, columns, name} = dataset;
    console.log(name);
  
    try {
      // create a new handle
      const opts = {
        types: [
          {
            description: "Comma Separated Values",
            accept: { "text/csv": [".csv"] },
          },
        ],
        suggestedName: name,
      };
      const newHandle = await window.showSaveFilePicker(opts);
  
      // create a FileSystemWritableFileStream to write to
      const writableStream = await newHandle.createWritable();
  
      // write our file
      await writableStream.write( columns.join(",") + "\n");
      for( const item of data) {
        const line = [];
        for( const col of columns) {
            line.push(`"${item[col]}"`);
        }
        await writableStream.write( line.join(",") + "\n");
      }
  
      // close the file and write the contents to disk.
      await writableStream.close();
    } catch (err) {
      console.error(err.name, err.message);
    }
}
