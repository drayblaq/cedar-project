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
            let originalContent = content;

            // Find all class strings
            const classRegex = /className=(["'])(.*?)\1/g;
            let match;
            while ((match = classRegex.exec(content)) !== null) {
                const classStr = match[2];
                const classes = classStr.split(/\s+/);

                for (const cls of classes) {
                    // If a class contains an invalid colon pattern (e.g. text-emerald-600:text-emerald-400 or :hover:text-white)
                    if (cls.includes(':')) {
                        const parts = cls.split(':');
                        // If any part starts with text-, bg-, border-, etc and is chained right after another without space
                        // Actually, we can just log all classes with colons that don't start with standard prefixes
                        const allowedPrefixes = ['hover', 'focus', 'active', 'group-hover', 'sm', 'md', 'lg', 'xl', '2xl', 'dark', 'disabled', 'focus-visible', 'focus-within'];
                        let valid = true;
                        for (let i = 0; i < parts.length - 1; i++) {
                            if (!allowedPrefixes.includes(parts[i])) {
                                valid = false;
                            }
                        }
                        if (!valid || parts[0] === '') {
                            console.log(`${fullPath}: Invalid class found -> ${cls}`);
                        }
                    }
                }
            }
        }
    }
}

processDirectory(path.join(__dirname, 'app'));
