const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            if (!file.includes('node_modules') && !file.includes('.next')) {
                results = results.concat(walk(file));
            }
        } else { 
            if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.css') || file.endsWith('.json')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('frontend/src');
files.push('frontend/package.json');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // URL replacements
    content = content.replace(/\/smart-pos/g, '/eviko');
    content = content.replace(/\/api\/smart/g, '/api/eviko');
    // For other links
    content = content.replace(/\"\/smart\"/g, '\"/eviko\"');
    content = content.replace(/\"\/smart\//g, '\"/eviko/');
    // For storage keys
    content = content.replace(/smart-pos-storage/g, 'eviko-storage');
    // For general labels (already replaced some, but just to be safe)
    content = content.replace(/Smart POS/g, 'EVIKO POS');
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated: ' + file);
    }
});
