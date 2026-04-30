const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Function to normalize titles for matching
const norm = (s) => s.toLowerCase().replace(/[^\w\s]/g, '').trim();

// 1. Extract all Working Image Mappings from Static HTML
const workingImages = [];
const imgRegex = /<img[^>]+alt="([^"]+)"[^>]+src="(\/images\/[^"]+)"/g;
let match;
while ((match = imgRegex.exec(html)) !== null) {
    workingImages.push({ title: match[1].trim(), norm: norm(match[1]), src: match[2] });
}
console.log(`Found ${workingImages.length} working images in static HTML.`);

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
    
    if (obj.title && typeof obj.title === 'string' && obj.image && Array.isArray(obj.image)) {
        const titleNorm = norm(obj.title);
        // Find best match in workingImages
        const match = workingImages.find(w => w.norm === titleNorm || titleNorm.includes(w.norm) || w.norm.includes(titleNorm));
        if (match) {
            if (obj.image[0] !== match.src) {
                console.log(`Updating "${obj.title}" image: ${obj.image[0]} -> ${match.src}`);
                obj.image[0] = match.src;
                updatedCount++;
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
    const finalHtml = html.replace(jsonStr, newJsonStr);
    fs.writeFileSync('index.html', finalHtml);
    console.log(`Successfully patched ${updatedCount} image paths in __NEXT_DATA__.`);
} else {
    console.log('No matches found for patching.');
}
