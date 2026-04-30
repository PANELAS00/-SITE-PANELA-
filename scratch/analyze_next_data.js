const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]+?)<\/script>/);
if (match) {
    const data = JSON.parse(match[1]);
    console.log('Build ID:', data.buildId);
    console.log('Page:', data.page);
    
    // Check if products are in props
    const props = data.props?.pageProps;
    if (props) {
        console.log('PageProps keys:', Object.keys(props));
        // Search for images in props recursively
        const images = [];
        const findImages = (obj) => {
            if (!obj || typeof obj !== 'object') return;
            for (const key in obj) {
                if (key === 'image' || key === 'thumbnail' || (typeof obj[key] === 'string' && obj[key].match(/\.(jpg|png|webp|svg)$/i))) {
                    images.push({key, value: obj[key]});
                }
                findImages(obj[key]);
            }
        };
        findImages(props);
        console.log('Images found in props:', images.length);
        console.log(images.slice(0, 20));
    } else {
        console.log('No pageProps found');
    }
} else {
    console.log('__NEXT_DATA__ not found');
}
