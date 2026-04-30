const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]+?)<\/script>/);
if (match) {
    fs.writeFileSync('scratch/next_data.json', match[1]);
    console.log('Success');
} else {
    console.log('Fail');
}
