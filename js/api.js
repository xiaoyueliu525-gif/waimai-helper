/**
 * 数据 API 层
 * 优先 fetch data/api.json（需本地服务器），file:// 下自动降级为内嵌数据
 */
const FoodAPI = (() => {
  let cache = null;

  const EMBEDDED = {
    hotTags: ['麻辣烫', '奶茶', '黄焖鸡', '满减', '烧烤', '寿司'],
    categories: [
      { id: 'fastfood', name: '快餐便当', emoji: '🍱', class: 'cat-fastfood' },
      { id: 'chinese', name: '中餐小炒', emoji: '🥘', class: 'cat-chinese' },
      { id: 'western', name: '西餐披萨', emoji: '🍕', class: 'cat-western' },
      { id: 'dessert', name: '甜品烘焙', emoji: '🧁', class: 'cat-dessert' },
      { id: 'drink', name: '奶茶饮品', emoji: '🧋', class: 'cat-drink' },
      { id: 'snack', name: '小吃炸物', emoji: '🍟', class: 'cat-snack' },
      { id: 'healthy', name: '轻食沙拉', emoji: '🥗', class: 'cat-healthy' },
      { id: 'night', name: '夜宵烧烤', emoji: '🍢', class: 'cat-night' },
    ],
    foods: [
      { id: 1, name: '兰州拉面', emoji: '🍜', category: 'fastfood', tip: '附近 3 家店铺有优惠', shops: 3 },
      { id: 2, name: '黄焖鸡米饭', emoji: '🍗', category: 'fastfood', tip: '满 25 减 8，超值套餐', shops: 5 },
      { id: 3, name: '麻辣香锅', emoji: '🌶️', category: 'chinese', tip: '新客立减 10 元', shops: 4 },
      { id: 4, name: '寿司拼盘', emoji: '🍣', category: 'western', tip: '第二份半价', shops: 2 },
      { id: 5, name: '炸鸡汉堡', emoji: '🍔', category: 'fastfood', tip: '套餐低至 19.9 元', shops: 6 },
      { id: 6, name: '重庆小面', emoji: '🍝', category: 'chinese', tip: '配送费全免', shops: 3 },
      { id: 7, name: '珍珠奶茶', emoji: '🧋', category: 'drink', tip: '买一送一活动中', shops: 8 },
      { id: 8, name: '烤肉拌饭', emoji: '🥩', category: 'chinese', tip: '会员专享 8 折', shops: 2 },
      { id: 9, name: '披萨', emoji: '🍕', category: 'western', tip: '大号披萨 49 元起', shops: 3 },
      { id: 10, name: '麻辣烫', emoji: '🍲', category: 'night', tip: '满 30 减 12', shops: 7 },
      { id: 11, name: '生煎包', emoji: '🥟', category: 'snack', tip: '老字号好评如潮', shops: 2 },
      { id: 12, name: '螺蛳粉', emoji: '🍜', category: 'snack', tip: '加料不加价', shops: 4 },
    ],
    deals: [
      { id: 1, name: '老王黄焖鸡', desc: '招牌黄焖鸡 + 米饭 + 饮料', emoji: '🍗', price: 18.8, oldPrice: 32, tag: '省13元', bg: 'bg-1', category: 'fastfood', merchantId: 3 },
      { id: 2, name: '茶百道', desc: '多肉葡萄大杯 限时特惠', emoji: '🧋', price: 9.9, oldPrice: 18, tag: '5折', bg: 'bg-2', category: 'drink', merchantId: 2 },
      { id: 3, name: '沙县小吃', desc: '拌面 + 蒸饺 + 炖罐', emoji: '🍜', price: 15, oldPrice: 22, tag: '套餐', bg: 'bg-3', category: 'fastfood', merchantId: 4 },
      { id: 4, name: '海底捞外卖', desc: '双人火锅套餐 含锅底', emoji: '🍲', price: 128, oldPrice: 198, tag: '省70元', bg: 'bg-1', category: 'chinese' },
    ],
    merchants: [
      { id: 1, name: '杨国福麻辣烫', emoji: '🍲', rating: 4.8, sales: '月售2000+', tags: ['满30减12', '配送费减3'], category: 'night', keywords: ['麻辣烫', '麻辣', '烫'], deliveryTime: '28分钟', distance: '0.8km', minOrder: 20, deliveryFee: 3, notice: '自选菜品，汤底可选麻辣/番茄' },
      { id: 2, name: '蜜雪冰城', emoji: '🧋', rating: 4.7, sales: '月售5000+', tags: ['第二杯半价'], category: 'drink', keywords: ['奶茶', '饮品', '冰城'], deliveryTime: '15分钟', distance: '0.5km', minOrder: 15, deliveryFee: 0, notice: '你爱我我爱你，蜜雪冰城甜蜜蜜' },
      { id: 3, name: '华莱士', emoji: '🍔', rating: 4.5, sales: '月售3000+', tags: ['满25减8'], category: 'fastfood', keywords: ['汉堡', '炸鸡', '黄焖鸡'], deliveryTime: '25分钟', distance: '1.0km', minOrder: 20, deliveryFee: 2, notice: '全鸡汉堡，现炸现做' },
      { id: 4, name: '兰州正宗拉面', emoji: '🍜', rating: 4.6, sales: '月售1500+', tags: ['新客立减5'], category: 'fastfood', keywords: ['拉面', '牛肉面'], deliveryTime: '22分钟', distance: '0.6km', minOrder: 18, deliveryFee: 2, notice: '手工拉面，汤清面劲' },
      { id: 5, name: '张亮麻辣烫', emoji: '🌶️', rating: 4.7, sales: '月售1800+', tags: ['满减', '满40减15'], category: 'night', keywords: ['麻辣烫', '满减'], deliveryTime: '30分钟', distance: '1.2km', minOrder: 25, deliveryFee: 3, notice: '骨汤熬制，麻辣鲜香' },
      { id: 6, name: '喜茶', emoji: '🧋', rating: 4.9, sales: '月售4000+', tags: ['会员9折'], category: 'drink', keywords: ['奶茶', '喜茶'], deliveryTime: '20分钟', distance: '0.9km', minOrder: 25, deliveryFee: 0, notice: '灵感之茶，中国制造' },
      { id: 7, name: '正新鸡排', emoji: '🍗', rating: 4.4, sales: '月售2500+', tags: ['鸡排买一送一'], category: 'snack', keywords: ['鸡排', '炸物', '小吃'], deliveryTime: '18分钟', distance: '0.4km', minOrder: 15, deliveryFee: 1, notice: '现炸大鸡排，酥脆多汁' },
      { id: 8, name: '必胜客', emoji: '🍕', rating: 4.6, sales: '月售800+', tags: ['披萨5折起'], category: 'western', keywords: ['披萨', '西餐'], deliveryTime: '35分钟', distance: '1.5km', minOrder: 50, deliveryFee: 5, notice: '意式披萨，芝士满满' },
    ],
    menus: [
      { merchantId: 1, sections: [{ name: '招牌套餐', items: [{ id: 101, name: '经典麻辣烫套餐', desc: '含5荤5素+主食', price: 28.8, emoji: '🍲', sales: '月售800+' }, { id: 102, name: '双人畅享锅', desc: '2人份，菜品任选', price: 48, emoji: '🌶️', sales: '月售300+' }] }] },
      { merchantId: 2, sections: [{ name: '人气奶茶', items: [{ id: 201, name: '柠檬水', desc: '大杯', price: 4, emoji: '🍋', sales: '月售3000+' }, { id: 202, name: '珍珠奶茶', desc: '经典款', price: 7, emoji: '🧋', sales: '月售2500+' }] }] },
      { merchantId: 3, sections: [{ name: '汉堡套餐', items: [{ id: 301, name: '香辣鸡腿堡套餐', desc: '堡+薯条+可乐', price: 19.9, emoji: '🍔', sales: '月售1500+' }] }] },
      { merchantId: 4, sections: [{ name: '面食', items: [{ id: 401, name: '牛肉拉面', desc: '大碗', price: 18, emoji: '🍜', sales: '月售900+' }] }] },
      { merchantId: 5, sections: [{ name: '热销', items: [{ id: 501, name: '骨汤麻辣烫', desc: '自选称重', price: 32, emoji: '🍲', sales: '月售700+' }] }] },
      { merchantId: 6, sections: [{ name: '必喝', items: [{ id: 601, name: '多肉葡萄', desc: '芝士顶', price: 28, emoji: '🍇', sales: '月售2000+' }] }] },
      { merchantId: 7, sections: [{ name: '鸡排', items: [{ id: 701, name: '正新大鸡排', desc: '香辣/甘梅', price: 12, emoji: '🍗', sales: '月售2000+' }] }] },
      { merchantId: 8, sections: [{ name: '披萨', items: [{ id: 801, name: '超级至尊披萨', desc: '9寸', price: 59, emoji: '🍕', sales: '月售300+' }] }] },
    ],
    reviews: [
      { merchantId: 1, user: '美食家小王', rating: 5, content: '汤底很浓，菜品新鲜，配送也快！', date: '2026-06-08' },
      { merchantId: 2, user: '奶茶控', rating: 5, content: '性价比之王，柠檬水永远的神', date: '2026-06-09' },
      { merchantId: 6, user: '甜品少女', rating: 5, content: '多肉葡萄绝了，芝士顶超满足', date: '2026-06-08' },
    ],
    coupons: [
      { id: 1, title: '全场通用红包', amount: 5, minSpend: 20, desc: '满20元可用', expire: '2026-06-15', status: 'available', platform: '美团' },
      { id: 2, title: '新客专享', amount: 15, minSpend: 30, desc: '首单满30减15', expire: '2026-06-20', status: 'available', platform: '饿了么' },
      { id: 3, title: '奶茶专区券', amount: 8, minSpend: 25, desc: '奶茶饮品专用', expire: '2026-06-12', status: 'available', platform: '美团' },
      { id: 4, title: '周末狂欢', amount: 12, minSpend: 50, desc: '周六日可用', expire: '2026-06-08', status: 'available', platform: '通用' },
      { id: 5, title: '夜宵满减', amount: 10, minSpend: 35, desc: '22:00后可用', expire: '2026-05-28', status: 'used', platform: '饿了么' },
      { id: 6, title: '会员日特惠', amount: 20, minSpend: 60, desc: '每月8日可用', expire: '2026-05-01', status: 'expired', platform: '美团' },
      { id: 7, title: '配送费减免', amount: 3, minSpend: 15, desc: '免配送费', expire: '2026-05-20', status: 'expired', platform: '通用' },
    ],
  };

  async function loadData() {
    if (cache) return cache;
    try {
      const res = await fetch('data/api.json');
      if (res.ok) {
        cache = await res.json();
        return cache;
      }
    } catch {
      /* file:// 或无服务器时降级 */
    }
    cache = EMBEDDED;
    return cache;
  }

  function delay(ms = 300) {
    return new Promise((r) => setTimeout(r, ms));
  }

  return {
    async getHotTags() {
      const data = await loadData();
      await delay(100);
      return data.hotTags;
    },

    async getCategories() {
      const data = await loadData();
      await delay(150);
      return data.categories;
    },

    async getDeals(limit) {
      const data = await loadData();
      await delay(200);
      const deals = data.deals;
      return limit ? deals.slice(0, limit) : deals;
    },

    async getFoods() {
      const data = await loadData();
      return data.foods;
    },

    async drawFood() {
      const foods = await this.getFoods();
      return foods[Math.floor(Math.random() * foods.length)];
    },

    async search(keyword) {
      const data = await loadData();
      await delay(350);
      const q = keyword.trim().toLowerCase();
      if (!q) return { merchants: [], foods: [], deals: [] };

      const merchants = data.merchants.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.keywords.some((k) => k.toLowerCase().includes(q)) ||
          m.tags.some((t) => t.toLowerCase().includes(q))
      );

      const foods = data.foods.filter(
        (f) => f.name.toLowerCase().includes(q)
      );

      const deals = data.deals.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.desc.toLowerCase().includes(q)
      );

      const categories = data.categories.filter(
        (c) => c.name.toLowerCase().includes(q)
      );

      if (categories.length && !merchants.length) {
        const catIds = categories.map((c) => c.id);
        merchants.push(
          ...data.merchants.filter((m) => catIds.includes(m.category))
        );
      }

      return {
        merchants: [...new Map(merchants.map((m) => [m.id, m])).values()],
        foods,
        deals,
        total: merchants.length + foods.length + deals.length,
      };
    },

    async getCoupons(status = 'all') {
      const data = await loadData();
      await delay(200);
      if (status === 'all') return data.coupons;
      return data.coupons.filter((c) => c.status === status);
    },

    async getAvailableCouponCount() {
      const coupons = await this.getCoupons('available');
      return coupons.length;
    },

    async getMerchants(category) {
      const data = await loadData();
      await delay(200);
      if (!category || category === 'all') return data.merchants;
      return data.merchants.filter((m) => m.category === category);
    },

    async getMerchant(id) {
      const data = await loadData();
      await delay(150);
      return data.merchants.find((m) => m.id === Number(id)) || null;
    },

    async getMerchantMenu(merchantId) {
      const data = await loadData();
      await delay(200);
      const menu = (data.menus || []).find((m) => m.merchantId === Number(merchantId));
      return menu || { sections: [] };
    },

    async getMerchantReviews(merchantId) {
      const data = await loadData();
      await delay(100);
      return (data.reviews || []).filter((r) => r.merchantId === Number(merchantId));
    },

    async findMerchantByName(name) {
      const data = await loadData();
      return data.merchants.find((m) => m.name.includes(name) || name.includes(m.name)) || null;
    },
  };
})();
