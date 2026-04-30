const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const targetProduct = "Chapa Oval Artesanal em Pedra Sabão";

console.log(`--- SYNC VERIFICATION FOR: ${targetProduct} ---`);

// 1. Find in HTML
// The static HTML title is "CHAPA OVAL ARTESANAL EM PEDRA SAB\u00C3O" (all caps)
const htmlRegex = new RegExp(`<img[^>]+alt="([^"]*${targetProduct.split(' ')[0]}[^"]*)"[^>]+src="([^"]+)"`, 'i');
const htmlMatch = html.match(htmlRegex);

if (htmlMatch) {
    console.log(`HTML Alt: "${htmlMatch[1]}"`);
    console.log(`HTML Src: ${htmlMatch[2]}`);
} else {
    console.log('Product not found in static HTML.');
}

// 2. Find in JSON
const nextMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]+?)<\/script>/);
if (nextMatch) {
    const data = JSON.parse(nextMatch[1]);
    let found = false;

    function findProduct(obj) {
        if (found) return;
        if (Array.isArray(obj)) {
            obj.forEach(item => findProduct(item));
        } else if (obj && typeof obj === 'object') {
            if (obj.title === targetProduct && obj.images) {
                console.log(`JSON Title: "${obj.title}"`);
                console.log(`JSON Image: ${obj.images[0]}`);
                found = true;
            }
            for (let k in obj) findProduct(obj[k]);
        }
    }
    findProduct(data);
}
