require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const db = require('./lib/db');
const gateway = require('./lib/gateway');

const app = express();
const PORT = process.env.PORT || 3000;
const BUILD_ID = 'iobITvSU-zXAZFV2O5LtN';

// Middleware
app.use(express.json());

const rateLimit = require('express-rate-limit');

// Task 2: Rate limiting
// Static assets are excluded to avoid 429 errors during normal page load
const STATIC_EXTENSIONS = /\.(js|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot|map)$/i;
const STATIC_PATHS = /^\/(css|js|fonts|images|_next)\//;

const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // Higher limit to allow full SPA page loads
  skip: (req) => STATIC_EXTENSIONS.test(req.path) || STATIC_PATHS.test(req.path),
  message: { error: 'Too many requests', message: 'Too many requests from this IP, please try again after a minute' }
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per window on API routes
  message: { error: 'Too many requests', message: 'Too many API requests from this IP, please try again after a minute' }
});

app.use(generalLimiter);
app.use('/api/', apiLimiter);

// Task 3: Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=()');
  res.setHeader('Content-Security-Policy', "default-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://www.facebook.com; img-src 'self' cdn.wspanelas.com https: data:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://connect.facebook.net; style-src 'self' 'unsafe-inline';");
  next();
});

// Task 4: API origin validation
app.use('/api/', (req, res, next) => {
  const allowedOrigin = 'https://wspanelas.com';
  const origin = req.get('Origin');
  const referer = req.get('Referer');

  // Skip validation for simple GET requests if necessary, but user said "all /api/ routes"
  // In development, we might want to allow localhost.
  const isLocal = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
  
  if (isLocal || origin === allowedOrigin || (referer && referer.startsWith(allowedOrigin))) {
    return next();
  }

  res.status(403).json({ error: 'Forbidden', message: 'API access only allowed from wspanelas.com' });
});

// ============================================================
// SITE SETTINGS (captured from live site)
// ============================================================
const SITE_SETTINGS = {
  business_info: { cnpj: "11.118.555/0001-59", address: "Rua Rio de Janeiro 105, Vila Alegre (Cachoeira do Campo), Ouro Preto/MG - 35410-060", email: "contato@wspanelas.com", phone: "573118656289", store_name: "WS Fábrica de Panelas" },
  social_links: { instagram: "https://www.instagram.com/wsfabrica", facebook: "", tiktok: "", youtube: "" },
  google_ads: { conversion_id: "AW-18117427068", conversion_label: "ZosJCK6QzKQcEPz-h79D" },
  utmify: { pixel_id: "69e98e9c5b687c6d7ad136ed" },
  whatsapp: { primary_number: "573118656289", formatted: "+57 311 865 6289", secondary_number: null },
  meta_pixel: { pixel_id: "1463484448890889" },
  shipping: { free_above: 69.9, estimated_days: 9, guarantee_days: 7 },
  payment_installments: { max_installments: 12, interest_rates: [0,21,23,25,27,29,31,33,35,37,39,41], pix_discount_percent: 5 },
  checkout: {
    pix_gateway: { primary: "hypercash", fallback: "hypercash" },
    card_gateway: { primary: "hypercash", fallback: null },
    pix_expiration_minutes: 15,
    standard_shipping_price: 12.79,
    standard_shipping_description: "Entrega em 5-10 dias",
    priority_shipping_price: 74.22,
    priority_shipping_description: "Entrega em 2-4 dias",
    payment_provider_label: "GETNET S.A",
    order_bumps: []
  },
  whatsapp_messages: {
    general_contact: "Oi! Vim pelo site da WS Fábrica de Panelas e queria saber mais sobre os produtos.",
    product_view: "Olá! Estou vendo o produto {{produto}} na WS Fábrica de Panelas e gostaria de saber mais informações.",
    product_buy: "*Olá! Vim da WS Fábrica de Panelas e gostaria de comprar pelo WhatsApp*\n\n*Produto:* {{produto}}\n*{{variante_label}}:* {{variante_valor}}\n*Quantidade:* {{quantidade}}\n*Valor:* {{valor}}\n\n*Link do produto:* {{link}}",
    cart_checkout: "*Olá! Vim da WS Fábrica de Panelas e gostaria de finalizar minha compra:*\n\n{{itens}}\n\n*Total:* {{total}}"
  },
  show_whatsapp_button: true
};

