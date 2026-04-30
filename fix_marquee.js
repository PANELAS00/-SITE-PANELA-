const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replaces the marquee text and separator
  content = content.replace(/ATÉ 50% DE DESCONTO EM TODA A LOJA<span class="jsx-78659c567a004c99 topbar-marquee-separator">%<\/span>/g, 'ATÉ 50% DE DESCONTO EM TODA A LOJA<span class="jsx-78659c567a004c99 topbar-marquee-separator"> &nbsp; &bull; &nbsp; </span>');
  content = content.replace(/ATÉ 50% DE DESCONTO EM TODA A LOJA<span class="jsx-78659c567a004c99 topbar-marquee-separator">\|<\/span>/g, 'ATÉ 50% DE DESCONTO EM TODA A LOJA<span class="jsx-78659c567a004c99 topbar-marquee-separator"> &nbsp; &bull; &nbsp; </span>');

  // Also replace any other stray "ATÉ 50% DE DESCONTO EM TODA A LOJA" without the span
  content = content.replace(/ATÉ 50% DE DESCONTO EM TODA A LOJA/g, 'ATÉ 50% DE DESCONTO EM TODA A LOJA');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
}

function traverseDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git') continue;
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDir(fullPath);
    } else if (fullPath.endsWith('.html') || fullPath.endsWith('.js')) {
      replaceInFile(fullPath);
    }
  }
}

traverseDir(__dirname);
