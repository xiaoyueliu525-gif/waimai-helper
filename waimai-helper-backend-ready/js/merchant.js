const params = new URLSearchParams(location.search);
const merchantId = Number(params.get('id'));

const merchantHeader = document.getElementById('merchantHeader');
const menuList = document.getElementById('menuList');
const reviewList = document.getElementById('reviewList');
const cartBar = document.getElementById('cartBar');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const menuTabs = document.getElementById('menuTabs');

let merchant = null;
let menu = null;
let activeSection = 0;
let itemMap = new Map();

function renderHeader(m) {
  merchantHeader.innerHTML = `
    <div class="merchant-hero-emoji">${m.emoji}</div>
    <div class="merchant-hero-info">
      <h1 class="merchant-hero-name">${m.name}</h1>
      <div class="merchant-hero-meta">
        <span class="rating">⭐ ${m.rating}</span>
        <span>${m.sales}</span>
      </div>
      <div class="merchant-hero-tags">
        ${m.tags.map((t) => `<span class="merchant-tag">${t}</span>`).join('')}
      </div>
      <div class="merchant-hero-delivery">
        <span>${m.deliveryTime}</span>
        <span>${m.distance}</span>
        <span>起送 ¥${m.minOrder}</span>
        <span>配送 ¥${m.deliveryFee}</span>
      </div>
      <p class="merchant-notice">📢 ${m.notice}</p>
    </div>
  `;
}

function renderMenuTabs(sections) {
  menuTabs.innerHTML = sections
    .map(
      (s, i) => `
      <button class="menu-tab ${i === 0 ? 'active' : ''}" data-index="${i}">${s.name}</button>
    `
    )
    .join('');
}

function renderMenuSection(section) {
  return `
    <div class="menu-section">
      <h3 class="menu-section-title">${section.name}</h3>
      ${section.items
        .map(
          (item) => `
        <div class="menu-item" data-id="${item.id}">
          <div class="menu-item-emoji">${item.emoji}</div>
          <div class="menu-item-info">
            <div class="menu-item-name">${item.name}</div>
            <div class="menu-item-desc">${item.desc}</div>
            <div class="menu-item-bottom">
              <span class="menu-item-sales">${item.sales}</span>
              <div class="menu-item-price-row">
                <span class="menu-item-price">¥${item.price}</span>
                <button class="btn-add" data-id="${item.id}">+</button>
              </div>
            </div>
          </div>
        </div>
      `
        )
        .join('')}
    </div>
  `;
}

function renderMenu(sections) {
  if (!sections.length) {
    menuList.innerHTML = '<div class="empty-state"><p>暂无菜单</p></div>';
    return;
  }
  menuList.innerHTML = renderMenuSection(sections[activeSection]);
}

function renderReviews(reviews) {
  if (!reviews.length) {
    reviewList.innerHTML = '<p class="empty-hint">暂无评价</p>';
    return;
  }
  reviewList.innerHTML = reviews
    .map(
      (r) => `
      <div class="review-card">
        <div class="review-top">
          <span class="review-user">${r.user}</span>
          <span class="review-rating">⭐ ${r.rating}</span>
        </div>
        <p class="review-content">${r.content}</p>
        <span class="review-date">${r.date}</span>
      </div>
    `
    )
    .join('');
}

function updateCartBar() {
  const cart = Cart.load();
  const count = Cart.getItemCount(cart);
  const total = Cart.getTotal(cart);

  if (count > 0 && cart.merchantId === merchantId) {
    cartBar.hidden = false;
    cartCount.textContent = count;
    cartTotal.textContent = total.toFixed(1);
    checkoutBtn.disabled = total < (merchant?.minOrder || 0);
    checkoutBtn.textContent =
      total < (merchant?.minOrder || 0)
        ? `还差 ¥${((merchant?.minOrder || 0) - total).toFixed(1)} 起送`
        : '去结算';
  } else {
    cartBar.hidden = true;
  }
}

function bindEvents() {
  menuTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.menu-tab');
    if (!tab) return;
    activeSection = Number(tab.dataset.index);
    menuTabs.querySelectorAll('.menu-tab').forEach((t) => {
      t.classList.toggle('active', t === tab);
    });
    renderMenu(menu.sections);
  });

  menuList.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-add');
    if (!btn) return;
    const item = itemMap.get(Number(btn.dataset.id));
    if (!item) return;
    if (Cart.add(merchantId, item)) {
      updateCartBar();
      btn.textContent = '✓';
      setTimeout(() => { btn.textContent = '+'; }, 400);
    }
  });

  checkoutBtn.addEventListener('click', () => {
    const cart = Cart.load();
    const subtotal = Cart.getTotal(cart);
    if (subtotal < merchant.minOrder) return;

    const order = OrderStore.createOrder({
      merchant,
      cartItems: cart.items,
      total: subtotal,
    });
    Cart.clear();
    updateCartBar();
    location.href = `tracking.html?id=${order.id}`;
  });
}

async function init() {
  if (!merchantId) {
    location.href = 'discover.html';
    return;
  }

  merchant = await FoodAPI.getMerchant(merchantId);
  if (!merchant) {
    location.href = 'discover.html';
    return;
  }

  menu = await FoodAPI.getMerchantMenu(merchantId);
  menu.sections.forEach((s) => s.items.forEach((i) => itemMap.set(i.id, i)));
  const reviews = await FoodAPI.getMerchantReviews(merchantId);

  document.title = `${merchant.name} - 外卖省钱助手`;
  renderHeader(merchant);
  renderMenuTabs(menu.sections);
  renderMenu(menu.sections);
  renderReviews(reviews);
  bindEvents();
  updateCartBar();
}

init();