// ============================================================
// STATIC FILE SERVING
// ============================================================
app.use('/_next/static', express.static(path.join(__dirname, '_next', 'static')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/fonts', express.static(path.join(__dirname, 'fonts')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/js', express.static(path.join(__dirname, 'js')));

// SEO Assets
app.get('/robots.txt', (req, res) => res.sendFile(path.join(__dirname, 'robots.txt')));
app.get('/sitemap.xml', (req, res) => res.sendFile(path.join(__dirname, 'sitemap.xml')));

// Proxy product images and _next/image to live site
const axiosImg = require('axios');
app.get('/products/*', async (req, res) => {
  try {
    const response = await axiosImg.get(`https://wspanelas.com${req.originalUrl}`, { responseType: 'stream', timeout: 10000 });
    res.set('Content-Type', response.headers['content-type']);
    res.set('Cache-Control', 'public, max-age=86400');
    response.data.pipe(res);
  } catch { res.status(404).end(); }
});
app.get('/_next/image', async (req, res) => {
  try {
    const response = await axiosImg.get(`https://wspanelas.com${req.originalUrl}`, { responseType: 'stream', timeout: 10000 });
    res.set('Content-Type', response.headers['content-type']);
    res.set('Cache-Control', 'public, max-age=86400');
    response.data.pipe(res);
  } catch { res.status(404).end(); }
});

// Uploads
const uploadsDir = path.join(__dirname, 'uploads', 'receipts');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const upload = multer({ dest: uploadsDir });

// ============================================================
// CONFIG APIs
// ============================================================
app.get('/api/site-settings', (req, res) => res.json(SITE_SETTINGS));

app.get('/api/config/whatsapp', (req, res) => {
  res.json({ success: true, number: SITE_SETTINGS.whatsapp.primary_number });
});

app.get('/api/config/whatsapp-messages', (req, res) => {
  res.json({ success: true, messages: SITE_SETTINGS.whatsapp_messages });
});

// ============================================================
// PRODUCT APIs
// ============================================================
app.get('/api/categories', (req, res) => {
  const products = db.getProducts();
  const cats = [...new Set(products.map(p => p.category))];
  res.json(cats.map(c => ({ slug: c, name: c.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), count: products.filter(p => p.category === c).length })));
});

app.get('/api/search', (req, res) => {
  const q = req.query.q || '';
  if (!q || q.length < 2) return res.json([]);
  const results = db.searchProducts(q);
  res.json(results.map(p => ({
    id: p.id, slug: p.slug, title: p.name, image: p.images[0] || null,
    price: p.price, compare_at_price: p.originalPrice
  })));
});

// ============================================================
// TRACKING STUBS
// ============================================================
app.post('/api/conversions', (req, res) => res.json({ success: true }));
app.post('/api/visitor-tracking', (req, res) => res.json({ success: true }));
app.get('/api/vid-restore', (req, res) => res.json({ utms: {} }));
app.get('/api/telemetry', (req, res) => res.status(200).end());

// ============================================================
// CHECKOUT SESSION APIs
// ============================================================
app.post('/api/checkout', (req, res) => {
  const { items, queryParams } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: 'Carrinho vazio', message: 'Carrinho vazio' });

  // Transform items to session format
  const cartItems = items.map((item, idx) => ({
    id: idx + 1,
    productId: item.productId,
    variantId: item.variantId,
    title: item.title || `Produto ${item.productId}`,
    product_title: item.title || `Produto ${item.productId}`,
    image: item.image || '',
    presentment_price: item.price,
    quantity: item.quantity,
    orderBump: false,
    orderBumpSourceId: null,
    customization: item.customization || null,
    customizationPrice: item.customizationPrice || 0
  }));

  const totalCents = cartItems.reduce((sum, item) => sum + Math.round(item.presentment_price * 100) * item.quantity, 0);
  const session = db.createSession(cartItems, totalCents);
  if (queryParams) {
    session.query_params = queryParams;
    db.saveSession(session);
  }
  console.log(`[Checkout] Session created: /pay/${session.slug}`);
  res.json({ slug: session.slug });
});


