const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Proteção: não injeta duas vezes
if (html.includes('ws-panelas-fixes')) {
  console.log('Injeção já presente. Nenhuma alteração feita.');
  process.exit(0);
}

const injection = `
<!-- ws-panelas-fixes -->
<style>
  /* Oculta botão flutuante e qualquer link de WhatsApp */
  a[href*='wa.me'],
  a[href*='whatsapp.com'],
  a[href*='api.whatsapp'],
  .whatsapp-float,
  .wpp-button,
  [class*='whatsapp'],
  [id*='whatsapp'] {
    display: none !important;
    pointer-events: none !important;
    visibility: hidden !important;
  }
</style>
<script>
  // Aguarda hidratação do React (800ms) antes de manipular o DOM
  // para não interferir com o processo de hydration
  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {

      // Oculta qualquer link de WhatsApp que o React tenha renderizado
      document.querySelectorAll('a[href]').forEach(function (a) {
        if (a.href && (a.href.includes('wa.me') || a.href.includes('whatsapp'))) {
          a.style.cssText = 'display:none!important;pointer-events:none!important';
        }
      });

      // Corrige o texto do marquee: remove % solto, adiciona acento em ATÉ
      document.querySelectorAll('*').forEach(function (el) {
        if (el.children.length === 0 && el.textContent) {
          var t = el.textContent;
          if (t.includes('ATE 50%') || t.includes('%ATE')) {
            el.textContent = t
              .replace(/ATE 50%/g, 'AT\u00C9 50%')   // ATE → ATÉ
              .replace(/%ATE/g, ' \u2022 AT\u00C9');  // %ATE → • ATÉ
          }
        }
      });

    }, 800);
  });
</script>`;

html = html.replace('</head>', injection + '\n</head>');
fs.writeFileSync('index.html', html);
console.log('Injeção concluída com sucesso.');
