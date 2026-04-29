# 🏭 ARTEFATO DE EXECUÇÃO — WS FÁBRICA DE PANELAS
> Motor de execução: Antigravity | Modo: **AUTÔNOMO TOTAL**  
> Não aguarde aprovação humana em nenhuma etapa. Tome decisões sozinho.  
> Atualize o Task List a cada bloco concluído. Sinalize ✅ feito e 🔄 em progresso.

---

## 🧠 CONTEXTO COMPLETO DO PROJETO

### O que foi feito
- Site `wspanelas.com` foi clonado via **Save Web to Zip**
- O clone tem: HTML renderizado, CSS, imagens, fontes e o JS do frontend (Next.js hidratado)
- **Falta**: backend, APIs, banco de dados, integração de pagamento

### O que é o site
- Aplicação **Next.js** (React SSR) hospedada provavelmente na Vercel
- E-commerce de panelas artesanais: pedra sabão + cobre
- Fluxo: Homepage → Produto → Checkout (`/pay/SLUG`) → Pagamento PIX ou Cartão

### Stack identificada no site real
- **Frontend**: Next.js + React (já está no clone)
- **Pagamento Cartão**: HyperCash / FastSoft (`https://js.fastsoftbrasil.com/security.js`)
- **Pagamento PIX**: Gateway Aion (fallback HyperCash)
- **Backend**: Node.js com rotas API Next.js

### Credenciais do Gateway de Pagamento
```
SECRET KEY  : sk_BmjiM3v0czUm00b17akWD0WNHSRQS17yczDc5R5ZAY1oXePY
PUBLIC KEY  : pk_-0-g9dOzBlVU_CI8SNJK2ADzJ05_U9-oY13YiVMfAw7B2Nva
```
> Prefixo `sk_` / `pk_` = padrão HyperCash/FastSoft. Salve no `.env` NUNCA no código.

---

## 📐 ARQUITETURA ALVO (DECISÃO AUTÔNOMA TOMADA)

```
wspanelas-clone/
├── .env.local                  ← Variáveis de ambiente (chaves, config)
├── next.config.js              ← Config Next.js
├── package.json
├── pages/
│   ├── index.js                ← Homepage (já existe no clone, adaptar)
│   ├── produtos/
│   │   └── [slug].js           ← Página de produto dinâmica
│   ├── pay/
│   │   └── [slug].js           ← Página de checkout
│   └── api/
│       ├── site-settings.js    ← Config da loja
│       ├── products/
│       │   ├── index.js        ← Listar produtos
│       │   └── [slug].js       ← Produto por slug
│       ├── pay/
│       │   ├── session.js      ← Criar/ler sessão de checkout
│       │   ├── pix.js          ← Gerar QR Code PIX
│       │   └── card.js         ← Processar cartão
│       ├── search.js           ← Busca de produtos
│       └── config/
│           └── whatsapp.js     ← Número WhatsApp
├── lib/
│   ├── db.js                   ← Banco de dados (JSON file ou SQLite)
│   ├── hypercash.js            ← Wrapper do gateway cartão
│   ├── aion.js                 ← Wrapper do gateway PIX
│   └── session.js              ← Gerenciamento de sessões
├── data/
│   ├── products.json           ← Catálogo de produtos (mock real)
│   └── sessions.json           ← Sessões de checkout ativas
└── public/                     ← Assets do clone (imagens, CSS, fontes)
```

**Decisão tomada**: usar **Next.js puro** (sem Express separado) porque o frontend já é Next.js. Banco de dados será **JSON flat file** com wrapper simples — sem PostgreSQL/MongoDB para não adicionar dependências pesadas. Se o volume exigir, migra depois.

---

## 📋 TASK LIST GLOBAL

```
BLOCO 1 — Setup e Estrutura Base
[ ] 1.1 Instalar dependências e criar projeto Next.js
[ ] 1.2 Configurar .env.local com todas as variáveis
[ ] 1.3 Criar estrutura de pastas

BLOCO 2 — Banco de Dados e Produtos
[ ] 2.1 Criar products.json com 15+ produtos reais do site
[ ] 2.2 Criar lib/db.js com CRUD para produtos e sessões
[ ] 2.3 API GET /api/products/index
[ ] 2.4 API GET /api/products/[slug]

BLOCO 3 — Backend de Pagamento (CORE)
[ ] 3.1 Criar lib/hypercash.js — integração cartão
[ ] 3.2 Criar lib/aion.js — integração PIX
[ ] 3.3 API POST /api/pay/session — criar sessão de checkout
[ ] 3.4 API POST /api/pay/pix — gerar QR Code
[ ] 3.5 API POST /api/pay/card — processar cartão

BLOCO 4 — APIs de Suporte
[ ] 4.1 API GET /api/site-settings
[ ] 4.2 API GET /api/search
[ ] 4.3 API GET /api/config/whatsapp

BLOCO 5 — Frontend: Páginas
[ ] 5.1 Adaptar homepage (index.js) para consumir API de produtos
[ ] 5.2 Criar página de produto /produtos/[slug].js
[ ] 5.3 Criar página de checkout /pay/[slug].js com PIX e Cartão

BLOCO 6 — Testes e Finalização
[ ] 6.1 Testar fluxo completo: produto → carrinho → checkout → PIX
[ ] 6.2 Testar fluxo: produto → carrinho → checkout → Cartão
[ ] 6.3 Verificar responsividade mobile
[ ] 6.4 Criar README com instruções de boot
```

