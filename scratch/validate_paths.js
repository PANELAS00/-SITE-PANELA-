const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const relPaths = html.match(/(?:src|href)="(?!\/|http|data:|#|mailto)[^"]+"/g);
console.log('Paths relativos encontrados:', relPaths ? relPaths.length : 0);
if (relPaths) console.log(relPaths.slice(0, 15));
if (relPaths && relPaths.length > 0) {
    process.exit(1);
}
process.exit(0);
