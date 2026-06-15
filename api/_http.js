function sendJson(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=300');
  res.end(JSON.stringify(body));
}

function sendError(res, statusCode, message, details) {
  sendJson(res, statusCode, {
    ok: false,
    error: {
      message,
      details: details || null,
    },
  });
}

function ensureGet(req, res) {
  if (req.method === 'GET') return true;
  res.setHeader('Allow', 'GET');
  sendError(res, 405, 'Only GET requests are supported');
  return false;
}

function getQuery(req) {
  const baseUrl = `https://${req.headers.host || 'localhost'}`;
  return new URL(req.url, baseUrl).searchParams;
}

module.exports = {
  ensureGet,
  getQuery,
  sendError,
  sendJson,
};
