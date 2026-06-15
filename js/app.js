const categoriesGrid = document.getElementById('categoriesGrid');
const dealsList = document.getElementById('dealsList');
const hotTagsEl = document.getElementById('hotTags');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchResults = document.getElementById('searchResults');
const searchResultsBody = document.getElementById('searchResultsBody');
const clearSearchBtn = document.getElementById('clearSearch');
const mainContent = document.getElementById('mainContent');
const dealsSection = document.getElementById('dealsSection');
const lotteryBtn = document.getElementById('lotteryBtn');
const lotteryModal = document.getElementById('lotteryModal');
const slotPhase = document.getElementById('slotPhase');
const resultPhase = document.getElementById('resultPhase');
const slotReel = document.getElementById('slotReel');
const modalEmoji = document.getElementById('modalEmoji');
const modalResult = document.getElementById('modalResult');
const modalTip = document.getElementById('modalTip');
const retryBtn = document.getElementById('retryBtn');
const acceptBtn = document.getElementById('acceptBtn');
const headerCouponBadge = document.getElementById('headerCouponBadge');

function renderCategories(categories) {
  categoriesGrid.innerHTML = categories
    .map(
      (cat) => `
      <div class="category-item" data-id="${cat.id}" data-name="${cat.name}">
        <div class="category-icon ${cat.class}">${cat.emoji}</div>
        <span class="category-name">${cat.name}</span>
      </div>
    `
    )
    .join('');
}

function renderDeals(deals) {
  dealsList.innerHTML = deals
    .map(
      (deal) => `
      <div class="deal-card" data-name="${deal.name}" data-merchant-id="${deal.merchantId || ''}">
        <div class="deal-image ${deal.bg}">${deal.emoji}</div>
        <div class="deal-info">
          <div class="deal-name">${deal.name}</div>
          <div class="deal-desc">${deal.desc}</div>
          <div class="deal-bottom">
            <div class="deal-price">
              <span class="price-now">${deal.price}</span>
              <span class="price-old">¥${deal.oldPrice}</span>
            </div>
            <span class="deal-tag">${deal.tag}</span>
          </div>
        </div>
      </div>
    `
    )
    .join('');
}

function renderHotTags(tags) {
  hotTagsEl.innerHTML = tags
    .slice(0, 6)
    .map((tag) => `<span class="hot-tag" data-keyword="${tag}">${tag}</span>`)
    .join('');
}

async function renderPlatformCards(keyword) {
  const offers = await PlatformCompare.getOffers(keyword);
  const bestPrice = PlatformCompare.getBestPrice(offers);

  return `
    <p class="result-group-title">平台比价 · 「${keyword}」</p>
    <div class="platform-cards">
      ${offers
        .map(
          (p) => `
        <div class="platform-card ${p.theme}" data-platform="${p.id}" data-keyword="${keyword}">
          <div class="platform-card-header">
            <div class="platform-logo">${p.icon}</div>
            <span class="platform-name">${p.name}</span>
            ${Math.abs(p.price - bestPrice) < 0.01 ? '<span class="platform-best">最低价</span>' : ''}
          </div>
          <div class="platform-card-body">
            <div class="platform-shop">${p.shop}</div>
            <div class="platform-price-row">
              <span class="platform-price">¥${p.price}</span>
              <span class="platform-price-unit">起</span>
            </div>
            <div class="platform-tags">
              <span class="platform-tag">${p.coupon}</span>
              <span class="platform-tag muted">${p.delivery}</span>
            </div>
            ${
              p.discounts
                ? `<div class="platform-shops">商品¥${p.productPrice} · 包装¥${p.packageFee} · 配送¥${p.deliveryFee} · 优惠¥${p.discounts.total}</div>`
                : ''
            }
            <div class="platform-shops">${p.shops} 家相关店铺</div>
          </div>
          <button class="platform-go-btn" data-platform="${p.id}">去下单</button>
        </div>
      `
        )
        .join('')}
    </div>
  `;
}

async function renderSearchResults(data, keyword) {
  let html = await renderPlatformCards(keyword);

  if (data.total === 0) {
    html += `
      <p class="result-group-title local-results">站内推荐</p>
      <div class="empty-state compact">
        <p class="empty-hint">站内暂无更多结果，可点击上方平台卡片比价下单</p>
      </div>
    `;
    searchResultsBody.innerHTML = html;
    return;
  }

  html += `<p class="result-group-title local-results">站内推荐</p>`;

  if (data.merchants.length) {
    html += `<p class="result-group-title">商家 (${data.merchants.length})</p>`;
    html += data.merchants
      .map(
        (m) => `
        <a href="merchant.html?id=${m.id}" class="merchant-card">
          <div class="merchant-emoji">${m.emoji}</div>
          <div class="merchant-info">
            <div class="merchant-name">${m.name}</div>
            <div class="merchant-meta">
              <span class="rating">⭐ ${m.rating}</span>
              <span>${m.sales}</span>
            </div>
            <div class="merchant-tags">
              ${m.tags.map((t) => `<span class="merchant-tag">${t}</span>`).join('')}
            </div>
          </div>
        </a>
      `
      )
      .join('');
  }

  if (data.foods.length) {
    html += `<p class="result-group-title">菜品 (${data.foods.length})</p>`;
    html += data.foods
      .map(
        (f) => `
        <div class="food-result-card">
          <span class="food-result-emoji">${f.emoji}</span>
          <div>
            <div class="food-result-name">${f.name}</div>
            <div class="food-result-tip">${f.tip}</div>
          </div>
        </div>
      `
      )
      .join('');
  }

  if (data.deals.length) {
    html += `<p class="result-group-title">特惠 (${data.deals.length})</p>`;
    html += data.deals
      .map(
        (d) => `
        <div class="deal-card compact" data-name="${d.name}" data-merchant-id="${d.merchantId || ''}">
          <div class="deal-image ${d.bg}">${d.emoji}</div>
          <div class="deal-info">
            <div class="deal-name">${d.name}</div>
            <div class="deal-desc">${d.desc}</div>
            <div class="deal-bottom">
              <div class="deal-price">
                <span class="price-now">${d.price}</span>
                <span class="price-old">¥${d.oldPrice}</span>
              </div>
              <span class="deal-tag">${d.tag}</span>
            </div>
          </div>
        </div>
      `
      )
      .join('');
  }

  searchResultsBody.innerHTML = html;
}

