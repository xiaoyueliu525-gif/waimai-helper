/**
 * 购物车（sessionStorage）
 */
const Cart = (() => {
  const KEY = 'food-saver-cart';

  function load() {
    try {
      return JSON.parse(sessionStorage.getItem(KEY)) || { merchantId: null, items: [] };
    } catch {
      return { merchantId: null, items: [] };
    }
  }

  function save(cart) {
    sessionStorage.setItem(KEY, JSON.stringify(cart));
  }

  function getItemCount(cart = load()) {
    return cart.items.reduce((sum, i) => sum + i.qty, 0);
  }

  function getTotal(cart = load()) {
    return cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  return {
    load,
    getItemCount,
    getTotal,

    add(merchantId, item) {
      const cart = load();
      if (cart.merchantId && cart.merchantId !== merchantId && cart.items.length) {
        const ok = confirm('购物车中有其他商家的商品，是否清空并添加？');
        if (!ok) return false;
        cart.items = [];
      }
      cart.merchantId = merchantId;
      const existing = cart.items.find((i) => i.id === item.id);
      if (existing) {
        existing.qty += 1;
      } else {
        cart.items.push({ ...item, qty: 1 });
      }
      save(cart);
      return true;
    },

    updateQty(itemId, delta) {
      const cart = load();
      const item = cart.items.find((i) => i.id === itemId);
      if (!item) return cart;
      item.qty += delta;
      if (item.qty <= 0) {
        cart.items = cart.items.filter((i) => i.id !== itemId);
      }
      if (!cart.items.length) cart.merchantId = null;
      save(cart);
      return cart;
    },

    clear() {
      save({ merchantId: null, items: [] });
    },
  };
})();
