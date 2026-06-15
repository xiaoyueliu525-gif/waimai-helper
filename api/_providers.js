const PLATFORM_META = {
  meituan: {
    id: 'meituan',
    name: '美团',
    theme: 'platform-meituan',
    icon: '美',
    deliveryLabel: '约25分钟',
    storeSuffix: '美团店',
    priceBias: 0.98,
    couponText: '满减优惠',
    url: 'https://waimai.meituan.com/',
  },
  taobao: {
    id: 'taobao',
    name: '淘宝闪购',
    theme: 'platform-taobao',
    icon: '淘',
    deliveryLabel: '约30分钟',
    storeSuffix: '闪购店',
    priceBias: 0.94,
    couponText: '闪购特价',
    url: 'https://market.m.taobao.com/app/eleme/miniapp-biz/pages/index',
  },
  jd: {
    id: 'jd',
    name: '京东秒送',
    theme: 'platform-jd',
    icon: '京',
    deliveryLabel: '秒送30分钟',
    storeSuffix: '秒送店',
    priceBias: 1.02,
    couponText: '秒送专享',
    url: 'https://www.jd.com/',
  },
};

const PLATFORMS = Object.values(PLATFORM_META);

function hashCode(value) {
  let hash = 0;
  const text = String(value || '');
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function roundMoney(value) {
  return Math.max(0, Math.round(value * 10) / 10);
}

function buildDiscounts(platformId, subtotal, seed) {
  const merchantDiscount = subtotal >= 30 ? 6 + (seed % 5) : subtotal >= 20 ? 3 : 0;
  const platformDiscount = platformId === 'taobao' ? 4 : platformId === 'jd' ? 3 : 2;
  const couponDiscount = seed % 3 === 0 ? 5 : 0;

  return {
    platformDiscount,
    merchantDiscount,
    couponDiscount,
    total: roundMoney(platformDiscount + merchantDiscount + couponDiscount),
  };
}

function quoteFromPlatform(platform, input) {
  const productName = input.productName || input.keyword || '精选套餐';
  const merchantName = input.merchantName || `${productName}精选`;
  const basePrice = Number(input.productPrice || 18.8);
  const seed = hashCode(`${platform.id}:${merchantName}:${productName}:${input.address || ''}`);
  const productPrice = roundMoney(basePrice * platform.priceBias + (seed % 18) / 10);
  const packageFee = roundMoney(1 + (seed % 4) * 0.5);
  const deliveryFee = roundMoney(platform.id === 'jd' ? 2 + (seed % 3) : seed % 2 === 0 ? 0 : 3);
  const discounts = buildDiscounts(platform.id, productPrice + packageFee, seed);
  const finalPrice = roundMoney(productPrice + packageFee + deliveryFee - discounts.total);
  const etaMinutes = platform.id === 'jd' ? 25 + (seed % 10) : 20 + (seed % 18);

  return {
    platform: platform.id,
    platformName: platform.name,
    theme: platform.theme,
    icon: platform.icon,
    storeName: `${merchantName}·${platform.storeSuffix}`,
    productName,
    productPrice,
    packageFee,
    deliveryFee,
    discounts,
    finalPrice,
    etaMinutes,
    delivery: platform.deliveryLabel,
    coupon: platform.couponText,
    shops: 30 + (seed % 120),
    storeUrl: platform.url,
    updatedAt: new Date().toISOString(),
    source: 'mock',
  };
}

function compareAcrossPlatforms(input) {
  return PLATFORMS
    .map((platform) => quoteFromPlatform(platform, input))
    .sort((a, b) => a.finalPrice - b.finalPrice);
}

module.exports = {
  PLATFORMS,
  compareAcrossPlatforms,
};
