const { getMerchantById, getProducts } = require('./_data');
const { ensureGet, getQuery, sendError, sendJson } = require('./_http');

module.exports = function handler(req, res) {
  if (!ensureGet(req, res)) return;

  const query = getQuery(req);
  const merchantId = query.get('merchantId');

  if (merchantId && !getMerchantById(merchantId)) {
    sendError(res, 404, 'Merchant not found', { merchantId });
    return;
  }

  const products = getProducts(merchantId);

  sendJson(res, 200, {
    ok: true,
    data: products,
    count: products.length,
  });
};
