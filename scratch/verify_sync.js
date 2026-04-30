const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

console.log('--- 1. FOLDER CHECK ---');
console.log('Images folder exists: ' + fs.existsSync('images'));
console.log('Products folder exists: ' + fs.existsSync('products'));

console.log('\n--- 2. FIRST 3 IMAGE SRCs IN HTML (PRODUCT CARDS) ---');
// Looking for the pattern used in the cards
const imgRegex = /<img[^>]+src="(\/images\/image[^"]+)"/g;
let m, count = 0;
while ((m = imgRegex.exec(html)) && count < 3) {
    console.log(`Image ${count + 1}: ${m[1]}`);
    count++;
}

console.log('\n--- 3. FIRST 3 IMAGE PATHS IN __NEXT_DATA__ ---');
const nextMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]+?)<\/script>/);
if (nextMatch) {
    const data = JSON.parse(nextMatch[1]);
    let found = 0;
    
    function findImages(obj) {
        if (found >= 3) return;
        if (Array.isArray(obj)) {
            obj.forEach(item => findImages(item));
        } else if (obj && typeof obj === 'object') {
            if (obj.images && Array.isArray(obj.images)) {
                console.log(`JSON Image ${found + 1}: ${obj.images[0]}`);
                found++;
            }
            for (let k in obj) {
                if (k !== 'images') findImages(obj[k]);
            }
        }
    }
    
    findImages(data);
} else {
    console.log('__NEXT_DATA__ not found');
}
