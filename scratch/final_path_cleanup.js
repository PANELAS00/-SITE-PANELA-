const fs = require('fs');
const path = require('path');

function patchFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Regex explanation:
    // /products/ : starting with products
    // ([^"'\s]+\.(?:jpg|jpeg|png|webp|svg|gif)) : capture filename + extension (case insensitive)
    // Make sure it doesn't have /api/admin/ before it
    const imageRegex = /"\/products\/([^"'\s]+\.(?:jpg|jpeg|png|webp|svg|gif))"/gi;
    
    let matchCount = 0;
    const newContent = content.replace(imageRegex, (match, fileName) => {
        // Double check it's not an API path (though the regex starts with "/products/")
        matchCount++;
        return `"/images/${fileName}"`;
    });

    if (matchCount > 0) {
        fs.writeFileSync(filePath, newContent);
        console.log(`Patched ${matchCount} image paths in ${filePath}`);
    } else {
        console.log(`No image paths found in ${filePath}`);
    }
}

// 1. Patch main index.html
patchFile('index.html');

// 2. Patch backup index.html if it exists
patchFile('extracted_zip/index.html');