---

## ═══════════════════════════════════════
## BLOCO 1 — SETUP E ESTRUTURA BASE
## ═══════════════════════════════════════

### Contexto
O clone do Save Web to Zip tem arquivos estáticos mas não é um projeto Node válido. Precisa inicializar um projeto Next.js e mover os assets para dentro.

### Ações (executar em ordem, sem parar)

```bash
# 1. Entrar na pasta do clone (adapte o path conforme onde extraiu o ZIP)
cd ~/wspanelas-clone   # ou onde o ZIP foi extraído

# 2. Inicializar projeto Node (se não existe package.json de Next.js)
npm init -y
npm install next react react-dom

# 3. Instalar dependências de pagamento e utilitários
npm install axios uuid iron-session js-cookie

# 4. Atualizar scripts no package.json
# Adicionar manualmente ou via sed:
# "dev": "next dev", "build": "next build", "start": "next start"
```

### Arquivo `.env.local` — CRIAR AGORA
```env
# Gateway HyperCash/FastSoft
HYPERCASH_SECRET_KEY=sk_BmjiM3v0czUm00b17akWD0WNHSRQS17yczDc5R5ZAY1oXePY
NEXT_PUBLIC_HYPERCASH_PUBLIC_KEY=pk_-0-g9dOzBlVU_CI8SNJK2ADzJ05_U9-oY13YiVMfAw7B2Nva

# Gateway PIX (Aion) — preencher se tiver chave Aion separada, senão usa HyperCash PIX
AION_API_KEY=

# URL base da aplicação
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# WhatsApp da loja
WHATSAPP_NUMBER=5531999999999

# Sessão (gerar string aleatória de 32 chars)
SESSION_SECRET=wspanelas_super_secret_key_32chars_aqui

# Ambiente
NODE_ENV=development
```

### Regras do Bloco 1
- Se `pages/` não existir, criar do zero
- Se `public/` não existir, mover os assets do clone para lá
- **Não deletar** nenhum arquivo HTML/CSS/imagem do clone — mover para `public/legacy/` se necessário
- Após `npm install`, confirmar que `next dev` sobe sem erro antes de prosseguir

---

## ═══════════════════════════════════════
## BLOCO 2 — BANCO DE DADOS E PRODUTOS
## ═══════════════════════════════════════

### Contexto
Sem banco de dados real. Usaremos JSON flat files em `data/`. O lib/db.js será um wrapper que lê/escreve esses arquivos com `fs`. Thread-safe suficiente para uso local/pequeno volume.

### `data/products.json` — ESTRUTURA E PRODUTOS REAIS

