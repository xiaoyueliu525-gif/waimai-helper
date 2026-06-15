/**
 * 订单存储（localStorage）
 */
const OrderStore = (() => {
  const KEY = 'food-saver-orders';

  const fiveMinAgo = new Date(Date.now() - 5 * 60000).toISOString();

  const SAMPLE = [
    {
      id: 10001,
      merchantId: 2,
      merchantName: '蜜雪冰城',
      merchantEmoji: '🧋',
      items: [
        { id: 201, name: '柠檬水', emoji: '🍋', price: 4, qty: 2 },
        { id: 202, name: '珍珠奶茶', emoji: '🧋', price: 7, qty: 1 },
      ],
      total: 15,
      deliveryFee: 0,
      status: 'completed',
      createdAt: '2026-06-09T12:30:00',
      deliveryTime: '15分钟',
    },
    {
      id: 10002,
      merchantId: 1,
      merchantName: '杨国福麻辣烫',
      merchantEmoji: '🍲',
      items: [
        { id: 101, name: '经典麻辣烫套餐', emoji: '🍲', price: 28.8, qty: 1 },
      ],
      total: 31.8,
      deliveryFee: 3,
      status: 'delivering',
      createdAt: fiveMinAgo,
      deliveryTime: '28分钟',
    },
  ];

  function load() {
    try {
      const data = localStorage.getItem(KEY);
      if (data) return JSON.parse(data);
    } catch {
      /* ignore */
    }
    localStorage.setItem(KEY, JSON.stringify(SAMPLE));
    return [...SAMPLE];
  }

  function save(orders) {
    localStorage.setItem(KEY, JSON.stringify(orders));
  }

  function formatItemsSummary(items) {
    return items.map((i) => `${i.name}×${i.qty}`).join('、');
  }

  return {
    load,

    getAll(status = 'all') {
      const orders = load().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      if (status === 'all') return orders;
      return orders.filter((o) => o.status === status);
    },

    getById(id) {
      return load().find((o) => o.id === Number(id));
    },

    getStats() {
      const orders = load();
      const completed = orders.filter((o) => o.status === 'completed');
      const saved = completed.reduce((sum, o) => sum + Math.round(o.total * 0.15), 0);
      return {
        total: orders.length,
        delivering: orders.filter((o) => o.status === 'delivering').length,
        completed: completed.length,
        saved,
      };
    },

    createOrder({ merchant, cartItems, total }) {
      const orders = load();
      const defaultAddr = typeof AddressStore !== 'undefined' ? AddressStore.getDefault() : null;
      const order = {
        id: Date.now(),
        merchantId: merchant.id,
        merchantName: merchant.name,
        merchantEmoji: merchant.emoji,
        items: cartItems.map((i) => ({
          id: i.id,
          name: i.name,
          emoji: i.emoji,
          price: i.price,
          qty: i.qty,
        })),
        total: total + (merchant.deliveryFee || 0),
        deliveryFee: merchant.deliveryFee || 0,
        status: 'delivering',
        createdAt: new Date().toISOString(),
        deliveryTime: merchant.deliveryTime,
        addressId: defaultAddr?.id || null,
      };
      orders.unshift(order);
      save(orders);
      return order;
    },

    formatItemsSummary,
  };
})();
