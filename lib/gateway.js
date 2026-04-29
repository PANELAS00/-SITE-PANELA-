// lib/gateway.js — BlackPayments API Integration
const axios = require('axios');

const API_URL = 'https://api.blackpayments.pro/v1/transactions';
const PUBLIC_KEY = process.env.HYPERCASH_PUBLIC_KEY;
const SECRET_KEY = process.env.HYPERCASH_SECRET_KEY;

function getAuth() {
  return 'Basic ' + Buffer.from(`${PUBLIC_KEY}:${SECRET_KEY}`).toString('base64');
}

const api = axios.create({
  baseURL: 'https://api.blackpayments.pro',
  headers: {
    'Authorization': getAuth(),
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Fix auth header (keys loaded after module init)
api.interceptors.request.use(config => {
  config.headers.Authorization = 'Basic ' + Buffer.from(
    `${process.env.HYPERCASH_PUBLIC_KEY}:${process.env.HYPERCASH_SECRET_KEY}`
  ).toString('base64');
  return config;
});

// ============ PIX ============
async function createPixCharge({ amount, customer, orderId, items, expirationMinutes = 30 }) {
  try {
    const amountCents = Math.round(amount * 100);
    const payload = {
      amount: amountCents,
      paymentMethod: 'pix',
      externalRef: orderId,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        document: {
          type: 'cpf',
          number: (customer.cpf || '').replace(/\D/g, ''),
        },
      },
      items: (items || [{ title: 'Pedido WS Panelas', quantity: 1, unitPrice: amountCents }]).map(i => ({
        title: i.title || i.product_title || 'Produto',
        quantity: i.quantity || 1,
        unitPrice: Math.round((i.presentment_price || i.unitPrice || amount) * 100),
        tangible: true,
      })),
    };

    console.log('[Gateway] Creating PIX charge...', { amount: amountCents, customer: customer.name });
    const response = await api.post('/v1/transactions', payload);
    const data = response.data;

    console.log('[Gateway] PIX created! ID:', data.id, 'Status:', data.status);
    return {
      success: true,
      qrCode: data.pix?.qrcode || null,
      chargeId: data.id,
      secureId: data.secureId,
      status: data.status,
      expiresAt: data.pix?.expirationDate || new Date(Date.now() + expirationMinutes * 60000).toISOString(),
      amount: amount,
      providerLabel: 'BLACKPAYMENTS',
    };
  } catch (error) {
    const errData = error.response?.data || {};
    console.error('[Gateway] PIX error:', errData.message || error.message, errData.error || '');
    return {
      success: false,
      error: errData.message || error.message,
      details: errData.error || null,
    };
  }
}

// ============ CARD ============
async function processCardPayment({ cardToken, amount, installments, customer, orderId, items }) {
  try {
    const amountCents = Math.round(amount * 100);
    const payload = {
      amount: amountCents,
      paymentMethod: 'credit_card',
      installments: installments || 1,
      cardToken: cardToken,
      externalRef: orderId,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        document: {
          type: 'cpf',
          number: (customer.cpf || '').replace(/\D/g, ''),
        },
      },
      items: (items || [{ title: 'Pedido WS Panelas', quantity: 1, unitPrice: amountCents }]).map(i => ({
        title: i.title || i.product_title || 'Produto',
        quantity: i.quantity || 1,
        unitPrice: Math.round((i.presentment_price || i.unitPrice || amount) * 100),
        tangible: true,
      })),
    };

    if (customer.address) {
      payload.customer.address = {
        street: customer.address.street || '',
        streetNumber: customer.address.number || '',
        neighborhood: customer.address.neighborhood || '',
        city: customer.address.city || '',
        state: customer.address.state || '',
        zipcode: (customer.address.cep || '').replace(/\D/g, ''),
        country: 'BR',
      };
    }

    console.log('[Gateway] Processing card payment...', { amount: amountCents, installments });
    const response = await api.post('/v1/transactions', payload);
    const data = response.data;

    console.log('[Gateway] Card result! ID:', data.id, 'Status:', data.status);
    const approved = data.status === 'paid' || data.status === 'authorized';
    return {
      success: true,
      chargeId: data.id,
      status: data.status,
      approved,
      authCode: data.authorizationCode,
    };
  } catch (error) {
    const errData = error.response?.data || {};
    console.error('[Gateway] Card error:', errData.message || error.message, errData.error || '');
    return {
      success: false,
      error: errData.message || error.message,
      category: errData.refusedReason || 'processing_error',
      details: errData.error || null,
    };
  }
}

// ============ STATUS ============
async function getChargeStatus(chargeId) {
  try {
    const response = await api.get(`/v1/transactions/${chargeId}`);
    return { success: true, status: response.data.status, data: response.data };
  } catch (error) {
    return { success: false, error: 'Erro ao consultar status' };
  }
}

module.exports = { createPixCharge, processCardPayment, getChargeStatus };
