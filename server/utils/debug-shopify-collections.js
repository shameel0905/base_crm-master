(async () => {
  try {
    const shopifyAPI = require('../shopify_api');
    console.log('Calling shopifyAPI.getCollections()...');
    const cols = await shopifyAPI.getCollections({ limit: 5 });
    console.log('Result count:', Array.isArray(cols) ? cols.length : typeof cols, '\n', JSON.stringify(cols, null, 2));
  } catch (err) {
    console.error('Error calling shopifyAPI.getCollections():', err.message, err.statusCode, err.data || 'no-data');
    console.error(err);
    process.exit(1);
  }
})();
