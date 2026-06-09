const couponList = document.getElementById('couponList');
const couponTabs = document.getElementById('couponTabs');
const availableCountEl = document.getElementById('availableCount');
const totalSavingEl = document.getElementById('totalSaving');

let currentStatus = 'available';
let allCoupons = [];

function formatExpire(dateStr) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日到期`;
}

function renderCoupons(coupons) {
  if (!coupons.length) {
    const emptyMsg = {
      available: '暂无可用优惠券',
      used: '还没有使用记录',
      expired: '没有过期优惠券',
    };
    couponList.innerHTML = `
      <div class="empty-state">
        <span class="empty-emoji">🎫</span>
        <p>${emptyMsg[currentStatus]}</p>
      </div>
    `;
    return;
  }

  couponList.innerHTML = coupons
    .map((c) => {
      const disabled = c.status !== 'available';
      return `
        <div class="coupon-card ${c.status}" data-id="${c.id}">
          <div class="coupon-left">
            <div class="coupon-amount">
              <span class="amount-symbol">¥</span>
              <span class="amount-num">${c.amount}</span>
            </div>
            <div class="coupon-condition">满${c.minSpend}可用</div>
          </div>
          <div class="coupon-notch coupon-notch-top"></div>
          <div class="coupon-notch coupon-notch-bottom"></div>
          <div class="coupon-right">
            <div class="coupon-title">${c.title}</div>
            <div class="coupon-desc">${c.desc}</div>
            <div class="coupon-footer">
              <span class="coupon-platform">${c.platform}</span>
              <span class="coupon-expire">${formatExpire(c.expire)}</span>
            </div>
            ${
              c.status === 'available'
                ? `<button class="coupon-use-btn" data-id="${c.id}">去使用</button>`
                : `<span class="coupon-status-label">${c.status === 'used' ? '已使用' : '已过期'}</span>`
            }
          </div>
        </div>
      `;
    })
    .join('');
}

function updateSummary() {
  const available = allCoupons.filter((c) => c.status === 'available');
  availableCountEl.textContent = available.length;
  totalSavingEl.textContent = available.reduce((sum, c) => sum + c.amount, 0);
}

async function loadCoupons(status) {
  currentStatus = status;
  couponList.innerHTML = '<div class="loading-spinner"></div>';

  couponTabs.querySelectorAll('.coupon-tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.status === status);
  });

  const coupons = await FoodAPI.getCoupons(status);
  renderCoupons(coupons);
}

function bindEvents() {
  couponTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.coupon-tab');
    if (!tab || tab.dataset.status === currentStatus) return;
    loadCoupons(tab.dataset.status);
  });

  couponList.addEventListener('click', (e) => {
    const btn = e.target.closest('.coupon-use-btn');
    if (!btn) return;
    const coupon = allCoupons.find((c) => c.id === Number(btn.dataset.id));
    if (coupon) {
      btn.textContent = '已选择 ✓';
      btn.disabled = true;
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 600);
    }
  });
}

async function init() {
  initBottomNav('coupons');
  bindEvents();

  allCoupons = await FoodAPI.getCoupons('all');
  updateSummary();
  await loadCoupons('available');
}

init();
