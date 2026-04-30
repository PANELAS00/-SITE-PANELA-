const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const srcs = html.match(/src="[^"]+"/g) || [];
const uniqueSrcs = [...new Set(srcs)];
console.log('Unique srcs found:', uniqueSrcs.length);
console.log(uniqueSrcs.slice(0, 50));
