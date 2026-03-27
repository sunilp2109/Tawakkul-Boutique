const axios = require('axios');

const PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID;
const ACCESS_TOKEN   = process.env.META_WHATSAPP_TOKEN;
const API_VERSION    = process.env.META_API_VERSION || 'v21.0';
const notificationsEnabled = process.env.WHATSAPP_NOTIFICATIONS !== 'false';

/**
 * Sends a WhatsApp message via Meta WhatsApp Cloud API.
 * Errors are caught and logged — order flow is never broken.
 * @param {string} phoneNumber - Customer phone, e.g. "+919876543210"
 * @param {Object} options - Message options
 * @param {string} options.type - "text" | "template"
 * @param {string} [options.text] - The text body (if type is "text")
 * @param {string} [options.templateName] - Name of the template (if type is "template")
 * @param {string} [options.templateLanguage] - Target language, e.g., "en_US"
 * @param {Array} [options.components] - Array of component objects for the template payload
 * @returns {Promise<boolean>} - true if sent, false if failed/disabled
 */
async function sendWhatsAppMessage(phoneNumber, options) {
  if (!notificationsEnabled) {
    console.log('[WhatsApp] Notifications disabled — skipping message.');
    return false;
  }

  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    console.warn('[WhatsApp] Meta credentials not configured (META_PHONE_NUMBER_ID / META_WHATSAPP_TOKEN). Skipping message.');
    return false;
  }

  try {
    // Normalise the phone number to E.164 format (no leading +)
    let to = phoneNumber.replace(/[\s\-().+]/g, '');
    if (to.startsWith('0')) to = to.replace(/^0+/, '');
    if (!to.startsWith('91') && to.length === 10) to = '91' + to;
    // Remove duplicate 91 prefix e.g. 9191XXXXXXXXXX
    if (to.startsWith('9191') && to.length === 14) to = to.slice(2);

    console.log(`[WhatsApp] Sending ${options.type} to: ${to}`);

    const url = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`;
    
    let data = {
      messaging_product: 'whatsapp',
      to,
      type: options.type,
    };

    if (options.type === 'template') {
      data.template = {
        name: options.templateName,
        language: {
          code: options.templateLanguage || 'en_US'
        },
        components: options.components || []
      };
    } else {
      // Default to text if type is something else or explicitly 'text'
      data.type = 'text';
      data.text = { body: options.text };
    }

    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    const msgId = response.data?.messages?.[0]?.id || 'n/a';
    console.log(`[WhatsApp] ✅ Sent to ${to} — Message ID: ${msgId}`);
    return true;
  } catch (err) {
    const detail = err.response?.data?.error || err.message;
    console.error(`[WhatsApp] ❌ Failed for ${phoneNumber}:`, detail);
    return false;
  }
}

/**
 * Returns the template options for a given order status.
 * Requires templates to be created in Meta dashboard.
 * @param {string} status
 * @param {string} customerName
 * @param {string} orderNumber
 * @returns {Object|null}
 */
function getStatusMessage(status, customerName, orderNumber) {
  const name = customerName || 'Valued Customer';
  const num = orderNumber || '';

  const templateMap = {
    Confirmed: 'order_confirmed',
    Shipped: 'order_shipped',
    Delivered: 'order_delivered',
    Cancelled: 'order_cancelled',
  };

  const templateName = templateMap[status];
  if (!templateName) return null;

  return {
    type: 'template',
    templateName,
    templateLanguage: 'en',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: name },
          { type: 'text', text: num }
        ]
      }
    ]
  };
}

/**
 * Returns the template options sent when a new order is placed.
 * Requires 'new_order_received' template in Meta dashboard.
 * @param {string} customerName
 * @param {string} orderNumber
 * @returns {Object}
 */
function getNewOrderMessage(customerName, orderNumber) {
  const name = customerName || 'Valued Customer';
  const num = orderNumber || '';

  return {
    type: 'template',
    templateName: 'new_order_received',
    templateLanguage: 'en',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: name },
          { type: 'text', text: num }
        ]
      }
    ]
  };
}

module.exports = { sendWhatsAppMessage, getStatusMessage, getNewOrderMessage };
