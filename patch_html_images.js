const fs = require('fs');
const path = require('path');

const files = ['index.html'];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  console.log(`Original size of ${file}: ${content.length}`);

  // 1. Replace Next.js optimizer URLs with raw URLs
  // Pattern: /_next/image?url=%2Fimages%2Fimage_64.jpg&w=256&q=75 -> /images/image_64.jpg
  // We need to be careful with the regex to catch all variants
  content = content.replace(/\/_next\/image\?url=([^&"'> \n]+)(?:&[^"'> \n]*)?/g, (match, url) => {
    const decoded = decodeURIComponent(url);
    // If it's a CDN URL inside the param, clean it too
    if (decoded.includes('cdn.wspanelas.com/images/')) {
        return '/images/' + decoded.split('cdn.wspanelas.com/images/')[1];
    }
    return decoded;
  });

  // 2. Replace direct CDN URLs with local paths
  content = content.replace(/https:\/\/cdn\.wspanelas\.com\/images\//g, '/images/');
  
  // 3. Fix product image paths
  content = content.replace(/\/products\/(image_\d+\.(jpg|webp|png))/g, '/images/$1');

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Patched ${file}. New size: ${content.length}`);
});
