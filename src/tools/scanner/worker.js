// worker.js
self.addEventListener('message', async (event) => {
    const { type, dirHandle, path, exclude_dot_files } = event.data;
  
    if (type === 'scanDirectory') {
      self.postMessage({ type: 'newScanStarting' });
      const results = [];
      for await ( const result of scanDirectoryRecursive(dirHandle, path, exclude_dot_files) ) {
        self.postMessage({ type: 'scanResult', result });
        results.push(result);
      }
      self.postMessage({ type: 'scanResults', results });
    }
  });
  
  async function* scanDirectoryRecursive(dirHandle, path, exclude_dot_files) {
    const results = [];
  
    for await (const entry of dirHandle.values()) {
      const currentPath = `${path}${path ? '/' : ''}${entry.name}`;

      if( exclude_dot_files && entry.name.startsWith('.')) {
        self.postMessage({ type: 'scanWarning', message: `Skipping hidden file/folder '${currentPath}'...\n`});
        continue;
      }
  
      if (entry.kind === 'file') {
        const file = await entry.getFile();
        const result = { name: currentPath, size: file.size };
        yield result;
      } else if (entry.kind === 'directory') {
        const subDirResults = await scanDirectoryRecursive(entry, currentPath, exclude_dot_files);
        yield * subDirResults;
      }
    }
  
    return results;
  }