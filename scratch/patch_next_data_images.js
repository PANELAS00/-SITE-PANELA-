const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Extract all Working Image Mappings from Static HTML
const workingImages = []; // Array of {title, src}
const imgRegex = /<img[^>]+alt="([^"]+)"[^>]+src="(\/images\/[^"]+)"/g;
let match;
while ((match = imgRegex.exec(html)) !== null) {
    workingImages.push({ title: match[1].trim(), src: match[2] });
}
console.log(`Found ${workingImages.length} working images in static HTML.`);

// 2. Locate __NEXT_DATA__
const nextDataStart = html.indexOf('<script id="__NEXT_DATA__" type="application/json">');
if (nextDataStart === -1) {
    console.log('__NEXT_DATA__ not found');
    process.exit(1);
}
const jsonStart = html.indexOf('{', nextDataStart);
const jsonEnd = html.indexOf('</script>', jsonStart);
let jsonStr = html.substring(jsonStart, jsonEnd);

// 3. Update the JSON String
let updatedCount = 0;
workingImages.forEach(({title, src}) => {
    // Find where this product is in the JSON
    // We look for the title and then the image path near it
    // Pattern: "title":"Product Title" ... "image":["/products/..."]
    // Since it's minified, we use a regex on the string directly
    const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const productRegex = new RegExp(`"title":"${escapedTitle}"[^}]*"image":\\["([^"]+)"\\]`, 'g');
    
    let pMatch;
    while ((pMatch = productRegex.exec(jsonStr)) !== null) {
        const oldImagePath = pMatch[1];
        if (oldImagePath !== src) {
            // Replace the specific instance in jsonStr
            const fullMatch = pMatch[0];
            const updatedMatch = fullMatch.replace(`"${oldImagePath}"`, `"${src}"`);
            jsonStr = jsonStr.replace(fullMatch, updatedMatch);
            updatedCount++;
        }
    }
});

// 4. Write back
if (updatedCount > 0) {
    const finalHtml = html.substring(0, jsonStart) + jsonStr + html.substring(jsonEnd);
    fs.writeFileSync('index.html', finalHtml);
    console.log(`Successfully patched ${updatedCount} image paths in __NEXT_DATA__.`);
} else {
    console.log('No paths needed updating or no matches found.');
}
