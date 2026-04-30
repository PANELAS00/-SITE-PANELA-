const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]+?)<\/script>/);
if (!nextDataMatch) {
    console.log('__NEXT_DATA__ not found');
    process.exit(1);
}

const data = JSON.parse(nextDataMatch[1]);
const props = data.props.pageProps;

// Extract mapping from static HTML part
// We look for patterns like: alt="Product Title" ... src="/images/image_N.jpg"
// Since the HTML is minified, we need a flexible regex
const productsInHtml = [];
const imgRegex = /<img[^>]+alt="([^"]+)"[^>]+src="(\/images\/[^"]+)"/g;
let match;
while ((match = imgRegex.exec(html)) !== null) {
    productsInHtml.push({ title: match[1], src: match[2] });
}

console.log('Products found in static HTML:', productsInHtml.length);

// Now try to update the data object
let updatedCount = 0;
const updateImages = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key in obj) {
        if (typeof obj[key] === 'string' && obj[key].startsWith('/products/')) {
            const oldPath = obj[key];
            // Try to find matching product by some attribute
            // This is tricky since obj might be a product or just a string
            // For now, let's look at the parent object if possible
        }
        if (Array.isArray(obj[key])) {
             obj[key].forEach(item => updateImages(item));
        } else {
             updateImages(obj[key]);
        }
    }
};

// Actually, let's just do a string replacement in the JSON for the paths we find in HTML
// If we find a product in pageProps with a title that matches an alt in HTML, 
// we know its image path should be updated.

const updateProducts = (productList) => {
    if (!Array.isArray(productList)) return;
    productList.forEach(p => {
        const match = productsInHtml.find(h => h.title.includes(p.title) || p.title.includes(h.title));
        if (match && p.image && p.image[0]) {
            console.log(`Updating ${p.title}: ${p.image[0]} -> ${match.src}`);
            p.image[0] = match.src;
            updatedCount++;
        }
    });
};

if (props.topProducts) updateProducts(props.topProducts);
if (props.categorySections) {
    props.categorySections.forEach(sec => updateProducts(sec.products));
}

if (updatedCount > 0) {
    const newData = JSON.stringify(data);
    html = html.replace(nextDataMatch[1], newData);
    fs.writeFileSync('index.html', html);
    console.log(`Updated ${updatedCount} product image paths in __NEXT_DATA__`);
} else {
    console.log('No products matched for update');
}