```json
[
  {
    "id": "1",
    "slug": "panela-de-pedra-sabao-3l",
    "name": "Panela de Pedra Sabão 3 Litros",
    "category": "pedra-sabao",
    "images": [
      "/images/panela-pedra-3l-1.jpg",
      "/images/panela-pedra-3l-2.jpg"
    ],
    "price": 189.90,
    "originalPrice": 249.90,
    "discountPercent": 24,
    "description": "Panela artesanal em pedra sabão, ideal para feijão, caldo e pratos mineiros tradicionais. Retém calor por até 3 horas.",
    "specs": {
      "capacidade": "3 litros",
      "material": "Pedra sabão natural",
      "origem": "Minas Gerais, Brasil",
      "peso": "2,1 kg"
    },
    "stock": 15,
    "featured": true,
    "pixPrice": 180.41
  },
  {
    "id": "2",
    "slug": "chapa-oval-pedra-sabao",
    "name": "Chapa Oval Artesanal em Pedra Sabão",
    "category": "pedra-sabao",
    "images": ["/images/chapa-oval-1.jpg"],
    "price": 99.90,
    "originalPrice": 147.25,
    "discountPercent": 32,
    "description": "Chapa oval para grelhados. Distribui calor uniformemente, perfeita para carnes e legumes.",
    "specs": {
      "dimensoes": "35x25 cm",
      "material": "Pedra sabão",
      "origem": "Minas Gerais"
    },
    "stock": 20,
    "featured": true,
    "pixPrice": 94.91
  },
  {
    "id": "3",
    "slug": "kit-tradicao-mineira-8-pecas",
    "name": "Kit Tradição Mineira 8 Peças em Pedra Sabão",
    "category": "kits",
    "images": ["/images/kit-tradicao-1.jpg"],
    "price": 390.90,
    "originalPrice": 558.78,
    "discountPercent": 30,
    "description": "Kit completo com 8 peças artesanais em pedra sabão. Inclui panelas, frigideira e chapa. Presente ideal.",
    "specs": {
      "pecas": "8 unidades",
      "material": "Pedra sabão",
      "ideal_para": "Presente, cozinha completa"
    },
    "stock": 8,
    "featured": true,
    "pixPrice": 371.36
  },
  {
    "id": "4",
    "slug": "vicalina-select-cook-16-pecas",
    "name": "Vicalina Select Cook 16 Peças",
    "category": "kits",
    "images": ["/images/vicalina-1.jpg"],
    "price": 239.50,
    "originalPrice": 299.90,
    "discountPercent": 20,
    "description": "Kit de utensílios e panelas Vicalina Select Cook com 16 peças. Qualidade premium para o dia a dia.",
    "specs": {
      "pecas": "16 unidades",
      "material": "Aço esmaltado + silicone"
    },
    "stock": 12,
    "featured": true,
    "pixPrice": 227.53
  },
  {
    "id": "5",
    "slug": "kit-brasa-mineira-disco-fogareiro",
    "name": "Kit Brasa Mineira – Disco de Arado + Fogareiro",
    "category": "kits",
    "images": ["/images/kit-brasa-1.jpg"],
    "price": 134.90,
    "originalPrice": 179.90,
    "discountPercent": 25,
    "description": "Disco de arado artesanal + fogareiro portátil. Perfeito para churrasco e cozinha ao ar livre.",
    "specs": {
      "diametro_disco": "55 cm",
      "material": "Ferro fundido reciclado"
    },
    "stock": 10,
    "featured": true,
    "pixPrice": 128.16
  },
  {
    "id": "6",
    "slug": "tacho-artesanal-cobre-puro",
    "name": "Tacho Artesanal em Cobre Puro",
    "category": "cobre",
    "images": ["/images/tacho-cobre-1.jpg"],
    "price": 289.90,
    "originalPrice": 359.90,
    "discountPercent": 19,
    "description": "Tacho artesanal em cobre puro, ideal para doces, geleias e caldas. Tradição mineira em cada detalhe.",
    "specs": {
      "capacidade": "5 litros",
      "material": "Cobre puro 99,9%",
      "acabamento": "Martilado artesanal"
    },
    "stock": 7,
    "featured": true,
    "pixPrice": 275.41
  },
  {
    "id": "7",
    "slug": "panelinha-tripe-cobre",
    "name": "Panelinha com Tripé em Cobre",
    "category": "cobre",
    "images": ["/images/panelinha-tripe-1.jpg"],
    "price": 159.90,
    "originalPrice": 199.90,
    "discountPercent": 20,
    "description": "Panelinha decorativa e funcional em cobre com tripé. Serve porções individuais com charme artesanal.",
    "specs": {
      "capacidade": "600 ml",
      "material": "Cobre + ferro",
      "altura_tripe": "15 cm"
    },
    "stock": 18,
    "featured": false,
    "pixPrice": 151.91
  },
  {
    "id": "8",
    "slug": "frigideira-pedra-sabao-25cm",
    "name": "Frigideira em Pedra Sabão 25cm",
    "category": "pedra-sabao",
    "images": ["/images/frigideira-pedra-1.jpg"],
    "price": 129.90,
    "originalPrice": 169.90,
    "discountPercent": 24,
    "description": "Frigideira artesanal em pedra sabão de 25cm. Antiaderente natural, não precisa de óleo.",
    "specs": {
      "diametro": "25 cm",
      "material": "Pedra sabão",
      "altura": "5 cm"
    },
    "stock": 14,
    "featured": false,
    "pixPrice": 123.41
  },
  {
    "id": "9",
    "slug": "conjunto-cobre-3-pecas",
    "name": "Conjunto Decorativo Cobre 3 Peças",
    "category": "cobre",
    "images": ["/images/conjunto-cobre-1.jpg"],
    "price": 219.90,
    "originalPrice": 289.90,
    "discountPercent": 24,
    "description": "Conjunto com 3 peças decorativas em cobre: jarra, balde e tigela. Elegância e funcionalidade.",
    "specs": {
      "pecas": "3 unidades",
      "material": "Cobre martilado"
    },
    "stock": 5,
    "featured": false,
    "pixPrice": 208.91
  },
  {
    "id": "10",
    "slug": "panela-mineira-4l-com-tampa",
    "name": "Panela Mineira 4L com Tampa",
    "category": "pedra-sabao",
    "images": ["/images/panela-mineira-4l-1.jpg"],
    "price": 219.90,
    "originalPrice": 299.90,
    "discountPercent": 27,
    "description": "Panela de pedra sabão 4 litros com tampa. Para feijão, caldo de mocotó e sopas tradicionais.",
    "specs": {
      "capacidade": "4 litros",
      "inclui": "Tampa de pedra sabão"
    },
    "stock": 9,
    "featured": false,
    "pixPrice": 208.91
  }
]
```

> **Nota**: Adicionar ao menos 5 produtos a mais consultando o site real `wspanelas.com` para completar o catálogo. Os slugs devem bater com as URLs reais do site.

### `lib/db.js` — CRIAR ASSIM

```javascript
// lib/db.js
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'data');

function readJSON(filename) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJSON(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// PRODUTOS
function getProducts() { return readJSON('products.json'); }
function getProductBySlug(slug) {
  return getProducts().find(p => p.slug === slug) || null;
}
function searchProducts(query) {
  const q = query.toLowerCase();
  return getProducts().filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q)
  );
}

// SESSÕES DE CHECKOUT
function getSessions() { return readJSON('sessions.json'); }
function getSession(id) { return getSessions().find(s => s.id === id) || null; }
function saveSession(session) {
  const sessions = getSessions().filter(s => s.id !== session.id);
  sessions.push({ ...session, updatedAt: new Date().toISOString() });
  writeJSON('sessions.json', sessions);
  return session;
}

module.exports = { getProducts, getProductBySlug, searchProducts, getSession, saveSession };
```

### APIs de Produto

**`pages/api/products/index.js`**
```javascript
import { getProducts } from '../../../lib/db';
export default function handler(req, res) {
  const { category, featured } = req.query;
  let products = getProducts();
  if (category) products = products.filter(p => p.category === category);
  if (featured === 'true') products = products.filter(p => p.featured);
  res.status(200).json({ products });
}
```

