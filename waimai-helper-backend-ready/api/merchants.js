const { data } = require('./_data');
const { ensureGet, getQuery, sendJson } = require('./_http');

module.exports = function handler(req, res) {
  if (!ensureGet(req, res)) return;

  const query = getQuery(req);
  const category = query.get('category');
  const q = String(query.get('q') || '').trim().toLowerCase();

  let merchants = data.merchants;
  if (category && category !== 'all') {
    merchants = merchants.filter((merchant) => merchant.category === category);
  }
  if (q) {
    merchants = merchants.filter((merchant) => {
      return (
        merchant.name.toLowerCase().includes(q) ||
        merchant.keywords.some((keyword) => keyword.toLowerCase().includes(q)) ||
        merchant.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }

  sendJson(res, 200, {
    ok: true,
    data: merchants,
    count: merchants.length,
  });
};
