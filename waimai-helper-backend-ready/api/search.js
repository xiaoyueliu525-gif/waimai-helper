const { searchLocal } = require('./_data');
const { compareAcrossPlatforms } = require('./_providers');
const { ensureGet, getQuery, sendError, sendJson } = require('./_http');

module.exports = function handler(req, res) {
  if (!ensureGet(req, res)) return;

  const query = getQuery(req);
  const q = String(query.get('q') || '').trim();
  const lat = query.get('lat');
  const lng = query.get('lng');

  if (!q) {
    sendError(res, 400, 'Missing search keyword', { required: 'q' });
    return;
  }

  const results = searchLocal(q);
  const firstProduct = results.products[0];
  const firstMerchant = results.merchants[0];
  const quotes = compareAcrossPlatforms({
    keyword: q,
    productName: firstProduct ? firstProduct.name : q,
    productPrice: firstProduct ? firstProduct.price : undefined,
    merchantName: firstProduct
      ? firstProduct.merchantName
      : firstMerchant
        ? firstMerchant.name
        : undefined,
    address: `${lat || ''},${lng || ''}`,
  });

  sendJson(res, 200, {
    ok: true,
    data: {
      ...results,
      quotes,
      bestQuote: quotes[0] || null,
      location: {
        lat: lat ? Number(lat) : null,
        lng: lng ? Number(lng) : null,
      },
    },
  });
};