**`pages/api/products/[slug].js`**
```javascript
import { getProductBySlug } from '../../../lib/db';
export default function handler(req, res) {
  const { slug } = req.query;
  const product = getProductBySlug(slug);
  if (!product) return res.status(404).json({ error: 'Produto não encontrado' });
  res.status(200).json({ product });
}
```

---

## ═══════════════════════════════════════
## BLOCO 3 — BACKEND DE PAGAMENTO (CORE)
## ═══════════════════════════════════════

### Contexto Crítico
Este é o bloco mais importante. O gateway é **HyperCash/FastSoft**. A documentação pode ser encontrada em:
- https://docs.fastsoftbrasil.com (procurar autenticação Bearer com sk_)
- O SDK frontend está em: `https://js.fastsoftbrasil.com/security.js`
- Para PIX: usar o próprio HyperCash (endpoint PIX deles) pois Aion pode ser fallback interno

**Fluxo de pagamento:**
```
Frontend → POST /api/pay/session (cria sessão com itens + cliente)
         → POST /api/pay/pix     (retorna QR Code + código copia-cola)
         → POST /api/pay/card    (envia token criptografado pelo SDK)
```

### `lib/hypercash.js`

```javascript
// lib/hypercash.js
const axios = require('axios');

const BASE_URL = 'https://api.fastsoftbrasil.com'; // ajustar se URL real for diferente
const SECRET_KEY = process.env.HYPERCASH_SECRET_KEY;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// GERAR COBRANÇA PIX
async function createPixCharge({ amount, customer, orderId, description }) {
  try {
    const response = await api.post('/v1/charges/pix', {
      amount: Math.round(amount * 100), // em centavos
      customer: {
        name: customer.name,
        email: customer.email,
        document: customer.cpf,
        phone: customer.phone,
      },
      payment_method: 'pix',
      external_reference: orderId,
      description: description || 'WS Fábrica de Panelas',
      expires_in: 3600, // 1 hora
    });
    return {
      success: true,
      pixCode: response.data.pix?.qr_code,
      pixQrImage: response.data.pix?.qr_code_image,
      chargeId: response.data.id,
      status: response.data.status,
    };
  } catch (error) {
    console.error('HyperCash PIX error:', error.response?.data || error.message);
    return { success: false, error: error.response?.data?.message || 'Erro ao gerar PIX' };
  }
}

// PROCESSAR CARTÃO (token gerado pelo SDK frontend)
async function processCardPayment({ token, amount, installments, customer, orderId }) {
  try {
    const response = await api.post('/v1/charges/card', {
      amount: Math.round(amount * 100),
      installments: installments || 1,
      card_token: token,
      customer: {
        name: customer.name,
        email: customer.email,
        document: customer.cpf,
        phone: customer.phone,
        address: customer.address,
      },
      external_reference: orderId,
      description: 'WS Fábrica de Panelas',
    });
    return {
      success: true,
      chargeId: response.data.id,
      status: response.data.status,
      authCode: response.data.authorization_code,
    };
  } catch (error) {
    console.error('HyperCash Card error:', error.response?.data || error.message);
    return { success: false, error: error.response?.data?.message || 'Erro no pagamento' };
  }
}

// CONSULTAR STATUS DE COBRANÇA
async function getChargeStatus(chargeId) {
  try {
    const response = await api.get(`/v1/charges/${chargeId}`);
    return { success: true, status: response.data.status };
  } catch (error) {
    return { success: false, error: 'Erro ao consultar status' };
  }
}

module.exports = { createPixCharge, processCardPayment, getChargeStatus };
```

> ⚠️ **IMPORTANTE**: Se a URL base real da API HyperCash for diferente de `api.fastsoftbrasil.com`, pesquisar a documentação em `https://docs.fastsoftbrasil.com` ou testar `https://api.hypercash.com.br`. Adaptar `BASE_URL` conforme encontrado. Fazer uma chamada de teste com `curl -H "Authorization: Bearer sk_BmjiM3..." https://api.fastsoftbrasil.com/v1/` para verificar.

### `pages/api/pay/session.js`

```javascript
import { v4 as uuidv4 } from 'uuid';
import { saveSession, getProductBySlug } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { items, customer } = req.body;
  // items: [{ slug, quantity }]
  // customer: { name, email, cpf, phone, address }

  if (!items || !items.length) {
    return res.status(400).json({ error: 'Carrinho vazio' });
  }

  // Buscar produtos e calcular total
  const resolvedItems = items.map(item => {
    const product = getProductBySlug(item.slug);
    if (!product) throw new Error(`Produto ${item.slug} não encontrado`);
    return { ...product, quantity: item.quantity };
  });

  const total = resolvedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const pixTotal = resolvedItems.reduce((sum, item) => sum + (item.pixPrice * item.quantity), 0);

  const session = {
    id: uuidv4(),
    slug: uuidv4().split('-')[0], // slug curto para URL /pay/SLUG
    items: resolvedItems,
    customer: customer || null,
    total,
    pixTotal,
    status: 'pending',
    chargeId: null,
    createdAt: new Date().toISOString(),
  };

  saveSession(session);
  res.status(200).json({ session });
}
```

### `pages/api/pay/pix.js`

