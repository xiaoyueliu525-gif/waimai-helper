const data = require('../data/api.json');

function compactText(value) {
  return String(value || '').trim().toLowerCase();
}

function includesText(value, query) {
  return compactText(value).includes(query);
}

function getMerchantById(id) {
  return data.merchants.find((merchant) => merchant.id === Number(id)) || null;
}

function getMenuByMerchantId(merchantId) {
  return data.menus.find((menu) => menu.merchantId === Number(merchantId)) || null;
}

function getProducts(merchantId) {
  const menus = merchantId
    ? data.menus.filter((menu) => menu.merchantId === Number(merchantId))
    : data.menus;

  return menus.flatMap((menu) => {
    const merchant = getMerchantById(menu.merchantId);
    return menu.sections.flatMap((section) =>
      section.items.map((item) => ({
        ...item,
        merchantId: menu.merchantId,
        merchantName: merchant ? merchant.name : '',
        sectionName: section.name,
      }))
    );
  });
}

function getProduct(merchantId, productId) {
  return getProducts(merchantId).find((item) => item.id === Number(productId)) || null;
}

function searchLocal(q) {
  const query = compactText(q);
  if (!query) {
    return {
      merchants: [],
      foods: [],
      deals: [],
      products: [],
      total: 0,
    };
  }

  const merchants = data.merchants.filter((merchant) => {
    return (
      includesText(merchant.name, query) ||
      includesText(merchant.category, query) ||
      merchant.keywords.some((keyword) => includesText(keyword, query)) ||
      merchant.tags.some((tag) => includesText(tag, query))
    );
  });

  const foods = data.foods.filter((food) => {
    return includesText(food.name, query) || includesText(food.category, query);
  });

  const deals = data.deals.filter((deal) => {
    return includesText(deal.name, query) || includesText(deal.desc, query);
  });

  const products = getProducts().filter((product) => {
    return (
      includesText(product.name, query) ||
      includesText(product.desc, query) ||
      includesText(product.merchantName, query) ||
      includesText(product.sectionName, query)
    );
  });

  const categoryMatches = data.categories.filter((category) => includesText(category.name, query));
  if (categoryMatches.length && !merchants.length) {
    const categoryIds = new Set(categoryMatches.map((category) => category.id));
    merchants.push(...data.merchants.filter((merchant) => categoryIds.has(merchant.category)));
  }

  return {
    merchants: [...new Map(merchants.map((merchant) => [merchant.id, merchant])).values()],
    foods,
    deals,
    products,
    total: merchants.length + foods.length + deals.length + products.length,
  };
}

module.exports = {
  data,
  getMerchantById,
  getMenuByMerchantId,
  getProduct,
  getProducts,
  searchLocal,
};
