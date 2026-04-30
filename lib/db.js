const fs = require('fs');
const path = require('path');

const isServerless = !!process.env.AWS_LAMBDA_FUNCTION_NAME || !!process.env.NETLIFY;
const DATA_DIR = path.join(__dirname, '..', 'data');
const SESSIONS_DIR = isServerless ? path.join('/tmp', 'sessions') : path.join(DATA_DIR, 'sessions');

// Ensure directories exist
if (!isServerless && !fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR, { recursive: true });

function readJSON(filename) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// PRODUCTS
function getProducts() { 
  const products = readJSON('products.json');
  return products.map(p => ({
    ...p,
    badge_config: p.badge_config || { active: false, text: '', type: 'default' }
  }));
}
function getProductBySlug(slug) { return getProducts().find(p => p.slug === slug) || null; }
function searchProducts(query) {
  const q = query.toLowerCase();
  return getProducts().filter(p =>
    p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
  );
}

// SESSIONS (file-per-session for safety)
function getSession(slug) {
  const filePath = path.join(SESSIONS_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveSession(session) {
  session.updated_at = new Date().toISOString();
  const filePath = path.join(SESSIONS_DIR, `${session.slug}.json`);
  fs.writeFileSync(filePath, JSON.stringify(session, null, 2));
  return session;
}

function createSession(cartItems, totalPriceCents) {
  const slug = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const session = {
    id: slug,
    slug,
    status: 'processing',
    current_step: 1,
    personal_info: { name: '', email: '', phone: '' },
    address: { cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' },
    selected_shipping: '',
    shipping_cost: 0,
    payment_method: 'pix',
    cpf: '',
    cart_data: {
      items: cartItems,
      total_price: totalPriceCents,
      items_subtotal_price: totalPriceCents
    },
    payment_data: {
      qrCode: null, oid: null, amount: null, expiresAt: null, generatedAt: null,
      pixGenerationLockAt: null, cardAttemptStartedAt: null, pixCopiedAt: null,
      trackingCode: null, trackingUrl: null, method: null, gateway: null,
      providerLabel: null, cardTransactionId: null, cardStatus: null,
      cardFailureCategory: null, cardFailureMessage: null, funnel_events: []
    },
    query_params: {},
    tracking_params: {},
    receipt_uploaded_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  return saveSession(session);
}

module.exports = { getProducts, getProductBySlug, searchProducts, getSession, saveSession, createSession };