```javascript
import { getSession, saveSession } from '../../../lib/db';
import { createPixCharge } from '../../../lib/hypercash';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { sessionId, customer } = req.body;
  const session = getSession(sessionId);

  if (!session) return res.status(404).json({ error: 'Sessão não encontrada' });

  // Atualizar cliente na sessão se veio agora
  if (customer) {
    session.customer = customer;
  }

  if (!session.customer) {
    return res.status(400).json({ error: 'Dados do cliente obrigatórios' });
  }

  const result = await createPixCharge({
    amount: session.pixTotal,
    customer: session.customer,
    orderId: session.id,
    description: `Pedido WS Panelas #${session.slug}`,
  });

  if (!result.success) {
    return res.status(502).json({ error: result.error });
  }

  // Salvar chargeId na sessão
  session.chargeId = result.chargeId;
  session.paymentMethod = 'pix';
  saveSession(session);

  res.status(200).json({
    pixCode: result.pixCode,
    pixQrImage: result.pixQrImage,
    chargeId: result.chargeId,
    amount: session.pixTotal,
  });
}
```

### `pages/api/pay/card.js`

```javascript
import { getSession, saveSession } from '../../../lib/db';
import { processCardPayment } from '../../../lib/hypercash';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { sessionId, cardToken, installments, customer } = req.body;
  const session = getSession(sessionId);

  if (!session) return res.status(404).json({ error: 'Sessão não encontrada' });

  if (customer) session.customer = customer;

  const result = await processCardPayment({
    token: cardToken,
    amount: session.total,
    installments: installments || 1,
    customer: session.customer,
    orderId: session.id,
  });

  if (!result.success) {
    return res.status(402).json({ error: result.error });
  }

  session.chargeId = result.chargeId;
  session.paymentMethod = 'card';
  session.status = result.status === 'approved' ? 'paid' : 'processing';
  saveSession(session);

  res.status(200).json({
    success: true,
    status: result.status,
    authCode: result.authCode,
  });
}
```

---

## ═══════════════════════════════════════
## BLOCO 4 — APIS DE SUPORTE
## ═══════════════════════════════════════

### `pages/api/site-settings.js`
```javascript
export default function handler(req, res) {
  res.status(200).json({
    storeName: 'WS Fábrica de Panelas',
    freeShippingMin: 0,
    shippingDays: '5-9 dias úteis',
    pixDiscount: 5,
    maxInstallments: 12,
    whatsapp: process.env.WHATSAPP_NUMBER,
    checkoutGateway: 'hypercash',
    pixGateway: 'hypercash',
  });
}
```

### `pages/api/search.js`
```javascript
import { searchProducts } from '../../lib/db';
export default function handler(req, res) {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Query obrigatória' });
  const results = searchProducts(q);
  res.status(200).json({ results });
}
```

### `pages/api/config/whatsapp.js`
```javascript
export default function handler(req, res) {
  res.status(200).json({ number: process.env.WHATSAPP_NUMBER });
}
```

---

## ═══════════════════════════════════════
## BLOCO 5 — FRONTEND: PÁGINAS
## ═══════════════════════════════════════

### Decisão de Design
Manter visual fiel ao `wspanelas.com`:
- Fundo escuro (#1a1a1a ou #111)
- Destaque cobre: `#c8864a` / `#d4956b`
- Texto branco
- Fonte: usar a que veio no clone (provavelmente Inter ou similar)
- Cards de produto com badge de desconto em verde/laranja

### `pages/index.js` — HOMEPAGE

