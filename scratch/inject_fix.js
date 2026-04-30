const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const injection = `<style>a[href*='wa.me'],a[href*='whatsapp'],[class*='whatsapp'],[id*='whatsapp']{display:none!important;pointer-events:none!important;}</style><script>document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){document.querySelectorAll('a[href]').forEach(function(a){if(a.href&&(a.href.includes('wa.me')||a.href.includes('whatsapp'))){a.style.display='none';}});document.querySelectorAll('*').forEach(function(el){if(!el.children.length&&el.textContent.includes('ATE 50%')){el.textContent=el.textContent.replace(/ATE 50%/g,'ATÉ 50%').replace(/%ATE/g,' • ATÉ');}});},500);});</script>`;
html = html.replace('</head>', injection + '</head>');
fs.writeFileSync('index.html', html);
console.log('Injeção concluída.');
