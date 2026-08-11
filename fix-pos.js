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
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('frontend/src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // In POS files, fix routes
    if (file.includes('eviko-pos')) {
        content = content.replace(/\"\/eviko\/printers\"/g, '\"/eviko-pos/printers\"');
        content = content.replace(/\"\/eviko\/support\"/g, '\"/eviko-pos/support\"');
    }
    
    // In login/page.tsx, Kassir routes should be eviko-pos
    if (file.includes('login/page.tsx')) {
        // Line 765: Default kassir
        content = content.replace(/router\.push\(\"\/eviko\"\); \/\/ Default kassir/g, 'router.push(\"/eviko-pos\"); // Default kassir');
        // Let's just fix it manually if it doesn't match perfectly
    }
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed POS routes in: ' + file);
    }
});
