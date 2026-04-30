const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Extract all Working Image Mappings from Static HTML
// We normalize titles to match properly
const norm = (s) => s ? s.toLowerCase().replace(/[^\w\s]/g, '').trim() : '';

const workingMap = new Map(); // normalized title -> working src
const imgRegex = /<img[^>]+alt="([^"]+)"[^>]+src="(\/images\/[^"]+)"/g;
let match;
while ((match = imgRegex.exec(html)) !== null) {
    workingMap.set(norm(match[1]), match[2]);
}
console.log(`Found ${workingMap.size} working images in static HTML.`);

// 2. Locate __NEXT_DATA__
const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]+?)<\/script>/);
if (!nextDataMatch) {
    console.log('__NEXT_DATA__ not found');
    process.exit(1);
}
let jsonStr = nextDataMatch[1];
const data = JSON.parse(jsonStr);

// 3. Update the Data Object recursively
let updatedCount = 0;
const processObj = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    
    // Pattern found: { "title": "...", "images": ["/products/..."] }
    if (obj.title && obj.images && Array.isArray(obj.images)) {
        const titleNorm = norm(obj.title);
        const workingSrc = workingMap.get(titleNorm);
        if (workingSrc) {
            if (obj.images[0] !== workingSrc) {
                console.log(`Updating "${obj.title}": ${obj.images[0]} -> ${workingSrc}`);
                obj.images = [workingSrc];
                updatedCount++;
            }
        } else {
            // Try partial match if exact fails
            for (const [normT, src] of workingMap.entries()) {
                if (titleNorm.includes(normT) || normT.includes(titleNorm)) {
                    obj.images = [src];
                    updatedCount++;
                    break;
                }
            }
        }
    }
    
    for (const key in obj) {
        if (typeof obj[key] === 'object') processObj(obj[key]);
    }
};

processObj(data);

// 4. Write back
if (updatedCount > 0) {
    const newJsonStr = JSON.stringify(data);
    const finalHtml = html.replace(nextDataMatch[1], newJsonStr);
    fs.writeFileSync('index.html', finalHtml);
    console.log(`Successfully patched ${updatedCount} image paths in __NEXT_DATA__.`);
} else {
    console.log('No matches found for patching.');
}