app.get('/api/pay/session', (req, res) => {
  const { slug } = req.query;
  const session = db.getSession(slug);
  if (!session) return res.status(404).json({ error: 'Sessão não encontrada' });
  res.json(session);
});

app.patch('/api/pay/session', (req, res) => {
  const { slug, ...updates } = req.body;
  let session = db.getSession(slug);
  if (!session) return res.status(404).json({ error: 'Sessão não encontrada' });

  // Merge updates
  if (updates.personal_info) session.personal_info = { ...session.personal_info, ...updates.personal_info };
  if (updates.address) session.address = { ...session.address, ...updates.address };
  if (updates.selected_shipping !== undefined) session.selected_shipping = updates.selected_shipping;
  if (updates.shipping_cost !== undefined) session.shipping_cost = updates.shipping_cost;
  if (updates.payment_method) session.payment_method = updates.payment_method;
  if (updates.cpf) session.cpf = updates.cpf;
  if (updates.current_step) session.current_step = updates.current_step;
  if (updates.cart_data) session.cart_data = updates.cart_data;
  if (updates.query_params) session.query_params = updates.query_params;
  if (updates.tracking_params) session.tracking_params = updates.tracking_params;
  if (updates.funnel_event) {
    session.payment_data = session.payment_data || {};
    session.payment_data.funnel_events = session.payment_data.funnel_events || [];
    session.payment_data.funnel_events.push(updates.funnel_event);
  }
  if (updates.payment_data) session.payment_data = { ...session.payment_data, ...updates.payment_data };

  session = db.saveSession(session);
  res.json(session);
});

// ============================================================
// PIX PAYMENT
// ============================================================
app.post('/api/pay/pix', async (req, res) => {
  const { slug, cpf } = req.body;
  let session = db.getSession(slug);
  if (!session) return res.status(404).json({ error: 'Sessão não encontrada' });

  // If already has QR code and not expired, reuse
  if (session.payment_data?.qrCode && session.status === 'awaiting_payment') {
    return res.json({ session, reused: true });
  }

  if (cpf) session.cpf = cpf;
  const subtotal = (session.cart_data.items_subtotal_price || 0) / 100;
  const shipping = session.shipping_cost || 0;
  const total = subtotal + shipping;
  const pixDiscount = SITE_SETTINGS.payment_installments.pix_discount_percent / 100;
  const pixAmount = Number((total * (1 - pixDiscount)).toFixed(2));

  const result = await gateway.createPixCharge({
    amount: pixAmount,
    customer: { 
      name: session.personal_info.name, 
      email: session.personal_info.email, 
      cpf: session.cpf, 
      phone: session.personal_info.phone 
    },
    orderId: session.slug,
    items: session.cart_data.items,
    expirationMinutes: SITE_SETTINGS.checkout.pix_expiration_minutes
  });

  if (!result.success) {
    return res.status(502).json({ error: result.error, details: result.details });
  }

  session.status = 'awaiting_payment';
  session.payment_method = 'pix';
  session.payment_data = {
    ...session.payment_data,
    qrCode: result.qrCode,
    amount: pixAmount,
    generatedAt: new Date().toISOString(),
    expiresAt: result.expiresAt,
    method: 'pix',
    gateway: 'hypercash',
    providerLabel: result.providerLabel || SITE_SETTINGS.checkout.payment_provider_label,
    oid: result.chargeId
  };

  session = db.saveSession(session);
  res.json({ session, reused: false });
});

