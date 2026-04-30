const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

console.log('--- SYNC VERIFICATION BY PRODUCT TITLE ---');

// 1. Get first product from static HTML
const imgRegex = /<img[^>]+alt="([^"]+)"[^>]+src="(\/images\/image[^"]+)"/;
const htmlMatch = html.match(imgRegex);

if (htmlMatch) {
    const title = htmlMatch[1];
    const src = htmlMatch[2];
    console.log(`HTML says: "${title}" -> ${src}`);

    // 2. Find same product in JSON
    const nextMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]+?)<\/script>/);
    if (nextMatch) {
        const data = JSON.parse(nextMatch[1]);
        let found = false;

        function findProduct(obj) {
            if (found) return;
            if (Array.isArray(obj)) {
                obj.forEach(item => findProduct(item));
            } else if (obj && typeof obj === 'object') {
                if (obj.title === title && obj.images) {
                    console.log(`JSON says: "${obj.title}" -> ${obj.images[0]}`);
                    found = true;
                }
                for (let k in obj) findProduct(obj[k]);
            }
        }
        findProduct(data);
        if (!found) console.log(`Product "${title}" not found in JSON.`);
    }
} else {
    console.log('No product image found in HTML.');
}
