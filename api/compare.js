const { getMerchantById, getProduct } = require('./_data');
const { compareAcrossPlatforms } = require('./_providers');
const { ensureGet, getQuery, sendError, sendJson } = require('./_http');

module.exports = function handler(req, res) {
  if (!ensureGet(req, res)) return;

  const query = getQuery(req);
  const merchantId = query.get('merchantId');
  const productId = query.get('productId');
  const keyword = String(query.get('keyword') || '').trim();
  const address = String(query.get('address') || '').trim();
  const lat = query.get('lat');
  const lng = query.get('lng');

  let merchant = null;
  let product = null;

  if (merchantId || productId) {
    if (!merchantId || !productId) {
      sendError(res, 400, 'merchantId and productId must be provided together');
      return;
    }

    merchant = getMerchantById(merchantId);
    if (!merchant) {
      sendError(res, 404, 'Merchant not found', { merchantId });
      return;
    }

    product = getProduct(merchantId, productId);
    if (!product) {
      sendError(res, 404, 'Product not found', { merchantId, productId });
      return;
    }
  }

  if (!product && !keyword) {
    sendError(res, 400, 'Provide either keyword or merchantId + productId');
    return;
  }

  const quotes = compareAcrossPlatforms({
    keyword,
    merchantName: merchant ? merchant.name : '',
    productName: product ? product.name : keyword,
    productPrice: product ? product.price : undefined,
    address: address || `${lat || ''},${lng || ''}`,
  });

  sendJson(res, 200, {
    ok: true,
    data: {
      merchant,
      product,
      quotes,
      bestQuote: quotes[0] || null,
      location: {
        lat: lat ? Number(lat) : null,
        lng: lng ? Number(lng) : null,
        address: address || null,
      },
      pricingFormula:
        'finalPrice = productPrice + packageFee + deliveryFee - platformDiscount - merchantDiscount - couponDiscount',
      source: 'mock-provider',
    },
  });
};