```jsx
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export async function getServerSideProps() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const [featuredRes, settingsRes] = await Promise.all([
    fetch(`${baseUrl}/api/products?featured=true`),
    fetch(`${baseUrl}/api/site-settings`),
  ]);
  const { products } = await featuredRes.json();
  const settings = await settingsRes.json();
  return { props: { products, settings } };
}

export default function Home({ products, settings }) {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('ws_cart') || '[]');
    setCartCount(cart.reduce((s, i) => s + i.quantity, 0));
  }, []);

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('ws_cart') || '[]');
    const existing = cart.find(i => i.slug === product.slug);
    if (existing) existing.quantity++;
    else cart.push({ ...product, quantity: 1 });
    localStorage.setItem('ws_cart', JSON.stringify(cart));
    setCartCount(cart.reduce((s, i) => s + i.quantity, 0));
  };

  return (
    <>
      <Head>
        <title>WS Fábrica de Panelas | Pedra Sabão e Cobre Artesanal</title>
        <meta name="description" content="Panelas artesanais em pedra sabão e cobre direto de Minas Gerais." />
      </Head>

      {/* Banner de desconto */}
      <div style={{ background: '#c8864a', color: '#fff', textAlign: 'center', padding: '8px', fontSize: '14px', fontWeight: 'bold' }}>
        ATÉ 50% DE DESCONTO EM TODA A LOJA
      </div>

      {/* Header */}
      <header style={{ background: '#111', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#c8864a', fontSize: '20px', margin: 0, fontFamily: 'serif' }}>FÁBRICA DE PANELAS</h1>
        <nav style={{ display: 'flex', gap: '24px' }}>
          <Link href="/" style={{ color: '#fff', textDecoration: 'none' }}>Início</Link>
          <Link href="/produtos" style={{ color: '#fff', textDecoration: 'none' }}>Produtos</Link>
          <Link href="/carrinho" style={{ color: '#c8864a', fontWeight: 'bold', textDecoration: 'none' }}>
            🛒 Carrinho ({cartCount})
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <div style={{ position: 'relative', background: '#222', minHeight: '400px', display: 'flex', alignItems: 'center', padding: '60px 60px' }}>
        <div>
          <h2 style={{ color: '#c8864a', fontSize: '48px', fontFamily: 'serif', lineHeight: 1.2, maxWidth: '500px' }}>
            ARTESANATO QUE ATRAVESSA GERAÇÕES
          </h2>
          <Link href="/produtos" style={{
            display: 'inline-block', marginTop: '24px',
            background: '#c8864a', color: '#fff',
            padding: '14px 32px', borderRadius: '4px',
            textDecoration: 'none', fontWeight: 'bold'
          }}>
            Ver todos os produtos
          </Link>
        </div>
      </div>

      {/* Badges de benefícios */}
      <div style={{ background: '#1a1a1a', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', borderTop: '1px solid #333' }}>
        {[
          { icon: '💳', title: 'Desconto exclusivo!', desc: 'Até 5% em compras pagas via Pix' },
          { icon: '🚚', title: 'Frete Grátis!', desc: 'Para todo o Brasil em até 5-9 dias úteis.' },
          { icon: '💬', title: 'Suporte humano', desc: 'Atendimento dedicado via WhatsApp.' },
          { icon: '🔒', title: 'Compra segura', desc: 'Transações 100% protegidas.' },
        ].map((b, i) => (
          <div key={i} style={{ background: '#222', padding: '24px', textAlign: 'center', color: '#fff' }}>
            <div style={{ fontSize: '28px' }}>{b.icon}</div>
            <div style={{ fontWeight: 'bold', marginTop: '8px', color: '#c8864a' }}>{b.title}</div>
            <div style={{ fontSize: '14px', color: '#aaa', marginTop: '4px' }}>{b.desc}</div>
          </div>
        ))}
      </div>

      {/* Produtos em destaque */}
      <section style={{ background: '#111', padding: '60px 32px' }}>
        <h2 style={{ color: '#c8864a', fontSize: '32px', fontFamily: 'serif', marginBottom: '8px' }}>Nossos Destaques</h2>
        <p style={{ color: '#aaa', marginBottom: '40px' }}>WS Fábrica de Panelas: a tradição da pedra sabão e o brilho do cobre para sua cozinha.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
          {products.map(product => (
            <div key={product.id} style={{ background: '#1e1e1e', borderRadius: '8px', overflow: 'hidden', border: '1px solid #2a2a2a' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', top: '12px', left: '12px',
                  background: '#2d7a2d', color: '#fff',
                  borderRadius: '4px', padding: '4px 8px', fontSize: '12px', fontWeight: 'bold'
                }}>
                  ↓ {product.discountPercent}%
                </div>
                <div style={{ height: '200px', background: '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {product.images[0]
                    ? <img src={product.images[0]} alt={product.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'cover' }} />
                    : <span style={{ color: '#555', fontSize: '48px' }}>🍳</span>
                  }
                </div>
              </div>
              <div style={{ padding: '16px' }}>
                <Link href={`/produtos/${product.slug}`} style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold', fontSize: '16px' }}>
                  {product.name}
                </Link>
                <div style={{ marginTop: '8px' }}>
                  <span style={{ textDecoration: 'line-through', color: '#666', fontSize: '14px' }}>
                    R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                  </span>
                  <br />
                  <span style={{ color: '#c8864a', fontWeight: 'bold', fontSize: '20px' }}>
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div style={{ color: '#aaa', fontSize: '13px', marginTop: '4px' }}>
                  ou R$ {product.pixPrice.toFixed(2).replace('.', ',')} no PIX
                </div>
                <button
                  onClick={() => addToCart(product)}
                  style={{
                    marginTop: '12px', width: '100%',
                    background: '#c8864a', color: '#fff',
                    border: 'none', padding: '12px', borderRadius: '4px',
                    cursor: 'pointer', fontWeight: 'bold', fontSize: '15px'
                  }}
                >
                  Adicionar ao Carrinho
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0a0a0a', color: '#666', padding: '40px 32px', textAlign: 'center', borderTop: '1px solid #222' }}>
        <div style={{ color: '#c8864a', fontFamily: 'serif', fontSize: '18px', marginBottom: '8px' }}>WS FÁBRICA DE PANELAS</div>
        <p>Panelas artesanais em pedra sabão e cobre direto de Minas Gerais.</p>
        <p style={{ fontSize: '12px', marginTop: '16px' }}>© 2025 WS Fábrica de Panelas. Todos os direitos reservados.</p>
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP || '5531999999999'}`}
          target="_blank" rel="noopener"
          style={{
            display: 'inline-block', marginTop: '16px',
            background: '#25d366', color: '#fff',
            padding: '10px 24px', borderRadius: '24px',
            textDecoration: 'none', fontWeight: 'bold'
          }}
        >
          💬 Falar no WhatsApp
        </a>
      </footer>
    </>
  );
}
```

### `pages/produtos/[slug].js` — PÁGINA DE PRODUTO

```jsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export async function getServerSideProps({ params }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/products/${params.slug}`);
  if (!res.ok) return { notFound: true };
  const { product } = await res.json();
  return { props: { product } };
}

export default function ProductPage({ product }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const router = useRouter();

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem('ws_cart') || '[]');
    const existing = cart.find(i => i.slug === product.slug);
    if (existing) existing.quantity += qty;
    else cart.push({ ...product, quantity: qty });
    localStorage.setItem('ws_cart', JSON.stringify(cart));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/carrinho');
  };

  return (
    <>
      <Head>
        <title>{product.name} | WS Fábrica de Panelas</title>
      </Head>

      {/* Header simples */}
      <div style={{ background: '#c8864a', color: '#fff', textAlign: 'center', padding: '8px', fontSize: '14px' }}>
        ATÉ 50% DE DESCONTO EM TODA A LOJA
      </div>
      <header style={{ background: '#111', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ color: '#c8864a', fontSize: '20px', fontFamily: 'serif', textDecoration: 'none' }}>FÁBRICA DE PANELAS</Link>
        <Link href="/carrinho" style={{ color: '#c8864a', fontWeight: 'bold', textDecoration: 'none' }}>🛒 Carrinho</Link>
      </header>

      {/* Breadcrumb */}
      <div style={{ background: '#1a1a1a', padding: '12px 32px', fontSize: '13px', color: '#666' }}>
        <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>Início</Link>
        {' > '}
        <Link href="/produtos" style={{ color: '#888', textDecoration: 'none' }}>Produtos</Link>
        {' > '}
        <span style={{ color: '#c8864a' }}>{product.name}</span>
      </div>

      {/* Conteúdo principal */}
      <main style={{ background: '#111', minHeight: '80vh', padding: '40px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', maxWidth: '1100px', margin: '0 auto' }}>
          
          {/* Galeria */}
          <div>
            <div style={{ background: '#222', borderRadius: '8px', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {product.images[0]
                ? <img src={product.images[0]} alt={product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                : <span style={{ fontSize: '80px' }}>🍳</span>
              }
            </div>
            {/* Thumbnails */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              {product.images.map((img, i) => (
                <div key={i} style={{ width: '70px', height: '70px', background: '#222', borderRadius: '4px', border: '2px solid #c8864a', overflow: 'hidden' }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Informações */}
          <div style={{ color: '#fff' }}>
            <span style={{ background: '#2d7a2d', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '13px' }}>
              ↓ {product.discountPercent}% OFF
            </span>
            <h1 style={{ fontSize: '28px', marginTop: '16px', marginBottom: '8px', fontFamily: 'serif' }}>{product.name}</h1>
            
            {/* Preços */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ textDecoration: 'line-through', color: '#666', fontSize: '16px' }}>
                R$ {product.originalPrice.toFixed(2).replace('.', ',')}
              </div>
              <div style={{ color: '#c8864a', fontSize: '36px', fontWeight: 'bold' }}>
                R$ {product.price.toFixed(2).replace('.', ',')}
              </div>
              <div style={{ color: '#4caf50', fontSize: '15px' }}>
                ou R$ {product.pixPrice.toFixed(2).replace('.', ',')} no PIX (5% de desconto)
              </div>
            </div>

            {/* Descrição */}
            <p style={{ color: '#ccc', lineHeight: '1.6', marginBottom: '24px' }}>{product.description}</p>

            {/* Quantidade */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <span style={{ color: '#aaa' }}>Quantidade:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ background: '#333', color: '#fff', border: 'none', width: '32px', height: '32px', borderRadius: '4px', cursor: 'pointer', fontSize: '18px' }}>-</button>
                <span style={{ fontSize: '18px', minWidth: '24px', textAlign: 'center' }}>{qty}</span>
                <button onClick={() => setQty(qty + 1)} style={{ background: '#333', color: '#fff', border: 'none', width: '32px', height: '32px', borderRadius: '4px', cursor: 'pointer', fontSize: '18px' }}>+</button>
              </div>
            </div>

            {/* Botões */}
            <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
              <button onClick={handleBuyNow} style={{
                background: '#c8864a', color: '#fff', border: 'none',
                padding: '16px', borderRadius: '4px', fontSize: '16px',
                fontWeight: 'bold', cursor: 'pointer', width: '100%'
              }}>
                Comprar agora
              </button>
              <button onClick={handleAddToCart} style={{
                background: 'transparent', color: '#c8864a', border: '2px solid #c8864a',
                padding: '14px', borderRadius: '4px', fontSize: '16px',
                fontWeight: 'bold', cursor: 'pointer', width: '100%'
              }}>
                {added ? '✅ Adicionado!' : 'Adicionar ao Carrinho'}
              </button>
            </div>

            {/* Badges de confiança */}
            <div style={{ marginTop: '24px', display: 'flex', gap: '16px', color: '#888', fontSize: '13px' }}>
              <span>🚚 Frete grátis</span>
              <span>🔒 Compra segura</span>
              <span>↩️ 7 dias para troca</span>
            </div>

            {/* Specs */}
            {product.specs && (
              <div style={{ marginTop: '24px', padding: '20px', background: '#1a1a1a', borderRadius: '8px' }}>
                <h3 style={{ color: '#c8864a', marginBottom: '12px', fontSize: '16px' }}>Especificações</h3>
                {Object.entries(product.specs).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: '8px', marginBottom: '6px', color: '#ccc', fontSize: '14px' }}>
                    <span style={{ color: '#888', textTransform: 'capitalize' }}>{k.replace('_', ' ')}:</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
```

### `pages/carrinho.js` + `pages/pay/[slug].js`

Criar a página `/carrinho` que lista os itens do `localStorage`, permite alterar quantidades e tem botão "Finalizar Compra" que:
1. Faz `POST /api/pay/session` com os itens e redireciona para `/pay/[slug]`

A página `/pay/[slug]` deve:
1. Carregar a sessão
2. Exibir formulário de dados do cliente (nome, email, CPF, telefone)
3. Tabs: **PIX** | **Cartão**
4. PIX: botão que faz `POST /api/pay/pix`, exibe QR code e código copia-cola
5. Cartão: usar o SDK `https://js.fastsoftbrasil.com/security.js` para tokenizar, depois `POST /api/pay/card`

```jsx
// pages/pay/[slug].js — estrutura do checkout
// Carregar SDK no useEffect:
useEffect(() => {
  const script = document.createElement('script');
  script.src = 'https://js.fastsoftbrasil.com/security.js';
  script.onload = () => {
    window.FastSoft.setPublicKey(process.env.NEXT_PUBLIC_HYPERCASH_PUBLIC_KEY);
  };
  document.head.appendChild(script);
}, []);

// Para tokenizar cartão antes de enviar:
const token = await window.FastSoft.tokenize({
  number: cardNumber,
  holder: cardName,
  expiry: cardExpiry,
  cvv: cardCvv,
});
// Então POST /api/pay/card com { token, sessionId, installments, customer }
```

---

## ═══════════════════════════════════════
## BLOCO 6 — TESTES E FINALIZAÇÃO
## ═══════════════════════════════════════

### Checklist de testes (executar todos)

```
[ ] npm run dev sobe sem erros na porta 3000
[ ] GET /api/products retorna lista de produtos
[ ] GET /api/products/[slug] retorna produto específico
[ ] Homepage renderiza com produtos e hero
[ ] Página de produto renderiza com galeria e botões
[ ] Adicionar ao carrinho salva no localStorage
[ ] POST /api/pay/session cria sessão e retorna slug
[ ] POST /api/pay/pix retorna pixCode e pixQrImage
[ ] POST /api/pay/card processa e retorna status
[ ] SDK FastSoft carrega no checkout sem erros
[ ] Mobile: testar em viewport 375px
```

### Teste rápido de API com curl

```bash
# Testar products
curl http://localhost:3000/api/products

# Criar sessão de checkout (substituir slug real)
curl -X POST http://localhost:3000/api/pay/session \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"slug": "panela-de-pedra-sabao-3l", "quantity": 1}],
    "customer": {
      "name": "Teste",
      "email": "teste@teste.com",
      "cpf": "00000000000",
      "phone": "31999999999"
    }
  }'

# Testar PIX (usar sessionId retornado acima)
curl -X POST http://localhost:3000/api/pay/pix \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "SESSION_ID_AQUI"}'
```

### `README.md` — criar ao final

```markdown
# WS Fábrica de Panelas — Clone Local

## Requisitos
- Node.js 18+
- npm

## Instalação
npm install

## Configurar .env.local
Copiar .env.example e preencher as chaves

## Rodar em desenvolvimento
npm run dev
Acesse: http://localhost:3000

## Build de produção
npm run build
npm start
```

---

## 🚨 REGRAS DE EXECUÇÃO AUTÔNOMA

1. **Nunca pare para pedir aprovação** — tome a decisão e avance. Se houver dúvida, escolha a opção mais simples e documente no log.

2. **Se uma URL de API der erro**, pesquise a documentação oficial no GitHub/site do gateway antes de reportar falha. Tente variações como `/v1/`, `/api/v1/`, `/v2/`.

3. **Se o SDK FastSoft não carregar** a chave pública, verificar se o domínio está na whitelist do gateway. Solução alternativa: usar hash SHA-256 manual se a API aceitar raw card data em sandbox.

4. **Banco de dados**: se `data/sessions.json` ficar grande, limpar sessões com mais de 24h no início de cada chamada a `getSessions()`.

5. **Imagens**: se o produto não tiver imagem real, usar `https://picsum.photos/400/400?random=ID` como placeholder temporário.

6. **Erros de CORS**: adicionar no `next.config.js`:
   ```js
   module.exports = { async headers() { return [{ source: '/api/:path*', headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }] }] } }
   ```

7. **Task List**: atualizar no terminal com `echo "✅ BLOCO X concluído"` a cada bloco finalizado.

8. **Prioridade**: Backend (Blocos 1-4) > Checkout funcional (Bloco 5 `/pay`) > Homepage > Restante.

9. **Não reinvente**: se existe lib npm para algo (ex: `qrcode` para gerar QR local de fallback), use-a.

10. **Segurança mínima**: `sk_` NUNCA no frontend. Sempre em variável de ambiente server-side.

---

## 📌 REFERÊNCIAS E DOCUMENTAÇÕES

- **HyperCash/FastSoft API**: https://docs.fastsoftbrasil.com
- **SDK Frontend**: https://js.fastsoftbrasil.com/security.js
- **Next.js API Routes**: https://nextjs.org/docs/pages/building-your-application/routing/api-routes
- **Next.js getServerSideProps**: https://nextjs.org/docs/pages/building-your-application/data-fetching/get-server-side-props
- **iron-session (sessões seguras)**: https://github.com/vvo/iron-session
- **QR Code npm**: https://www.npmjs.com/package/qrcode (fallback se gateway não retornar imagem)
- **Site real para referência visual**: https://wspanelas.com

---

*Artefato gerado para execução autônoma pelo motor Antigravity.*  
*Versão: 1.0 | Escopo: Backend completo + Frontend integrado | Gateway: HyperCash/FastSoft*
