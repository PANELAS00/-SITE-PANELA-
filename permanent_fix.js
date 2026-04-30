const fs = require('fs');
const path = require('path');

// 1. Patch products.json permanently
const productsPath = path.join(__dirname, 'data', 'products.json');
if (fs.existsSync(productsPath)) {
    const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    const patched = products.map(p => ({
        ...p,
        badge_config: p.badge_config || { active: false, text: '', type: 'default' }
    }));
    fs.writeFileSync(productsPath, JSON.stringify(patched, null, 2));
    console.log('Patched products.json');
}

// 2. Patch index.html permanently
const indexPath = path.join(__dirname, 'index.html');
if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8');
    // Replace CDN URLs
    html = html.split('https://cdn.wspanelas.com/images/').join('/images/');
    // Replace Next optimizer URLs
    html = html.replace(/\/_next\/image\?url=([^&"'> \n]+)(?:&[^"'> \n]*)?/g, (match, url) => {
        const decoded = decodeURIComponent(url);
        if (decoded.includes('cdn.wspanelas.com/images/')) {
            return '/images/' + decoded.split('cdn.wspanelas.com/images/')[1];
        }
        return decoded;
    });
    fs.writeFileSync(indexPath, html);
    console.log('Patched index.html');
}
