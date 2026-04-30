const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Find __NEXT_DATA__
const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]+?)<\/script>/);
if (!nextDataMatch) {
    console.log('__NEXT_DATA__ not found');
    process.exit(1);
}

let dataStr = nextDataMatch[1];
const data = JSON.parse(dataStr);

// Extract all images from HTML with their associated alt text
const imgMap = new Map();
const imgRegex = /<img[^>]+alt="([^"]+)"[^>]+src="(\/images\/[^"]+)"/g;
let match;
while ((match = imgRegex.exec(html)) !== null) {
    imgMap.set(match[1].trim().toLowerCase(), match[2]);
}

console.log('Images found in HTML:', imgMap.size);

// Function to normalize strings for comparison
const normalize = (s) => s ? s.trim().toLowerCase() : '';

// Recursive function to update image paths in the data object
let updatedCount = 0;
const processObject = (obj) => {
    if (!obj || typeof obj !== 'object') return;

    if (obj.title && obj.image && Array.isArray(obj.image)) {
        const title = normalize(obj.title);
        for (const [htmlTitle, src] of imgMap.entries()) {
            if (title.includes(htmlTitle) || htmlTitle.includes(title)) {
                console.log(`Match found: "${obj.title}" -> ${src}`);
                obj.image = [src]; // Update the image array
                updatedCount++;
                break;
            }
        }
    }

    for (const key in obj) {
        if (typeof obj[key] === 'object') {
            processObject(obj[key]);
        }
    }
};

processObject(data);

if (updatedCount > 0) {
    const newDataStr = JSON.stringify(data);
    html = html.replace(dataStr, newDataStr);
    fs.writeFileSync('index.html', html);
    console.log(`Successfully updated ${updatedCount} image paths in __NEXT_DATA__`);
} else {
    console.log('No matches found in recursive search');
}