function showSearchMode(show) {
  searchResults.hidden = !show;
  mainContent.hidden = show;
  dealsSection.hidden = show;
}

async function handleSearch() {
  const keyword = searchInput.value.trim();
  if (!keyword) {
    searchInput.focus();
    return;
  }

  searchBtn.disabled = true;
  searchBtn.textContent = '搜索中';
  showSearchMode(true);
  searchResultsBody.innerHTML = '<div class="loading-spinner"></div>';

  const data = await FoodAPI.search(keyword);
  await renderSearchResults(data, keyword);

  searchBtn.disabled = false;
  searchBtn.textContent = '搜索';
}

function clearSearch() {
  searchInput.value = '';
  showSearchMode(false);
}

function getLotteryElements() {
  return {
    modal: lotteryModal,
    slotPhase,
    resultPhase,
    reelEl: slotReel,
    modalEmoji,
    modalResult,
    modalTip,
  };
}

async function openLottery() {
  if (Lottery.isRunning) return;
  lotteryBtn.classList.add('spinning');
  await Lottery.run(getLotteryElements());
  lotteryBtn.classList.remove('spinning');
}

function bindEvents() {
  lotteryBtn.addEventListener('click', openLottery);
  retryBtn.addEventListener('click', async () => {
    if (Lottery.isRunning) return;
    resultPhase.classList.remove('show');
    await Lottery.run(getLotteryElements());
  });
  acceptBtn.addEventListener('click', () => Lottery.close(lotteryModal));

  lotteryModal.addEventListener('click', (e) => {
    if (e.target === lotteryModal && !Lottery.isRunning) {
      Lottery.close(lotteryModal);
    }
  });

  searchBtn.addEventListener('click', handleSearch);
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
  clearSearchBtn.addEventListener('click', clearSearch);

  hotTagsEl.addEventListener('click', (e) => {
    const tag = e.target.closest('.hot-tag');
    if (!tag) return;
    searchInput.value = tag.dataset.keyword;
    handleSearch();
  });

  categoriesGrid.addEventListener('click', (e) => {
    const item = e.target.closest('.category-item');
    if (!item) return;
    searchInput.value = item.dataset.name;
    handleSearch();
  });

  dealsList.addEventListener('click', async (e) => {
    const card = e.target.closest('.deal-card');
    if (!card) return;
    const mid = card.dataset.merchantId;
    if (mid) {
      location.href = `merchant.html?id=${mid}`;
      return;
    }
    const m = await FoodAPI.findMerchantByName(card.dataset.name);
    location.href = m ? `merchant.html?id=${m.id}` : 'discover.html';
  });

  searchResultsBody.addEventListener('click', (e) => {
    const platformBtn = e.target.closest('.platform-go-btn, .platform-card');
    if (platformBtn) {
      const card = e.target.closest('.platform-card');
      if (!card) return;
      const names = { meituan: '美团', taobao: '淘宝闪购', jd: '京东秒送' };
      const platform = card.dataset.platform;
      const kw = card.dataset.keyword;
      alert(`正在跳转 ${names[platform]}\n搜索「${kw}」\n（演示功能，可接入各平台 deeplink）`);
      return;
    }
  });

  searchResultsBody.addEventListener('click', async (e) => {
    if (e.target.closest('.platform-card')) return;
    if (e.target.closest('a.merchant-card')) return;
    const deal = e.target.closest('.deal-card');
    if (!deal) return;
    const mid = deal.dataset.merchantId;
    if (mid) {
      location.href = `merchant.html?id=${mid}`;
      return;
    }
    const m = await FoodAPI.findMerchantByName(deal.dataset.name);
    location.href = m ? `merchant.html?id=${m.id}` : 'discover.html';
  });
}

async function init() {
  bindEvents();
  initBottomNav('home');

  const [categories, deals, hotTags, couponCount] = await Promise.all([
    FoodAPI.getCategories(),
    FoodAPI.getDeals(3),
    FoodAPI.getHotTags(),
    FoodAPI.getAvailableCouponCount(),
  ]);

  renderCategories(categories);
  renderDeals(deals);
  renderHotTags(hotTags);
  headerCouponBadge.textContent = couponCount;
}

init();
