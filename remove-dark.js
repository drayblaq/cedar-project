const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');

            // Regex to match "dark:something " or " dark:something" or "dark:something"
            // it matches 'dark:' followed by word chars, dashes, slashes, or brackets
            let originalContent = content;
            content = content.replace(/(?:\b|\s)dark:[a-zA-Z0-9\-\/\[\]\.]+/g, '');

            // Also remove any extra whitespace created inside class strings
            content = content.replace(/className=(["'])\s+/g, 'className=$1');
            content = content.replace(/\s+(["'])/g, '$1');

            // Fix cases where className="" becomes empty
            content = content.replace(/className=""/g, '');

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

processDirectory(path.join(__dirname, 'app'));
