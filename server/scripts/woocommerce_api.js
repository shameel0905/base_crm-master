const WooCommerceRestApiPkg = require('@woocommerce/woocommerce-rest-api');

function getApiClient() {
  const store = process.env.WC_STORE;
  const key = process.env.WC_CONSUMER_KEY;
  const secret = process.env.WC_CONSUMER_SECRET;
  if (!store || !key || !secret) {
    throw new Error('WC_STORE, WC_CONSUMER_KEY and WC_CONSUMER_SECRET must be set in env');
  }
  const baseUrl = store.startsWith('http://') || store.startsWith('https://') ? store : `https://${store}`;
  const WooCommerceRestApi = WooCommerceRestApiPkg.default || WooCommerceRestApiPkg;
  return new WooCommerceRestApi({
    url: baseUrl,
    consumerKey: key,
    consumerSecret: secret,
    version: 'wc/v3',
  });
}

async function getProducts(params = {}) {
  const api = getApiClient();
  const response = await api.get('products', params);
  return response.data;
}

module.exports = { getProducts };
