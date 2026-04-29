const axios = require('axios');

const SECRET_KEY = process.env.HYPERCASH_SECRET_KEY;
// Try multiple possible base URLs
const BASE_URLS = [
  'https://api.fastsoftbrasil.com',
  'https://api.hypercash.com.br',
  'https://gateway.fastsoftbrasil.com'
];

let activeBaseUrl = BASE_URLS[0];

function getApi() {
  return axios.create({
    baseURL: activeBaseUrl,
    headers: {
      'Authorization': `Bearer ${SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  });
}

// PIX charge
async function createPixCharge({ amount, customer, orderId, expirationMinutes = 15 }) {
  const api = getApi();
  const endpoints = ['/v1/charges/pix', '/v1/pix/charge', '/v1/transactions/pix', '/charges/pix'];
  
  for (const endpoint of endpoints) {
    try {
      const response = await api.post(endpoint, {
        amount: Math.round(amount * 100),
        customer: {
          name: customer.name,
          email: customer.email,
          document: customer.cpf,
          phone: customer.phone,
        },
        payment_method: 'pix',
        external_reference: orderId,
        description: `Pedido WS Panelas #${orderId}`,
        expires_in: expirationMinutes * 60,
      });
      console.log(`[HyperCash] PIX success via ${endpoint}`);
      return {
        success: true,
        qrCode: response.data.pix?.qr_code || response.data.qr_code || response.data.payload,
        amount: amount,
        chargeId: response.data.id || response.data.charge_id,
        status: response.data.status,
        expiresAt: response.data.expires_at || new Date(Date.now() + expirationMinutes * 60000).toISOString(),
        providerLabel: 'GETNET S.A',
      };
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error(`[HyperCash] PIX error on ${endpoint}:`, error.response?.data || error.message);
        return { success: false, error: error.response?.data?.message || error.message };
      }
    }
  }
  return { success: false, error: 'Nenhum endpoint PIX disponível' };
}

// Card payment
async function processCardPayment({ cardToken, amount, installments, customer, orderId }) {
  const api = getApi();
  const endpoints = ['/v1/charges/card', '/v1/transactions/card', '/v1/card/charge', '/charges/card'];
  
  for (const endpoint of endpoints) {
    try {
      const response = await api.post(endpoint, {
        amount: Math.round(amount * 100),
        installments: installments || 1,
        card_token: cardToken,
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
      console.log(`[HyperCash] Card success via ${endpoint}`);
      const status = response.data.status;
      return {
        success: true,
        chargeId: response.data.id || response.data.charge_id,
        status: status,
        approved: status === 'approved' || status === 'paid',
        authCode: response.data.authorization_code,
      };
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error(`[HyperCash] Card error on ${endpoint}:`, error.response?.data || error.message);
        const data = error.response?.data || {};
        return {
          success: false,
          error: data.message || error.message,
          category: data.failure_category || data.category || 'processing_error',
        };
      }
    }
  }
  return { success: false, error: 'Nenhum endpoint de cartão disponível', category: 'gateway_unavailable' };
}

// Check charge status
async function getChargeStatus(chargeId) {
  try {
    const api = getApi();
    const response = await api.get(`/v1/charges/${chargeId}`);
    return { success: true, status: response.data.status, data: response.data };
  } catch (error) {
    return { success: false, error: 'Erro ao consultar status' };
  }
}

module.exports = { createPixCharge, processCardPayment, getChargeStatus };
