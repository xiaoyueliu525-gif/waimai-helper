const categoryFilters = document.getElementById('categoryFilters');
const merchantList = document.getElementById('merchantList');

let allMerchants = [];
let currentCategory = 'all';
let sortBy = 'default';

function renderFilters(categories) {
  const chips = categories
    .map(
      (c) => `<button class="filter-chip" data-category="${c.id}">${c.emoji} ${c.name}</button>`
    )
    .join('');
  categoryFilters.insertAdjacentHTML('beforeend', chips);
}

function sortMerchants(merchants) {
  const list = [...merchants];
  if (sortBy === 'distance') {
    list.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  } else if (sortBy === 'sales') {
    list.sort((a, b) => {
      const sa = parseInt(a.sales.replace(/\D/g, ''), 10) || 0;
      const sb = parseInt(b.sales.replace(/\D/g, ''), 10) || 0;
      return sb - sa;
    });
  }
  return list;
}

function renderMerchants(merchants) {
  if (!merchants.length) {
    merchantList.innerHTML = `
      <div class="empty-state">
        <span class="empty-emoji">🏪</span>
        <p>该分类暂无商家</p>
      </div>
    `;
    return;
  }

  merchantList.innerHTML = sortMerchants(merchants)
    .map(
      (m) => `
      <a href="merchant.html?id=${m.id}" class="discover-card">
        <div class="discover-card-emoji">${m.emoji}</div>
        <div class="discover-card-body">
          <div class="discover-card-top">
            <span class="discover-card-name">${m.name}</span>
            <span class="rating">⭐ ${m.rating}</span>
          </div>
          <div class="discover-card-meta">
            <span>${m.sales}</span>
            <span>${m.deliveryTime}</span>
            <span>${m.distance}</span>
          </div>
          <div class="merchant-tags">
            ${m.tags.map((t) => `<span class="merchant-tag">${t}</span>`).join('')}
          </div>
          <div class="discover-card-footer">
            <span>起送 ¥${m.minOrder}</span>
            <span>配送 ¥${m.deliveryFee}</span>
          </div>
        </div>
      </a>
    `
    )
    .join('');
}

function filterMerchants() {
  const filtered =
    currentCategory === 'all'
      ? allMerchants
      : allMerchants.filter((m) => m.category === currentCategory);
  renderMerchants(filtered);
}

function bindEvents() {
  categoryFilters.addEventListener('click', (e) => {
    const chip = e.target.closest('.filter-chip');
    if (!chip) return;
    currentCategory = chip.dataset.category;
    categoryFilters.querySelectorAll('.filter-chip').forEach((c) => {
      c.classList.toggle('active', c === chip);
    });
    filterMerchants();
  });

  document.querySelector('.discover-sort').addEventListener('click', (e) => {
    const span = e.target.closest('span');
    if (!span) return;
    const labels = ['综合排序', '距离最近', '销量最高'];
    const keys = ['default', 'distance', 'sales'];
    const idx = labels.indexOf(span.textContent);
    if (idx === -1) return;
    sortBy = keys[idx];
    document.querySelectorAll('.discover-sort span').forEach((s) => {
      s.classList.toggle('active', s === span);
    });
    filterMerchants();
  });
}

async function init() {
  initBottomNav('discover');
  bindEvents();

  const [categories, merchants] = await Promise.all([
    FoodAPI.getCategories(),
    FoodAPI.getMerchants(),
  ]);

  allMerchants = merchants;
  renderFilters(categories);
  renderMerchants(merchants);
}

init();
