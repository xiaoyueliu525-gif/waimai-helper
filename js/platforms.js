/**
 * 跨平台比价
 */
const PlatformCompare = (() => {
  const PLATFORMS = [
    {
      id: 'meituan',
      name: '美团',
      theme: 'platform-meituan',
      icon: '美',
    },
    {
      id: 'taobao',
      name: '淘宝闪购',
      theme: 'platform-taobao',
      icon: '淘',
    },
    {
      id: 'jd',
      name: '京东秒送',
      theme: 'platform-jd',
      icon: '京',
    },
  ];

  const OFFERS = {
    黄焖鸡: {
      meituan: { shop: '华莱士·黄焖鸡', price: 18.8, coupon: '满25减8', delivery: '约25分钟', shops: 128 },
      taobao: { shop: '杨铭宇黄焖鸡', price: 16.9, coupon: '闪购专享价', delivery: '约30分钟', shops: 86 },
      jd: { shop: '黄焖鸡米饭套餐', price: 19.9, coupon: '新客立减10元', delivery: '秒送30分钟', shops: 52 },
    },
    麻辣烫: {
      meituan: { shop: '杨国福麻辣烫', price: 22.8, coupon: '满30减12', delivery: '约28分钟', shops: 95 },
      taobao: { shop: '张亮麻辣烫', price: 20.9, coupon: '闪购8折', delivery: '约32分钟', shops: 67 },
      jd: { shop: '麻辣烫自选套餐', price: 24.5, coupon: '免配送费', delivery: '秒送35分钟', shops: 41 },
    },
    奶茶: {
      meituan: { shop: '蜜雪冰城', price: 7, coupon: '第二杯半价', delivery: '约15分钟', shops: 210 },
      taobao: { shop: '喜茶', price: 15, coupon: '闪购立减5元', delivery: '约25分钟', shops: 88 },
      jd: { shop: '茶百道', price: 9.9, coupon: '新客专享', delivery: '秒送20分钟', shops: 56 },
    },
  };

  function hashCode(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
    return Math.abs(h);
  }

  function defaultOffer(keyword, platformId) {
    const h = hashCode(keyword + platformId);
    const prices = { meituan: 18.8, taobao: 16.9, jd: 19.9 };
    const base = prices[platformId] || 18;
    const price = (base + (h % 80) / 10).toFixed(1);
    const coupons = {
      meituan: '满减优惠',
      taobao: '闪购特价',
      jd: '秒送专享',
    };
    return {
      shop: `${keyword}精选店`,
      price: Number(price),
      coupon: coupons[platformId],
      delivery: platformId === 'jd' ? '秒送30分钟' : '约25分钟',
      shops: 30 + (h % 100),
    };
  }

  async function getOffers(keyword, userLocation) {
    const q = keyword.trim();
    if (window.location.protocol !== 'file:') {
      try {
        const params = new URLSearchParams();
        params.set('keyword', q);
        if (typeof LocationStore !== 'undefined') {
          const locationParams = LocationStore.toQuery(userLocation);
          locationParams.forEach((value, key) => params.set(key, value));
        }
        const res = await fetch(`/api/compare?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.ok && json.data?.quotes) {
            return json.data.quotes.map((quote) => ({
              id: quote.platform,
              name: quote.platformName,
              theme: quote.theme,
              icon: quote.icon,
              shop: quote.storeName,
              price: quote.finalPrice,
              productPrice: quote.productPrice,
              packageFee: quote.packageFee,
              deliveryFee: quote.deliveryFee,
              discounts: quote.discounts,
              coupon: quote.coupon,
              delivery: `${quote.etaMinutes}分钟`,
              shops: quote.shops,
              storeUrl: quote.storeUrl,
              keyword: q,
            }));
          }
        }
      } catch {
        /* 本地静态预览时使用前端 mock */
      }
    }

    const preset = OFFERS[q] || OFFERS[q.replace(/\s/g, '')];

    return PLATFORMS.map((p) => {
      const offer = preset?.[p.id] || defaultOffer(q, p.id);
      return { ...p, ...offer, keyword: q };
    });
  }

  function getBestPrice(offers) {
    return Math.min(...offers.map((o) => o.price));
  }

  return { getOffers, getBestPrice };
})();