// ============================================================
// CARD PAYMENT
// ============================================================
app.post('/api/pay/card', async (req, res) => {
  const { slug, cardToken, installments, cpf } = req.body;
  let session = db.getSession(slug);
  if (!session) return res.status(404).json({ error: 'Sessão não encontrada' });

  if (cpf) session.cpf = cpf;
  const subtotal = (session.cart_data.items_subtotal_price || 0) / 100;
  const shipping = session.shipping_cost || 0;
  const total = subtotal + shipping;

  session.status = 'card_processing';
  session.payment_method = 'card';
  session.payment_data = { ...session.payment_data, method: 'card', gateway: 'hypercash', cardAttemptStartedAt: new Date().toISOString() };
  db.saveSession(session);

  const result = await gateway.processCardPayment({
    cardToken,
    amount: total,
    installments: installments || 1,
    customer: {
      name: session.personal_info.name, 
      email: session.personal_info.email,
      cpf: session.cpf, 
      phone: session.personal_info.phone,
      address: session.address
    },
    orderId: session.slug,
    items: session.cart_data.items
  });

  if (!result.success) {
    session.status = 'card_failed';
    session.payment_data.cardFailureCategory = result.category || 'processing_error';
    session.payment_data.cardFailureMessage = result.error;
    session = db.saveSession(session);
    return res.status(402).json({ error: result.error, category: result.category, session });
  }

  if (result.approved) {
    session.status = 'paid';
    session.payment_data.amount = total;
    session.payment_data.cardTransactionId = result.chargeId;
    session.payment_data.cardStatus = 'approved';
  } else {
    session.status = 'card_processing';
    session.payment_data.cardTransactionId = result.chargeId;
    session.payment_data.cardStatus = result.status;
  }

  session = db.saveSession(session);
  res.json({ session, approved: result.approved });
});

// ============================================================
// RECEIPT UPLOAD
// ============================================================
app.post('/api/pay/receipt', upload.single('file'), (req, res) => {
  const { slug } = req.body;
  let session = db.getSession(slug);
  if (!session) return res.status(404).json({ error: 'Sessão não encontrada' });
  session.receipt_uploaded_at = new Date().toISOString();
  session = db.saveSession(session);
  res.json({ success: true, session });
});

// ============================================================
// _NEXT/DATA ENDPOINTS
// ============================================================
const axios = require('axios');
const LIVE_SITE = 'https://wspanelas.com';

// /pay/ — served locally (checkout sessions)
app.get(`/_next/data/${BUILD_ID}/pay/:slug.json`, (req, res) => {
  const session = db.getSession(req.params.slug);
  if (!session) return res.status(404).json({ pageProps: {}, notFound: true });
  res.json({
    pageProps: {
      session,
      siteSettings: SITE_SETTINGS,
      paymentClientConfig: { hypercashPublicKey: process.env.HYPERCASH_PUBLIC_KEY || '' }
    },
    __N_SSP: true
  });
});

// All other _next/data — proxy to live site
app.get(`/_next/data/${BUILD_ID}/:path(*).json`, async (req, res) => {
  const remotePath = req.params.path;
  const qs = Object.keys(req.query).length ? '?' + new URLSearchParams(req.query).toString() : '';
  const url = `${LIVE_SITE}/_next/data/${BUILD_ID}/${remotePath}.json${qs}`;
  try {
    const response = await axios.get(url, { timeout: 8000, responseType: 'json' });
    res.json(response.data);
  } catch (err) {
    console.error(`[Proxy] Failed ${url}:`, err.message);
    res.json({ pageProps: {}, __N_SSP: true });
  }
});

// ============================================================
// SPA CATCH-ALL
// ============================================================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ============================================================
// START
// ============================================================
app.listen(PORT, () => {
  console.log(`\n  🍳 WS Fábrica de Panelas - Server running`);
  console.log(`  📍 http://localhost:${PORT}`);
  console.log(`  🔑 HyperCash Public Key: ${process.env.HYPERCASH_PUBLIC_KEY ? '✅ loaded' : '❌ missing'}`);
  console.log(`  🔐 HyperCash Secret Key: ${process.env.HYPERCASH_SECRET_KEY ? '✅ loaded' : '❌ missing'}\n`);
});
