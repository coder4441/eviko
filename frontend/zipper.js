const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const output = fs.createWriteStream(path.join(__dirname, '../frontend_cpanel_perfect.zip'));
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level.
});

output.on('close', function() {
  console.log(archive.pointer() + ' total bytes');
  console.log('archiver has been finalized and the output file descriptor has closed.');
});

archive.on('error', function(err) {
  throw err;
});

archive.pipe(output);

// Exclude these directories
const excludeDirs = ['node_modules', '.next', '.git'];

function addDirectory(dirPath, zipPath) {
  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    if (excludeDirs.includes(item)) continue;
    
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      addDirectory(fullPath, path.join(zipPath, item));
    } else {
      archive.file(fullPath, { name: path.join(zipPath, item).replace(/\\/g, '/') });
    }
  }
}

addDirectory(__dirname, '');
archive.finalize();
